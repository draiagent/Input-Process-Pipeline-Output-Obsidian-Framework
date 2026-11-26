// skill-glucose-analyzer：血糖波形分析員
// 狀態機：pending → sanitized → executed → verify → done | human_review（錯誤 → failed）
// 呼叫方式：POST /functions/v1/skill-glucose-analyzer，帶會員 JWT，body: { "days": 14, "question": "..." }
//
// 需要的 secrets：ANTHROPIC_API_KEY（SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY 平台自帶）

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";

const MODEL = "claude-sonnet-5-5";
const LOW = 70;   // 紅線：低血糖 mg/dL
const HIGH = 250; // 紅線：高血糖 mg/dL
const SKILL = "skill-glucose-analyzer";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

type Reading = { ts: string; glucose_mgdl: number };
type Meal = { ts: string; carbs_g: number | null; note: string | null };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  // 使用者 client：讀資料一律受 RLS 限制（紅線③：service role 不出 Edge Function）
  const userDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  // service client：只用來寫稽核紀錄與狀態轉移
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: { user } } = await userDb.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const days = Math.min(Math.max(Number(body.days) || 14, 1), 30);
  const question = typeof body.question === "string" ? body.question.slice(0, 500) : "";

  // 1. Pending
  const { data: log, error: logErr } = await admin.from("agent_audit_logs")
    .insert({ agent: "glucose-coach", skill: SKILL, user_id: user.id, input: { days, question } })
    .select("id").single();
  if (logErr) return json({ error: logErr.message }, 500);
  const logId = log.id as number;

  try {
    // 讀資料（RLS：只拿得到本人的）
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const [{ data: readings, error: rErr }, { data: meals, error: mErr }] = await Promise.all([
      userDb.from("cgm_readings").select("ts, glucose_mgdl").gte("ts", since).order("ts"),
      userDb.from("meal_logs").select("ts, carbs_g, note").gte("ts", since).order("ts"),
    ]);
    if (rErr || mErr) throw new Error((rErr ?? mErr)!.message);
    if (!readings?.length) throw new Error("no CGM readings in window");

    // 2. Sanitized：去識別化，只留相對時間與數值（紅線①）
    const t0 = new Date(readings[0].ts).getTime();
    const rel = (ts: string) => Math.round((new Date(ts).getTime() - t0) / 60000); // 分鐘
    const clean = {
      readings: (readings as Reading[]).map((r) => ({ m: rel(r.ts), g: Number(r.glucose_mgdl) })),
      meals: (meals as Meal[] ?? []).map((m) => ({ m: rel(m.ts), carbs: m.carbs_g, note: scrub(m.note) })),
      question: scrub(question),
    };
    await setStatus(admin, logId, "sanitized");

    // 3. Executed：確定性指標由程式算，不交給 LLM
    const stats = analyze(clean.readings, clean.meals);
    const kb = await retrieveKb(userDb, stats);
    const advice = await callClaude(stats, kb, clean.question);
    await setStatus(admin, logId, "executed", { tools_used: ["cgm_readings_query", "meal_log_query", "rag_search", "llm"] });

    // 4. Verify：紅線驗證
    const flags: string[] = [];
    if (stats.min < LOW) flags.push(`low<${LOW}`);
    if (stats.max > HIGH) flags.push(`high>${HIGH}`);
    if (!advice.citations.length || advice.citations.some((c) => !kb.some((k) => k.id === c))) flags.push("missing_or_invalid_citation");
    if (/診斷|確診|處方|藥量|劑量|停藥|加藥|胰島素.{0,4}(單位|調整)/.test(advice.text)) flags.push("medical_directive");

    const verify_result = { flags, citations: advice.citations };
    await setStatus(admin, logId, "verify", { verify_result });

    // 5/6. 紅線觸發 → Human Review；否則 Done
    const output = { stats, advice: advice.text, citations: advice.citations };
    if (flags.length) {
      await setStatus(admin, logId, "human_review", { output, needs_review: true });
      return json({ log_id: logId, status: "human_review", stats, message: "已轉交教練審核，稍後回覆您。" });
    }
    await setStatus(admin, logId, "done", { output });
    return json({ log_id: logId, status: "done", stats, advice: advice.text, citations: advice.citations });
  } catch (e) {
    await setStatus(admin, logId, "failed", { output: { error: String(e) } }).catch(() => {});
    return json({ log_id: logId, status: "failed", error: String(e) }, 500);
  }
});

// ---------- 工具函式 ----------

async function setStatus(db: SupabaseClient, id: number, status: string, extra: Record<string, unknown> = {}) {
  const { error } = await db.from("agent_audit_logs").update({ status, ...extra }).eq("id", id);
  if (error) throw new Error(`status ${status}: ${error.message}`);
}

/** 去除電話、Email、身分證字號、LINE ID 等可識別資訊 */
function scrub(s: string | null): string | null {
  if (!s) return s;
  return s
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/\b[A-Z][12]\d{8}\b/g, "[id]")
    .replace(/(\+?886|0)9\d{2}[-\s]?\d{3}[-\s]?\d{3}/g, "[phone]")
    .replace(/@[\w.-]{3,}/g, "[handle]");
}

function analyze(r: { m: number; g: number }[], meals: { m: number; carbs: number | null; note: string | null }[]) {
  const g = r.map((x) => x.g);
  const n = g.length;
  const mean = g.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(g.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  const pct = (f: (v: number) => boolean) => Math.round((g.filter(f).length / n) * 1000) / 10;

  // 餐後 2 小時峰值與增幅
  const postMeal = meals.map((meal) => {
    const base = nearest(r, meal.m);
    const window = r.filter((x) => x.m >= meal.m && x.m <= meal.m + 120);
    const peak = window.length ? Math.max(...window.map((x) => x.g)) : null;
    return { at_min: meal.m, carbs: meal.carbs, note: meal.note, baseline: base, peak, rise: peak && base ? peak - base : null };
  });
  const spikes = postMeal.filter((p) => (p.rise ?? 0) >= 50).sort((a, b) => (b.rise ?? 0) - (a.rise ?? 0)).slice(0, 5);

  return {
    readings: n,
    mean: Math.round(mean),
    gmi: Math.round((3.31 + 0.02392 * mean) * 10) / 10, // Glucose Management Indicator（%）
    cv: Math.round((sd / mean) * 1000) / 10,              // 變異係數，<36% 為穩定
    tir: pct((v) => v >= 70 && v <= 180),                 // Time in Range 70–180
    tbr: pct((v) => v < 70),
    tar: pct((v) => v > 180),
    min: Math.min(...g),
    max: Math.max(...g),
    top_spikes: spikes,
  };
}

function nearest(r: { m: number; g: number }[], m: number): number | null {
  let best: { m: number; g: number } | null = null;
  for (const x of r) if (x.m <= m && (!best || x.m > best.m)) best = x;
  return best && m - best.m <= 30 ? best.g : null;
}

/** 衛教知識檢索：依指標挑關鍵字查 kb_documents（之後可換成 match_kb 向量檢索） */
async function retrieveKb(db: SupabaseClient, stats: ReturnType<typeof analyze>) {
  const topics = ["餐後血糖", "TIR"];
  if (stats.cv >= 36) topics.push("血糖變異");
  if (stats.tbr > 0) topics.push("低血糖");
  if (stats.tar > 25) topics.push("高血糖");
  const { data, error } = await db.from("kb_documents").select("id, chunk")
    .eq("domain", "glucose")
    .or(topics.map((t) => `chunk.ilike.*${t}*`).join(","))
    .limit(6);
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: number; chunk: string }[];
}

async function callClaude(stats: unknown, kb: { id: number; chunk: string }[], question: string | null) {
  const system = `你是 CGM 血糖教練的分析助理。依據提供的去識別化血糖指標與衛教知識，用繁體中文給會員 3 個可立即執行的生活建議（飲食順序、餐後活動、作息等）。
規則：
- 不做診斷、不建議任何藥物或劑量調整；涉及用藥一律請會員與醫師討論。
- 每個建議都必須引用至少一則知識庫片段，只能引用下方提供的 id。
- 只輸出 JSON：{"advice": "給會員的文字", "citations": [知識庫 id, ...]}`;

  const user = JSON.stringify({
    stats,
    knowledge: kb.map((k) => ({ id: k.id, text: k.chunk })),
    member_question: question || null,
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 1200, system, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const msg = await res.json();
  const text: string = msg.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { text, citations: [] as number[] };
  try {
    const parsed = JSON.parse(match[0]);
    return {
      text: String(parsed.advice ?? ""),
      citations: Array.isArray(parsed.citations) ? parsed.citations.map(Number).filter(Number.isFinite) : [],
    };
  } catch {
    return { text, citations: [] as number[] };
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, "content-type": "application/json" } });
}
