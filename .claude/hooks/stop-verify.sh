#!/usr/bin/env bash
# L-007 Stop hook：Claude 要結束回覆前，自動跑檢查；失敗就擋下，要求先修好或回報「未完成」。
input=$(cat)
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

# 已經被擋過一次還是失敗 → 放行，避免無限循環（Claude 必須在回報中說明未完成）
if echo "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

out=$( { python3 .github/scripts/handoff-check.py notes; echo "---"; python3 .github/scripts/repo-check.py .; } 2>&1 )
if echo "$out" | grep -q '^FAIL'; then
  {
    echo "L-007：自動檢查未通過，不可回報「完成」。請修正後重跑，或在回報中明確寫「未完成」並說明原因。"
    echo "$out"
  } >&2
  exit 2
fi
exit 0
