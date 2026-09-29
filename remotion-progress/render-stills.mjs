// 每一幕輸出一張高解析海報圖（取該幕動畫完整展開的畫格）
import { execFileSync } from "node:child_process";

const SCENE = 165;
const names = ["01-cover", "02-pipeline", "03-ssot", "04-skills", "05-explore", "06-signature"];
names.forEach((name, i) => {
  const frame = i * SCENE + 135;
  execFileSync(
    "npx",
    ["remotion", "still", "ProgressFilm", `out/stills/${name}.png`, `--frame=${frame}`],
    { stdio: "inherit" },
  );
});
