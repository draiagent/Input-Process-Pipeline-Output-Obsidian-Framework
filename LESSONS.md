# 錯誤沉澱登錄表（LESSONS）

> 本表是 [TEAM-5R](TEAM-5R.md) 第 ⑤ 條「錯一次，加一道檢查」的實作。

> **規則：每糾正 AI 一次，就在這裡加一行。** 能寫成程式的，就寫進 `.github/scripts/handoff-check.py`（每次 push 自動跑，必過）；做不到的才寫成文字規則。
> 原因：文字規則模型可能會漏，自動檢查每次都得過。

| 編號 | 犯過的錯 | 檢查方式 | 位置 |
|---|---|---|---|
| L-001 | 檔名沒有版本號，回寫後找不到最新版 | 自動檢查 | `r_filename` |
| L-002 | 交接筆記缺段落，下一個模型缺上下文 | 自動檢查 | `r_sections` |
| L-003 | 跳過 Process 三問，未驗證就進 Output | 自動檢查 | `r_process_three` |
| L-004 | 結論無法回查來源 | 自動檢查 | `r_source` |
| L-005 | 視覺模型改動核心論證 | 自動檢查（確認禁止事項有寫） | `r_locked_logic` |
| L-006 | 模板佔位字（TODO、[主題名稱]）沒刪就定稿 | 自動檢查 | `r_placeholder` |
| L-007 | Claude 沒看結果就回報「做完了」 | 自動檢查（Stop hook）＋文字規則 | `.claude/hooks/stop-verify.sh`、`CLAUDE.md` |
| L-008 | Gemini 潤稿時改錯專業事實 | 文字規則：潤稿後由 Claude 對照原稿核實事實 | SOP 4.3 |
| L-009 | 使用者只是詢問或回答問題，Claude 就直接修改並推送 | 文字規則：使用者沒有明確說「改」「做」「推送」，就先提出方案，等確認後再動手 | `CLAUDE.md` |

## 新增一條的流程

1. 在上表加一行 `L-xxx`，寫清楚「犯過的錯」
2. 判斷：**能用程式判斷嗎？**
   - 能 → 在 `handoff-check.py` 加一個 `r_xxx` 函式，docstring 開頭寫 `L-xxx`，加進 `RULES`
   - 不能 → 「檢查方式」寫「文字規則」，並寫進對應的 SOP 段落
3. 本機執行 `python .github/scripts/handoff-check.py` 確認範例筆記仍通過
