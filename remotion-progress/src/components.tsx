import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT_EN, FONT_ZH, GRAD_CTA, GRAD_TITLE, SCENE } from "./theme";

/** 深藏青背景 + 透視網格地板 + 光柱 + 漂浮粒子 */
export const TechBackground: React.FC<{ tint?: string }> = ({ tint = C.blue }) => {
  const frame = useCurrentFrame();
  const particles = new Array(70).fill(0).map((_, i) => {
    const x = random(`px${i}`) * 1920;
    const baseY = random(`py${i}`) * 1080;
    const speed = 0.3 + random(`ps${i}`) * 1.2;
    const size = 2 + random(`pz${i}`) * 4;
    const y = (baseY - frame * speed + 1080) % 1080;
    const o = 0.25 + 0.6 * Math.abs(Math.sin(frame / 25 + i));
    return { x, y, size, o };
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #16215e 0%, ${C.bgEnd} 45%, ${C.bgStart} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* 背景光柱 */}
      {[180, 520, 1400, 1760].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: 0,
            width: 90,
            height: 1080,
            background: `linear-gradient(180deg, transparent, ${tint}22 40%, transparent)`,
            opacity: 0.5 + 0.3 * Math.sin(frame / 30 + i),
            filter: "blur(18px)",
          }}
        />
      ))}
      {/* 透視網格地板 */}
      <div
        style={{
          position: "absolute",
          left: -600,
          right: -600,
          bottom: -160,
          height: 620,
          transform: "perspective(700px) rotateX(62deg)",
          backgroundImage: `linear-gradient(${tint}55 2px, transparent 2px), linear-gradient(90deg, ${tint}55 2px, transparent 2px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${(frame * 2) % 90}px`,
          maskImage: "linear-gradient(180deg, transparent, black 60%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 60%)",
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 5 === 0 ? C.orange : C.cyan,
            boxShadow: `0 0 ${p.size * 3}px ${i % 5 === 0 ? C.orange : C.cyan}`,
            opacity: p.o,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** 每一幕的淡入淡出外框 */
export const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, SCENE - 12, SCENE], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, SCENE], [1.04, 1]);
  return <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

export const useEnter = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

/** 參考圖風格的大字角標（例：看頁面 / 找數據） */
export const CornerTitle: React.FC<{
  text: string;
  side: "left" | "right";
  top?: number;
  delay?: number;
  dim?: boolean;
}> = ({ text, side, top = 90, delay = 0, dim = false }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        position: "absolute",
        top,
        [side]: 110,
        textAlign: side,
        opacity: e,
        transform: `translateY(${(1 - e) * 40}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_ZH,
          fontWeight: 900,
          fontSize: 118,
          letterSpacing: 6,
          color: dim ? "#c9d6f2" : C.white,
          textShadow: `0 0 30px ${C.blue}aa`,
          lineHeight: 1.1,
        }}
      >
        {text}
      </div>
      <div
        style={{
          marginTop: 18,
          height: 5,
          width: 190,
          marginLeft: side === "right" ? "auto" : 0,
          background: `linear-gradient(90deg, ${C.orange}, transparent)`,
          borderRadius: 3,
        }}
      />
    </div>
  );
};

/** 參考圖風格的底部大字幕（黑底白字 + 青色高光） */
export const Caption: React.FC<{ text: string; highlight?: string; delay?: number }> = ({
  text,
  highlight,
  delay = 18,
}) => {
  const e = useEnter(delay, 18);
  const parts = highlight ? text.split(highlight) : [text];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 118,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: e,
        transform: `translateY(${(1 - e) * 24}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_ZH,
          fontWeight: 700,
          fontSize: 66,
          color: C.white,
          background: "rgba(0,0,0,0.72)",
          padding: "10px 34px",
          borderRadius: 6,
          letterSpacing: 2,
        }}
      >
        {parts[0]}
        {highlight && (
          <span style={{ color: C.cyan, fontStyle: "italic", fontWeight: 900 }}>{highlight}</span>
        )}
        {parts[1]}
      </div>
    </div>
  );
};

/** 底部漸層署名列：每一幕固定出現 */
export const AttributionBar: React.FC<{ page: number; total: number }> = ({ page, total }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 86,
      background: GRAD_CTA,
      display: "flex",
      alignItems: "center",
      padding: "0 44px",
      gap: 22,
      fontFamily: FONT_ZH,
      color: C.white,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={staticFile("easycure-logo.png")} style={{ width: 58, height: 58 }} />
    </div>
    <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: 1 }}>AI Coach 益力康陳董</div>
    <div style={{ width: 2, height: 40, background: "rgba(255,255,255,0.6)" }} />
    <div style={{ fontWeight: 500, fontSize: 28 }}>血糖教練 CGM Coach ・ 益力康生技集團董事長</div>
    <div style={{ flex: 1 }} />
    <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>
      2026 AI to Agent
    </div>
    <div
      style={{
        fontFamily: FONT_EN,
        fontWeight: 700,
        fontSize: 24,
        border: "2px solid rgba(255,255,255,0.8)",
        borderRadius: 30,
        padding: "4px 16px",
      }}
    >
      {page}/{total}
    </div>
  </div>
);

/** 白字 + 漸層收尾的兩行大標題 */
export const GradientText: React.FC<{
  children: React.ReactNode;
  size: number;
  grad?: string;
  font?: string;
  weight?: number;
}> = ({ children, size, grad = GRAD_TITLE, font = FONT_ZH, weight = 900 }) => (
  <span
    style={{
      fontFamily: font,
      fontWeight: weight,
      fontSize: size,
      background: grad,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: `drop-shadow(0 0 24px ${C.purple}66)`,
    }}
  >
    {children}
  </span>
);

/** 發光同心圓 Agent 核心（參考圖 1 右側） */
export const AgentCore: React.FC<{ size?: number; label?: string; color?: string }> = ({
  size = 300,
  label = "Agent",
  color = C.cyan,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {[1, 0.8, 0.62, 0.46].map((k, i) => (
        <div
          key={k}
          style={{
            position: "absolute",
            inset: (size * (1 - k)) / 2,
            borderRadius: "50%",
            border: `${i === 0 ? 3 : 2}px solid ${color}`,
            opacity: 0.35 + 0.5 * Math.abs(Math.sin(frame / 18 + i)),
            boxShadow: `0 0 30px ${color}88, inset 0 0 30px ${color}55`,
            transform: `rotate(${frame * (i % 2 ? -1 : 1) * (1 + i)}deg)`,
            borderStyle: i % 2 ? "dashed" : "solid",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: size * 0.3,
          borderRadius: 26,
          background: "rgba(5,10,30,0.9)",
          border: `3px solid ${color}`,
          boxShadow: `0 0 40px ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_EN,
          fontWeight: 900,
          fontSize: size * 0.13,
          color: C.white,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** 玻璃卡片 */
export const Glass: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.blue, style }) => (
  <div
    style={{
      background: C.card,
      border: `3px solid ${color}`,
      borderRadius: 24,
      boxShadow: `0 0 36px ${color}66, inset 0 0 24px ${color}22`,
      backdropFilter: "blur(8px)",
      ...style,
    }}
  >
    {children}
  </div>
);
