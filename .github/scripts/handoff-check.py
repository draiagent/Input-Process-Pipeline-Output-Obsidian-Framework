#!/usr/bin/env python3
"""IPPOO 交接筆記自動檢查：把「被糾正過的錯誤」沉澱成每次必過的程式檢查。

規則登錄表見 LESSONS.md。新增規則的流程：
  1. 在 LESSONS.md 登記錯誤（L-編號）
  2. 能用程式判斷 → 在下方 RULES 加一個函式，並把 L-編號寫進 docstring
  3. 做不到 → 只在 LESSONS.md 寫成文字規則，標記「文字規則」

用法：python .github/scripts/handoff-check.py [筆記或資料夾 ...]（預設掃 notes/）
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

SECTIONS = ["一、原始素材來源", "二、驗證後結論", "三、待自動化事項", "四、視覺化交付指令"]
PROCESS_FIELDS = ["費曼複述版本", "第一性原理拆解", "反例/風險點", "最終定稿邏輯"]
FILENAME = re.compile(r"^.+_v\d+(\.\d+)*(_\d{4}-\d{2}-\d{2})?\.md$")


def field_value(text, label):
    """取出「- 標籤：內容」的內容（含後續縮排的子項目）。"""
    m = re.search(rf"^-\s*{re.escape(label)}[:：][ \t]*(.*(?:\n(?:[ \t]+\S.*))*)", text, re.M)
    return m.group(1).strip() if m else None


def r_filename(path, text):
    """L-001 檔名未依 [主題]_v[版本](_日期).md 命名，回寫後找不到版本。"""
    if not FILENAME.match(path.name):
        return f"檔名 `{path.name}` 不符 [主題]_v[版本](_YYYY-MM-DD).md"


def r_sections(path, text):
    """L-002 交接筆記缺段落，下一個模型接手時缺上下文。"""
    miss = [s for s in SECTIONS if not re.search(rf"^##\s*{s}", text, re.M)]
    if miss:
        return "缺少段落：" + "、".join(miss)


def r_process_three(path, text):
    """L-003 Process 三問被跳過或留白，未經驗證就進入 Output。"""
    empty = [f for f in PROCESS_FIELDS if not field_value(text, f)]
    if empty:
        return "Process 欄位留白：" + "、".join(empty)


def r_source(path, text):
    """L-004 結論無法回查來源（違反可追溯性）。"""
    v = field_value(text, "來源連結/平台")
    if not v or not re.search(r"https?://|\[\[", v):
        return "來源欄需含網址或 [[雙向連結]]"


def r_locked_logic(path, text):
    """L-005 視覺模型改動了核心論證，因為沒寫明禁止事項。"""
    if not field_value(text, "禁止事項（不可更動的核心論證）"):
        return "Output 段「禁止事項」留白，視覺模型可能改動核心論證"


def r_placeholder(path, text):
    """L-006 模板佔位字（[主題名稱]、TODO、待補）沒刪就定稿。"""
    hits = re.findall(r"\[主題名稱\]|\[版本號\]|TODO|待補|TBD", text)
    if hits:
        return "殘留佔位字：" + "、".join(sorted(set(hits)))


RULES = [r_filename, r_sections, r_process_three, r_source, r_locked_logic, r_placeholder]


def lesson_id(rule):
    return rule.__doc__.split()[0]


def main(argv):
    targets = [Path(a) for a in argv] or [Path("notes")]
    files = []
    for t in targets:
        if t.is_dir():
            files += sorted(p for p in t.rglob("*.md") if not p.name.startswith(("_", "README")))
        elif t.exists():
            files.append(t)
    if not files:
        print("沒有可檢查的交接筆記（略過）")
        return 0
    failed = 0
    for f in files:
        text = f.read_text(encoding="utf-8", errors="replace")
        errs = [(lesson_id(r), msg) for r in RULES if (msg := r(f, text))]
        print(f"{'PASS' if not errs else 'FAIL'} {f}")
        for lid, msg in errs:
            print(f"  [{lid}] {msg}")
        failed += bool(errs)
    print(f"\n{len(files) - failed}/{len(files)} 通過，共 {len(RULES)} 條自動檢查")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
