#!/usr/bin/env python3
"""錯誤沉澱自動檢查（Lesson Check）。

原則：每糾正 AI 一次，就把該類錯誤寫成一條 LESSON。
      能寫成程式就不只寫文字規則——文字規則模型會漏，自動檢查每次必過。

每條 LESSON 必須附「錯誤範例 bad」與「正確範例 good」：
  --self-test 會驗證 bad 一定被抓到、good 一定通過，避免檢查本身失效。

用法：
  python .github/scripts/lesson-check.py .            # 掃描 repo 內所有 .md
  python .github/scripts/lesson-check.py --self-test  # 驗證每條規則有效
  python .github/scripts/lesson-check.py --list       # 列出錯誤帳本
"""
import argparse, re, sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

# ── 共用小工具 ─────────────────────────────────────────────
def lines_outside_code(text):
    """逐行產出 (行號, 內容)，跳過 ``` 程式碼區塊。"""
    fence = False
    for i, line in enumerate(text.splitlines(), 1):
        if line.lstrip().startswith("```"):
            fence = not fence
            continue
        if not fence:
            yield i, line


SIMPLIFIED = "这们说为个时实验证视觉数据检记录档执间级书写户应确认东车门开关题"
VERSION_ROW = re.compile(r"^\|\s*v(\d+\.\d+(?:\.\d+)?)\s*\|\s*([^|]*?)\s*\|")
HANDOFF_NAME = re.compile(r"^.+_v\d+(?:\.\d+)*_\d{4}-\d{2}-\d{2}\.md$")


# ── 檢查函式：輸入 (檔名, 內容) → 回傳 [(行號, 訊息)] ─────────
def chk_simplified(name, text):
    return [(i, f"出現簡體字「{c}」")
            for i, line in lines_outside_code(text)
            for c in sorted(set(line) & set(SIMPLIFIED))]


def chk_version_date(name, text):
    out = []
    for i, line in lines_outside_code(text):
        m = VERSION_ROW.match(line)
        if m and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", m.group(2)):
            out.append((i, f"版本 v{m.group(1)} 日期「{m.group(2)}」不是 YYYY-MM-DD"))
    return out


def chk_version_order(name, text):
    vers = [(i, tuple(map(int, m.group(1).split("."))))
            for i, line in lines_outside_code(text) if (m := VERSION_ROW.match(line))]
    return [(i, "版本紀錄需由舊到新遞增，且不可重複")
            for (_, a), (i, b) in zip(vers, vers[1:]) if b <= a]


def chk_three_questions(name, text):
    if not re.search(r"驗證後結論|Process階段", text):
        return []  # 只檢查交接文件
    miss = [q for q in ("費曼", "第一性原理", "反例") if q not in text]
    return [(1, f"交接文件缺少 Process 三問：{'、'.join(miss)}")] if miss else []


def chk_handoff_filename(name, text):
    if "handoff" not in Path(name).parts and "交接" not in Path(name).parts:
        return []
    return [] if HANDOFF_NAME.match(Path(name).name) else \
        [(1, f"交接檔名需為 [主題]_v[版本]_[YYYY-MM-DD].md，目前是 {Path(name).name}")]


def chk_placeholder(name, text):
    pat = re.compile(r"TODO|TBD|待補|XXX|lorem ipsum", re.I)
    return [(i, f"殘留佔位字「{m.group(0)}」")
            for i, line in lines_outside_code(text) if (m := pat.search(line))
            and not line.lstrip().startswith("- [ ]")]


# ── 錯誤帳本：每糾正一次 AI，就在這裡加一條 ──────────────────
LESSONS = [
    dict(id="L001", title="繁體中文文件混入簡體字",
         origin="AI 產出文件夾雜「这/验证」等簡體字，被糾正", check=chk_simplified,
         bad=("a.md", "請先驗证結論"), good=("a.md", "請先驗證結論")),
    dict(id="L002", title="版本紀錄日期格式不一",
         origin="AI 寫成 2026/7/11、七月十一日", check=chk_version_date,
         bad=("a.md", "| v1.1 | 2026/7/11 | x |"), good=("a.md", "| v1.1 | 2026-07-11 | x |")),
    dict(id="L003", title="版本號倒退或重複",
         origin="AI 新增版本時沿用舊號或插錯順序", check=chk_version_order,
         bad=("a.md", "| v1.1 | 2026-07-11 | x |\n| v1.0 | 2026-07-12 | y |"),
         good=("a.md", "| v1.0 | 2026-07-11 | x |\n| v1.1 | 2026-07-12 | y |")),
    dict(id="L004", title="交接文件省略 Process 三問",
         origin="SOP 4.3 規定三問不可省略，AI 曾只寫結論", check=chk_three_questions,
         bad=("a.md", "## 二、驗證後結論\n費曼複述：..."),
         good=("a.md", "## 二、驗證後結論\n費曼…第一性原理…反例…")),
    dict(id="L005", title="交接檔名不符命名規則",
         origin="AI 存成「新筆記.md」，Obsidian 無法依版本排序", check=chk_handoff_filename,
         bad=("handoff/新筆記.md", ""), good=("handoff/血糖教練_v1.0_2026-11-24.md", "")),
    dict(id="L006", title="交付文件殘留佔位字",
         origin="AI 留下 TODO／待補 就交付", check=chk_placeholder,
         bad=("a.md", "結論：待補"), good=("a.md", "- [ ] 待補的任務清單項目可保留")),
]


# ── 執行 ───────────────────────────────────────────────────
def self_test():
    ok = True
    for L in LESSONS:
        bad_hit = bool(L["check"](*L["bad"]))
        good_hit = bool(L["check"](*L["good"]))
        status = "OK " if bad_hit and not good_hit else "BAD"
        ok &= status == "OK "
        print(f"  [{status}] {L['id']} {L['title']}"
              + ("" if bad_hit else "（錯誤範例沒被抓到）")
              + ("（正確範例被誤判）" if good_hit else ""))
    print("SELF-TEST", "PASS" if ok else "FAIL")
    return ok


def scan(root):
    root = Path(root)
    errs = 0
    for p in sorted(root.rglob("*.md")):
        if any(part.startswith(".") for part in p.relative_to(root).parts):
            continue
        rel = p.relative_to(root).as_posix()
        text = p.read_text(encoding="utf-8", errors="replace")
        for L in LESSONS:
            for line, msg in L["check"](rel, text):
                errs += 1
                print(f"  [{L['id']}] {rel}:{line} {msg}")
    print(f"{'PASS' if not errs else 'FAIL'} 錯誤沉澱檢查（{len(LESSONS)} 條規則、{errs} 處違規）")
    return errs == 0


def main():
    ap = argparse.ArgumentParser(description="錯誤沉澱自動檢查")
    ap.add_argument("path", nargs="?", default=".")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        for L in LESSONS:
            print(f"{L['id']}  {L['title']}  ← {L['origin']}")
        return
    ok = self_test() if a.self_test else scan(a.path)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
