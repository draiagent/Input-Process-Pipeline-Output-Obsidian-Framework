#!/usr/bin/env python3
"""衛教知識庫匯入：PDF → 逐頁擷取 → 切段 → 向量 → Supabase kb_documents

用法：
  # 先試跑（不需要任何金鑰），輸出 chunks.jsonl 與品質報告
  python3 scripts/kb_ingest/ingest.py --pdf-dir <PDF 資料夾> --dry-run

  # 正式匯入
  export SUPABASE_URL=https://xxx.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=...      # 只在本機/CI 使用，絕不放前端
  export OPENAI_API_KEY=...                 # text-embedding-3-small，1536 維，對應 vector(1536)
  python3 scripts/kb_ingest/ingest.py --pdf-dir <PDF 資料夾>

需求：poppler-utils（pdftotext / pdftoppm）。需要 OCR 的文件另需 tesseract + chi_tra 語言包。
重跑安全：以 sha256(source|chunk) 做 upsert，不會重複寫入。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
EMBED_MODEL = "text-embedding-3-small"
EMBED_BATCH = 96
UPSERT_BATCH = 200

# 切段長度（字元）：中文資訊密度高，段落較短
CHUNK = {"zh": (700, 120), "en": (1800, 250)}  # (目標長度, 重疊)
MIN_CHUNK = 120


# ---------- 擷取 ----------

def page_count(pdf: Path) -> int:
    out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
    return int(re.search(r"Pages:\s+(\d+)", out).group(1))


def extract_page(pdf: Path, page: int) -> str:
    r = subprocess.run(["pdftotext", "-f", str(page), "-l", str(page), str(pdf), "-"],  # 不用 -layout：雙欄排版才會依閱讀順序輸出
                       capture_output=True, text=True, errors="replace")
    return r.stdout


def ocr_page(pdf: Path, page: int) -> str:
    with tempfile.TemporaryDirectory() as d:
        base = Path(d) / "p"
        subprocess.run(["pdftoppm", "-f", str(page), "-l", str(page), "-r", "300", "-png", str(pdf), str(base)],
                       check=True, capture_output=True)
        img = next(Path(d).glob("p*.png"))
        r = subprocess.run(["tesseract", str(img), "-", "-l", "chi_tra+eng", "--psm", "6"],
                           capture_output=True, text=True)
        return r.stdout


CJK = re.compile(r"[一-鿿]")
# 常用字：用來判斷擷取出的中文是不是真的中文，而不是字型缺對照表造成的亂碼
COMMON = set("的一是在不了有和人這中大為上個國我以要他時來用們生到作地於出就分對成會可主發年動同工也能下過子說產種面而方後多定行學法所民得經十三之進著等部度家電力裡如水化高自二理起小物現實加量都兩體制機當使點從業本去把性好應開它合還因由其些然前外天政四日那社義事平形相全表間樣與關各重新線內數正心反你明看原又麼利比或但質氣第向道命此變條只沒結解問意建月公無系軍很情者最立代想已通並提直題黨程展五果料象員革位入常文總次品式活設及管特件長求老頭基資邊流路級少圖山統接知較將組見計別她手角期根論運農指幾九區強放決西被幹做必戰先回則任取據處府研質醫療糖尿病血患者治療建議風險")


def text_quality(s: str, lang: str) -> float:
    """回傳 0–1，越高表示文字越像正常內容。"""
    s = re.sub(r"\s+", "", s)
    if not s:
        return 0.0
    if lang == "en":
        return sum(c.isascii() and (c.isalnum() or c in ".,;:()%-/") for c in s) / len(s)
    cjk = CJK.findall(s)
    if len(cjk) < 20:
        return 0.0
    return sum(c in COMMON for c in cjk) / len(cjk)


def clean(s: str) -> str:
    s = s.replace("­", "").replace("ﬁ", "fi").replace("ﬂ", "fl")
    s = re.sub(r"-\n(?=[a-z])", "", s)                 # 英文斷字
    s = re.sub(r"(?<=[一-鿿])[ \t]+(?=[一-鿿])", "", s)  # 中文字間空白
    s = re.sub(r"[ \t]{2,}", " ", s)
    lines = [ln.strip() for ln in s.splitlines()]
    lines = [ln for ln in lines if ln and not re.fullmatch(r"[\dSs\-–— ]{1,8}", ln)]  # 頁碼
    return "\n".join(lines)


def is_reference_list(c: str) -> bool:
    """文獻列表對衛教回答沒有幫助，略過。"""
    hits = len(re.findall(r"et al\.|doi:|\b(19|20)\d{2};\s*\d+|Diabetes Care\.|N Engl J Med|Lancet", c))
    return hits >= 4 or hits / max(len(c) / 400, 1) >= 2


# ---------- 切段 ----------

def split_chunks(text: str, lang: str) -> list[str]:
    target, overlap = CHUNK[lang]
    sep = r"(?<=[。！？；])|(?<=[.!?;])\s+" if lang == "zh" else r"(?<=[.!?;])\s+"
    paras = [p for p in re.split(r"\n{2,}|\n(?=[•\-●▪■◆]|\d+\.\d*\s)", text) if p.strip()]
    sentences: list[str] = []
    for p in paras:
        p = p.replace("\n", "" if lang == "zh" else " ")
        sentences += [x for x in re.split(sep, p) if x and x.strip()]
        sentences.append("\n")
    chunks, cur = [], ""
    for s in sentences:
        if len(cur) + len(s) > target and len(cur) >= MIN_CHUNK:
            chunks.append(cur.strip())
            cur = cur[-overlap:] + s
        else:
            cur += s
    if cur.strip():
        chunks.append(cur.strip())
    return [c for c in chunks if len(c) >= MIN_CHUNK // 2]


# ---------- 向量與寫入 ----------

def post_json(url: str, payload, headers: dict, retries: int = 4):
    data = json.dumps(payload).encode()
    for i in range(retries):
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", **headers})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read()
                return json.loads(body) if body else None
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and i < retries - 1:
                time.sleep(2 ** i * 2)
                continue
            raise SystemExit(f"HTTP {e.code} {url}: {e.read().decode()[:300]}")


def embed(texts: list[str]) -> list[list[float]]:
    r = post_json("https://api.openai.com/v1/embeddings", {"model": EMBED_MODEL, "input": texts},
                  {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"})
    return [d["embedding"] for d in sorted(r["data"], key=lambda d: d["index"])]


def upsert(rows: list[dict]):
    url = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1/kb_documents?on_conflict=content_hash"
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    post_json(url, rows, {"apikey": key, "Authorization": f"Bearer {key}",
                          "Prefer": "resolution=merge-duplicates,return=minimal"})


# ---------- 主流程 ----------

def find_pdf(pdf_dir: Path, match: str) -> Path | None:
    hits = [p for p in pdf_dir.glob("*.pdf") if match in p.name]
    return hits[0] if hits else None


def process(src: dict, pdf: Path, use_ocr: bool, max_pages: int | None):
    lang = src.get("lang", "zh")
    n = page_count(pdf)
    if max_pages:
        n = min(n, max_pages)
    rows, report = [], {"pages": n, "text": 0, "ocr": 0, "skipped": []}
    threshold = 0.7 if lang == "en" else 0.35
    for p in range(1, n + 1):
        raw = extract_page(pdf, p)
        if text_quality(raw, lang) < threshold:
            if src.get("ocr") and use_ocr:
                raw = ocr_page(pdf, p)
                report["ocr"] += 1
                if text_quality(raw, lang) < threshold:
                    report["skipped"].append(p)
                    continue
            else:
                if len(re.sub(r"\s", "", raw)) > 40:  # 有字但讀不懂 → 記下來；空白頁不記
                    report["skipped"].append(p)
                continue
        else:
            report["text"] += 1
        for c in split_chunks(clean(raw), lang):
            if is_reference_list(c):
                continue
            rows.append({
                "domain": src["domain"], "source": src["source"], "title": src["title"],
                "page": p, "lang": lang, "chunk": c,
                "content_hash": hashlib.sha256(f"{src['source']}|{c}".encode()).hexdigest(),
            })
    # 同一份文件內去重（頁首頁尾重複段落）
    seen, uniq = set(), []
    for r in rows:
        if r["content_hash"] not in seen:
            seen.add(r["content_hash"])
            uniq.append(r)
    return uniq, report


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pdf-dir", required=True, type=Path)
    ap.add_argument("--sources", type=Path, default=HERE / "sources.json")
    ap.add_argument("--only", help="只處理指定 source 代號（逗號分隔）")
    ap.add_argument("--dry-run", action="store_true", help="不呼叫 API，只輸出 chunks.jsonl 與報告")
    ap.add_argument("--out", type=Path, default=Path("kb_chunks.jsonl"))
    ap.add_argument("--max-pages", type=int, help="每份文件最多處理幾頁（測試用）")
    args = ap.parse_args()

    sources = json.loads(args.sources.read_text(encoding="utf-8"))
    if args.only:
        keep = set(args.only.split(","))
        sources = [s for s in sources if s["source"] in keep]

    has_ocr = bool(shutil.which("tesseract"))
    if not args.dry_run:
        for k in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"):
            if not os.environ.get(k):
                sys.exit(f"缺少環境變數 {k}")

    all_rows = []
    for src in sources:
        pdf = find_pdf(args.pdf_dir, src["match"])
        if not pdf:
            print(f"⚠ 找不到 {src['source']}（檔名需包含 {src['match']}）")
            continue
        rows, rep = process(src, pdf, has_ocr, args.max_pages)
        sk = rep["skipped"]
        print(f"✓ {src['source']}: {rep['pages']} 頁｜文字層 {rep['text']}｜OCR {rep['ocr']}｜"
              f"略過 {len(sk)}{(' ' + str(sk[:10]) + ('…' if len(sk) > 10 else '')) if sk else ''}｜{len(rows)} 段")
        if src.get("ocr") and not has_ocr and sk:
            print("  ↳ 這份需要 OCR：請安裝 tesseract-ocr 與 tesseract-ocr-chi-tra 後重跑")
        all_rows += rows

    if args.dry_run:
        with args.out.open("w", encoding="utf-8") as f:
            for r in all_rows:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        total = sum(len(r["chunk"]) for r in all_rows)
        print(f"\n試跑完成：{len(all_rows)} 段，共 {total:,} 字元 → {args.out}")
        print(f"預估向量費用（text-embedding-3-small）：約 US${total / 3 / 1e6 * 0.02:.2f}")
        return

    for i in range(0, len(all_rows), EMBED_BATCH):
        batch = all_rows[i:i + EMBED_BATCH]
        for r, v in zip(batch, embed([r["chunk"] for r in batch])):
            r["embedding"] = v
        print(f"  向量 {min(i + EMBED_BATCH, len(all_rows))}/{len(all_rows)}", end="\r")
    print()
    for i in range(0, len(all_rows), UPSERT_BATCH):
        upsert(all_rows[i:i + UPSERT_BATCH])
        print(f"  寫入 {min(i + UPSERT_BATCH, len(all_rows))}/{len(all_rows)}", end="\r")
    print(f"\n完成：{len(all_rows)} 段已寫入 kb_documents")


if __name__ == "__main__":
    main()
