# 陳董 2026 年 9 月進化紀錄：Remotion 動畫

這支 Remotion 動畫長 33 秒，每秒 30 格，有兩種版本：橫式 1920×1080（`ProgressFilm`），以及給短影音平台用的 9:16 直式 1080×1920（`ProgressFilmVertical`）。視覺採用暗黑科技霓虹風（tech-style），分成六幕：

| # | 幕 | 參考意象 | 大字重點 |
|---|---|---|---|
| 1 | 封面 | EASY CURE Logo × Agent 光環 | 這個月的陳董，進化速度 ×10 |
| 2 | 看影片 → 建框架 | 多層網頁 → DOM → API → Agent | IPPOO™ 五層框架 |
| 3 | 碎片 → SSOT | Snapshot 壓縮晶片 | 雜訊↓ 精準↑ |
| 4 | Skills 技能包 | Snapshot / Restore → Sandbox | 12 套專屬 Skills |
| 5 | 路徑探索 | Sandbox × N 平行探索 | 跨界 × N（八條事業線） |
| 6 | 完整署名 | Agent 核心 | 不是不務正業，是跨界融合的最高境界 |

每一幕底部都有漸層署名列，寫著「AI Coach 益力康陳董｜2026 AI to Agent」。

## 使用方式

```bash
npm install
npm run studio   # 在瀏覽器預覽、微調
npm run render            # 橫式：out/chendong-progress-2026-09.mp4
npm run render:vertical   # 直式：out/chendong-progress-2026-09-vertical.mp4
npm run stills            # 每幕 PNG：out/stills/（橫式）、out/stills-vertical/（直式）
```

字型放在 `public/fonts`：Noto Sans TC 與 Montserrat，已經子集化。渲染時不需要連網。
修改文案後，執行 `node fetch-fonts.mjs` 重新下載新字元的字型。

© 2026 AI Coach 益力康陳董（陳俊宏）・All rights reserved
