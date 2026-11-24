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

### 錯誤沉澱

被使用者糾正時，在 `LESSONS.md` 新增一條 `L-xxx`；能用程式判斷的，就加進 `.github/scripts/handoff-check.py` 的 `RULES`。
