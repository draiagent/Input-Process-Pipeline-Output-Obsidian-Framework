// 以 Google Fonts「text=」子集化下載字型到 public/fonts（渲染時不需連網）
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const src = readdirSync("src").map((f) => readFileSync(`src/${f}`, "utf8")).join("");
const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
const chars = [...new Set([...src, ...ascii])].filter((c) => c.codePointAt(0) >= 32).join("");

const want = [
  ["Noto Sans TC", "NotoSansTC", [500, 700, 900]],
  ["Montserrat", "Montserrat", [700, 900]],
];
mkdirSync("public/fonts", { recursive: true });
const manifest = [];
for (const [family, file, weights] of want) {
  for (const w of weights) {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${w}&text=${encodeURIComponent(chars)}`;
    const css = execFileSync("curl", ["-sS", "-A", "Mozilla/5.0 Chrome/120", url]).toString();
    const fontUrl = css.match(/url\((https:[^)]+)\)/)[1];
    const out = `fonts/${file}-${w}.woff2`;
    execFileSync("curl", ["-sS", "-o", `public/${out}`, fontUrl]);
    manifest.push({ family: file, weight: String(w), file: out });
  }
}
writeFileSync("src/fonts.json", JSON.stringify(manifest, null, 2));
console.log(`${chars.length} glyphs →`, manifest.map((m) => m.file).join(", "));
