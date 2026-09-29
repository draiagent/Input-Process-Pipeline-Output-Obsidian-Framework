import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import {
  AgentCore,
  AttributionBar,
  Caption,
  CornerTitle,
  Glass,
  GradientText,
  SceneFade,
  TechBackground,
  useEnter,
} from "./components";
import { C, FONT_EN, FONT_ZH, GRAD_WARM, SCENES } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Frame: React.FC<{ page: number; tint?: string; children: React.ReactNode }> = ({
  page,
  tint,
  children,
}) => (
  <AbsoluteFill>
    <TechBackground tint={tint} />
    <SceneFade>{children}</SceneFade>
    <AttributionBar page={page} total={SCENES} />
  </AbsoluteFill>
);

/* ───────── 1. 封面：這個月的陳董 ───────── */
export const SceneCover: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useEnter(0, 11);
  const t1 = useEnter(10);
  const t2 = useEnter(20);
  const t3 = useEnter(32);
  return (
    <Frame page={1}>
      <div style={{ position: "absolute", left: 130, top: 190 }}>
        <div style={{ position: "absolute", left: -60, top: -60, opacity: logo }}>
          <AgentCore size={560} label="" color={C.cyan} />
        </div>
        <div
          style={{
            width: 440,
            height: 440,
            borderRadius: 60,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 80px ${C.cyan}, 0 0 160px ${C.blue}88`,
            transform: `scale(${logo}) rotate(${(1 - logo) * -90}deg)`,
          }}
        >
          <Img src={staticFile("easycure-logo.png")} style={{ width: 400, height: 400 }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 760, top: 150, right: 90 }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: FONT_EN,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 6,
            color: C.gold,
            border: `3px solid ${C.orange}`,
            borderRadius: 40,
            padding: "8px 28px",
            opacity: t1,
            boxShadow: `0 0 24px ${C.orange}88`,
          }}
        >
          2026 · SEPTEMBER · 進化紀錄
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FONT_ZH,
            fontWeight: 900,
            fontSize: 132,
            color: C.white,
            lineHeight: 1.1,
            opacity: t1,
            transform: `translateX(${(1 - t1) * 80}px)`,
          }}
        >
          這個月的陳董
        </div>
        <div style={{ opacity: t2, transform: `translateX(${(1 - t2) * 80}px)`, lineHeight: 1.2 }}>
          <GradientText size={158}>進化速度 </GradientText>
          <GradientText size={170} font={FONT_EN}>
            ×{Math.min(10, Math.floor(interpolate(frame, [20, 80], [1, 10], clamp)))}
          </GradientText>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT_ZH,
            fontWeight: 700,
            fontSize: 54,
            color: "#cbd5e1",
            opacity: t3,
          }}
        >
          從 AI 使用者 → <span style={{ color: C.cyan }}>AI Agent 架構師</span>
        </div>
      </div>
      <Caption text="一個月，完成一次「系統級」升級" highlight="系統級" delay={40} />
    </Frame>
  );
};

/* ───────── 2. 看影片 → 建框架：IPPOO 管線 ───────── */
const LAYERS = [
  { en: "Input", zh: "粗整理" },
  { en: "Process", zh: "邏輯驗證" },
  { en: "Pipeline", zh: "自動化" },
  { en: "Output", zh: "視覺化" },
  { en: "Obsidian", zh: "記憶中樞" },
];

export const ScenePipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [40, 110], [0, 1], clamp);
  return (
    <Frame page={2}>
      <CornerTitle text="看影片" side="left" top={70} />
      <CornerTitle text="建框架" side="right" top={70} delay={60} dim />

      {LAYERS.map((l, i) => {
        const e = useEnter(8 + i * 7);
        const lit = beam > i / LAYERS.length;
        return (
          <div
            key={l.en}
            style={{
              position: "absolute",
              left: 90 + i * 205,
              top: 300 - i * 6,
              width: 245,
              height: 440 + i * 12,
              transform: `perspective(1400px) rotateY(24deg) translateY(${(1 - e) * 120}px)`,
              opacity: e,
            }}
          >
            <Glass
              color={lit ? C.cyan : "#5b6b9a"}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 120, color: lit ? C.cyan : C.white }}>
                {l.en[0]}
              </div>
              <div style={{ fontFamily: FONT_EN, fontWeight: 700, fontSize: 34, color: C.white }}>{l.en}</div>
              <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, color: C.gray }}>{l.zh}</div>
            </Glass>
          </div>
        );
      })}

      {/* 光束 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="beam" x1="0" x2="1">
            <stop offset="0" stopColor={C.cyan} stopOpacity="0" />
            <stop offset="0.4" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
        </defs>
        <path
          d="M 180 540 C 600 520, 900 560, 1180 520 S 1400 520, 1560 520"
          stroke="url(#beam)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - beam}
          style={{ filter: `drop-shadow(0 0 16px ${C.cyan})` }}
        />
      </svg>

      <div style={{ position: "absolute", left: 1185, top: 330, opacity: useEnter(70) }}>
        <Glass
          color={C.blue}
          style={{
            width: 190,
            height: 380,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 40, color: C.white }}>IPPOO™</div>
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 100, color: C.cyan }}>{"{ }"}</div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 32, color: C.gray }}>SOP</div>
        </Glass>
      </div>
      <div style={{ position: "absolute", left: 1430, top: 340, transform: `scale(${useEnter(95)})` }}>
        <AgentCore size={380} />
      </div>
      <Caption text="讓 AI 幫你快，讓框架幫你準" highlight="讓框架幫你準" delay={45} />
    </Frame>
  );
};

/* ───────── 3. 碎片 → SSOT 壓縮 ───────── */
const PixelCube: React.FC<{ n: number; cell: number; messy: boolean; seed: string }> = ({ n, cell, messy, seed }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: n * cell, height: n * cell }}>
      {new Array(n * n).fill(0).map((_, i) => {
        const r = random(`${seed}${i}`);
        const jx = messy ? (random(`${seed}x${i}`) - 0.5) * cell * 1.6 : 0;
        const jy = messy ? (random(`${seed}y${i}`) - 0.5) * cell * 1.6 : 0;
        const col = messy ? (r > 0.82 ? C.orange : r > 0.4 ? C.blue : "#7dd3fc") : C.cyan;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i % n) * cell + jx,
              top: Math.floor(i / n) * cell + jy,
              width: cell - 4,
              height: cell - 4,
              background: `${col}${messy ? "aa" : "dd"}`,
              border: `1px solid ${col}`,
              boxShadow: `0 0 10px ${col}`,
              opacity: messy ? 0.35 + 0.6 * Math.abs(Math.sin(frame / 12 + i)) : 0.9,
            }}
          />
        );
      })}
    </div>
  );
};

export const SceneCompress: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = (frame % 40) / 40;
  const stat = useEnter(70, 10);
  return (
    <Frame page={3} tint={C.orange}>
      <div style={{ position: "absolute", left: 110, top: 70, fontFamily: FONT_ZH, fontWeight: 900, fontSize: 96, color: C.white }}>
        碎片資訊 <span style={{ color: C.orange }}>→</span> 結構化知識
      </div>

      <div style={{ position: "absolute", left: 110, top: 300, opacity: useEnter(5) }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, color: C.gray, marginBottom: 20 }}>影片・貼文・筆記</div>
        <PixelCube n={9} cell={46} messy seed="a" />
      </div>

      {/* 資料流線 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {new Array(14).fill(0).map((_, i) => {
          const y0 = 380 + i * 26;
          const d = `M 540 ${y0} C 640 ${y0}, 660 560, 770 560`;
          return (
            <path
              key={i}
              d={d}
              stroke={i % 3 ? C.cyan : C.orange}
              strokeWidth={3}
              fill="none"
              pathLength={1}
              strokeDasharray="0.15 0.85"
              strokeDashoffset={-flow - i * 0.07}
              opacity={0.8}
            />
          );
        })}
      </svg>

      {/* 核心晶片 */}
      <div style={{ position: "absolute", left: 770, top: 330, transform: `scale(${useEnter(20)})` }}>
        <Glass
          color={C.orange}
          style={{
            width: 440,
            height: 460,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(${C.orange}22 2px, transparent 2px), linear-gradient(90deg, ${C.orange}22 2px, transparent 2px)`,
            backgroundSize: "44px 44px",
          }}
        >
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 64, color: C.white, letterSpacing: 4 }}>IPPOO</div>
          <div
            style={{
              marginTop: 20,
              padding: "18px 40px",
              border: `4px solid ${C.cyan}`,
              borderRadius: 16,
              background: "rgba(5,10,30,0.9)",
              boxShadow: `0 0 40px ${C.cyan}`,
              fontFamily: FONT_EN,
              fontWeight: 900,
              fontSize: 84,
              color: C.white,
            }}
          >
            SSOT
          </div>
          <div style={{ marginTop: 20, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 36, color: C.gold }}>唯一事實來源</div>
        </Glass>
      </div>

      <div style={{ position: "absolute", left: 1290, top: 430, opacity: useEnter(45) }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 34, color: C.gray, marginBottom: 16 }}>Obsidian</div>
        <PixelCube n={4} cell={44} messy={false} seed="b" />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1540,
          top: 330,
          opacity: stat,
          transform: `translateY(${(1 - stat) * 60}px)`,
          lineHeight: 1.05,
        }}
      >
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 110, color: C.white }}>
          雜訊<span style={{ color: C.cyan }}>↓</span>
        </div>
        <div>
          <GradientText size={110} grad={GRAD_WARM}>
            精準↑
          </GradientText>
        </div>
      </div>
      <Caption text="把碎片資訊，壓縮成唯一事實來源" highlight="唯一事實來源" delay={30} />
    </Frame>
  );
};

/* ───────── 4. Skills 技能包 Snapshot / Restore ───────── */
const SKILLS = [
  "品牌調度中心",
  "暗黑科技風",
  "雙品牌玻璃",
  "吉祥物圖卡",
  "五色清單卡",
  "晰步教學卡",
  "精品電商 UI",
  "十大倉庫歸檔",
  "揮桿影片教練",
  "AI 揮桿拆幀",
  "蘇格拉底提問",
  "超級知識系統",
];

export const SceneSkills: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useEnter(0, 12);
  const count = Math.round(interpolate(frame, [20, 100], [0, 12], clamp));
  return (
    <Frame page={4} tint={C.orange}>
      <div style={{ position: "absolute", left: 110, top: 60, opacity: card }}>
        <span style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 150, color: C.gold, textShadow: `0 0 40px ${C.orange}` }}>
          {count}
        </span>
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 92, color: C.white }}> 套專屬 Skills</span>
      </div>

      {/* 橘色堆疊卡 */}
      <div style={{ position: "absolute", left: 120, top: 300, transform: `scale(${card})` }}>
        {[2, 1, 0].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: -k * 22,
              top: k * 10,
              width: 520,
              height: 520,
              borderRadius: 50,
              border: `4px solid ${C.orange}`,
              background: k === 0 ? "rgba(60,25,5,0.85)" : "rgba(60,25,5,0.4)",
              boxShadow: `0 0 ${k === 0 ? 90 : 30}px ${C.orange}`,
            }}
          />
        ))}
        <div
          style={{
            position: "relative",
            width: 520,
            height: 520,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 150,
                height: 150,
                marginTop: i ? -110 : 0,
                background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`,
                transform: `rotateX(60deg) rotateZ(45deg) translateY(${Math.sin(frame / 15 + i) * 6}px)`,
                boxShadow: `0 0 30px ${C.orange}`,
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
          <div style={{ marginTop: 70, fontFamily: FONT_EN, fontWeight: 900, fontSize: 78, color: C.white }}>Snapshot</div>
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 62, color: C.white }}>/ Restore</div>
        </div>
      </div>

      {/* 技能 Sandbox 卡 */}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 240,
          width: 1100,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 22,
        }}
      >
        {SKILLS.map((s, i) => {
          const e = useEnter(20 + i * 6, 13);
          return (
            <div key={s} style={{ opacity: e, transform: `translateX(${(1 - e) * -200}px) scale(${0.7 + 0.3 * e})` }}>
              <Glass
                color={i % 2 ? C.blue : C.cyan}
                style={{
                  height: 128,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 22px",
                  borderRadius: 18,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `3px solid ${C.cyan}`,
                    transform: "rotate(45deg)",
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${C.cyan}`,
                  }}
                />
                <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 38, color: C.white, whiteSpace: "nowrap" }}>{s}</div>
              </Glass>
            </div>
          );
        })}
      </div>
      <Caption text="把經驗打包成技能，隨時一鍵 Restore" highlight="一鍵 Restore" delay={60} />
    </Frame>
  );
};

/* ───────── 5. 路徑探索：跨界 × N ───────── */
const LINES = [
  "益力康生技",
  "CGM 血糖教練",
  "益生寵愛",
  "AI 認證講師",
  "南大 EMBA",
  "高爾夫・匹克球",
  "國標舞藝人",
  "武廟志工",
];

export const SceneExplore: React.FC = () => {
  const frame = useCurrentFrame();
  const pos = LINES.map((_, i) => ({
    x: 620 + (i % 4) * 315,
    y: 300 + Math.floor(i / 4) * 300 + (i % 2 ? 30 : 0),
  }));
  const grow = interpolate(frame, [10, 60], [0, 1], clamp);
  const n = useEnter(60, 9);
  return (
    <Frame page={5}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {pos.map((p, i) => (
          <g key={i}>
            <path
              d={`M 520 540 C 600 540, ${p.x - 120} ${p.y + 70}, ${p.x} ${p.y + 70}`}
              stroke={C.cyan}
              strokeWidth={5}
              fill="none"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - grow}
              style={{ filter: `drop-shadow(0 0 10px ${C.cyan})` }}
            />
            <circle
              cx={520 + (p.x - 520) * ((frame / 45 + i * 0.13) % 1)}
              cy={540 + (p.y + 70 - 540) * ((frame / 45 + i * 0.13) % 1)}
              r={8}
              fill="#fff"
              opacity={grow}
              style={{ filter: `drop-shadow(0 0 10px ${C.cyan})` }}
            />
          </g>
        ))}
      </svg>

      <div style={{ position: "absolute", left: 110, top: 450, opacity: useEnter(0) }}>
        <Glass color={C.cyan} style={{ padding: "28px 44px" }}>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 80, color: C.white }}>跨界探索</div>
        </Glass>
      </div>

      {LINES.map((l, i) => {
        const e = useEnter(25 + i * 5, 13);
        const bar = interpolate(frame, [40 + i * 5, 120 + i * 3], [0, 1], clamp);
        return (
          <div
            key={l}
            style={{
              position: "absolute",
              left: pos[i].x,
              top: pos[i].y,
              opacity: e,
              transform: `scale(${0.6 + 0.4 * e})`,
            }}
          >
            <Glass color={i % 2 ? C.blue : C.cyan} style={{ width: 290, padding: "14px 20px", borderRadius: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 10, height: 10, borderRadius: 5, background: "#cbd5e1" }} />
                ))}
              </div>
              <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 36, color: C.white, whiteSpace: "nowrap" }}>{l}</div>
              <div style={{ fontFamily: FONT_EN, fontWeight: 700, fontSize: 30, color: C.cyan }}>&gt;_</div>
              <div style={{ height: 8, background: "#1e293b", borderRadius: 4 }}>
                <div style={{ width: `${bar * 100}%`, height: 8, borderRadius: 4, background: C.cyan, boxShadow: `0 0 10px ${C.cyan}` }} />
              </div>
            </Glass>
          </div>
        );
      })}

      <div style={{ position: "absolute", right: 110, top: 80, opacity: n, display: "flex", alignItems: "baseline", gap: 24 }}>
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 100, color: C.white }}>跨界</span>
        <span style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 130, color: C.cyan, textShadow: `0 0 40px ${C.cyan}` }}>× N</span>
      </div>
      <div style={{ position: "absolute", left: 110, top: 70, fontFamily: FONT_ZH, fontWeight: 900, fontSize: 118, color: C.white, opacity: useEnter(0) }}>
        路徑探索
      </div>
      <Caption text="八條事業線，同時平行探索" highlight="同時平行探索" delay={40} />
    </Frame>
  );
};

/* ───────── 6. 收尾：完整署名 ───────── */
export const SceneClose: React.FC = () => {
  const a = useEnter(0, 12);
  const b = useEnter(15);
  const c = useEnter(35);
  const rows = [
    "益力康生技集團 董事長｜CGM Coach 血糖教練",
    "資策會・工研院 AI 認證講師｜生成式 AI 創業經營導師",
    "高爾夫・匹克球 國家級教練｜台南市街頭藝人（國標舞）",
  ];
  return (
    <Frame page={6}>
      <div style={{ position: "absolute", left: 90, top: 210, transform: `scale(${a})` }}>
        <AgentCore size={560} label="" color={C.cyan} />
        <div
          style={{
            position: "absolute",
            inset: 150,
            borderRadius: 40,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${C.cyan}`,
          }}
        >
          <Img src={staticFile("easycure-logo.png")} style={{ width: 240, height: 240 }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 720, top: 90, right: 90 }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 104, color: C.white, opacity: b, lineHeight: 1.15 }}>
          不是不務正業
        </div>
        <div style={{ opacity: b, lineHeight: 1.2 }}>
          <GradientText size={100}>是跨界融合的最高境界</GradientText>
        </div>

        <div style={{ marginTop: 34, opacity: c, transform: `translateY(${(1 - c) * 40}px)` }}>
          <Glass color={C.orange} style={{ padding: "26px 36px" }}>
            <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 58, color: C.white }}>
              AI Coach 益力康陳董<span style={{ fontSize: 44, color: C.gold }}>（陳俊宏）</span>
            </div>
            {rows.map((r) => (
              <div key={r} style={{ marginTop: 10, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 36, color: "#dbe4f5" }}>
                {r}
              </div>
            ))}
            <div style={{ marginTop: 14, fontFamily: FONT_EN, fontWeight: 700, fontSize: 30, color: C.cyan }}>
              © 2026 AI to Agent ・ All rights reserved
            </div>
          </Glass>
        </div>
      </div>
      <Caption text="九月進化完成，十月繼續升級" highlight="繼續升級" delay={50} />
    </Frame>
  );
};
