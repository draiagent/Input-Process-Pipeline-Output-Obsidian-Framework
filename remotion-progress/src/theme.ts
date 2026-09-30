import { continueRender, delayRender, staticFile } from "remotion";
import fonts from "./fonts.json";

// 本機字型（由 fetch-fonts.mjs 子集化下載），渲染時不需連網
const handle = delayRender("load local fonts");
Promise.all(
  fonts.map((f) => {
    const face = new FontFace(f.family, `url(${staticFile(f.file)}) format("woff2")`, { weight: f.weight });
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));

export const FONT_ZH = `NotoSansTC, "WenQuanYi Zen Hei", sans-serif`;
export const FONT_EN = `Montserrat, NotoSansTC, sans-serif`;

// tech-style 色票（暗黑科技資訊圖表）＋參考圖的暖橘高光
export const C = {
  bgStart: "#0A0E27",
  bgEnd: "#0D1240",
  white: "#FFFFFF",
  gray: "#94A3B8",
  blue: "#3B82F6",
  cyan: "#22D3EE",
  purple: "#A855F7",
  magenta: "#EC4899",
  orange: "#FFA43A",
  gold: "#FFD27A",
  lime: "#8CC63F", // EASY CURE 綠
  yellow: "#F5D90A", // EASY CURE 黃
  card: "rgba(15, 23, 55, 0.62)",
};

export const GRAD_TITLE = `linear-gradient(100deg, ${C.cyan} 0%, ${C.blue} 35%, ${C.purple} 70%, ${C.magenta} 100%)`;
export const GRAD_CTA = `linear-gradient(90deg, ${C.blue} 0%, ${C.purple} 50%, ${C.magenta} 100%)`;
export const GRAD_WARM = `linear-gradient(100deg, ${C.gold} 0%, ${C.orange} 60%, ${C.magenta} 100%)`;

export const FPS = 30;
export const SCENE = 165; // 每幕 5.5 秒
export const SCENES = 6;
export const TOTAL = SCENE * SCENES;
