# CLAUDE.md

本專案是 IPPOO 知識轉換框架。錯誤登錄表見 `LESSONS.md`，交接筆記放在 `notes/`。

## 必守規則

### L-007：沒看到結果，不准說「做完了」

回報任何工作「完成」之前，必須：

1. **實際執行**對應的檢查，不可憑推測下結論：
   - 改了交接筆記 → `python .github/scripts/handoff-check.py notes`
   - 改了 README / LICENSE / 版本 → `python .github/scripts/repo-check.py .`
   - 其他修改 → 重新讀取或執行產出，確認符合需求
2. 在回報中**附上檢查輸出**（PASS/FAIL 那幾行）。
3. 檢查失敗或沒跑檢查 → 明確說「未完成」或「未驗證」，並說明原因。不可寫「應該可以」「理論上沒問題」。

### L-009：只是問，不准動手

使用者在詢問意見或回答問題時，沒有明確說「改」「做」「推送」，就**只回答、提出方案**，等使用者確認後再修改檔案或推送。不確定是不是要動手時，先問。

### 錯誤沉澱

被使用者糾正時，在 `LESSONS.md` 新增一條 `L-xxx`；能用程式判斷的，就加進 `.github/scripts/handoff-check.py` 的 `RULES`。

## 自動把關（Stop hook）

`.claude/settings.json` 設定了 Stop hook（`.claude/hooks/stop-verify.sh`）：每次 Claude 要結束回覆時，自動跑 `handoff-check.py` 與 `repo-check.py`。有 FAIL 就擋下，要求修正；第二次仍失敗才放行，此時必須在回報中寫「未完成」。
