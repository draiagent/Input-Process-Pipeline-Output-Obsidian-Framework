// 9:16 直式版（1080×1920）：給短影音平台使用，內容與橫式版相同，重新排版
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  AgentCore,
  AttributionBarVertical,
  Caption,
  CornerTitle,
  Glass,
  GradientText,
  SceneFade,
  TechBackground,
  useEnter,
} from "./components";
import { LAYERS, LINES, PixelCube, SKILLS } from "./scenes";
import { C, FONT_EN, FONT_ZH, GRAD_WARM, SCENES } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CAP_BOTTOM = 210;

const Frame: React.FC<{ page: number; tint?: string; children: React.ReactNode }> = ({
  page,
  tint,
  children,
}) => (
  <AbsoluteFill>
    <TechBackground tint={tint} />
    <SceneFade>{children}</SceneFade>
    <AttributionBarVertical page={page} total={SCENES} />
  </AbsoluteFill>
);

/* ───────── 1. 封面 ───────── */
export const VCover: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useEnter(0, 11);
  const t1 = useEnter(10);
  const t2 = useEnter(20);
  const t3 = useEnter(32);
  return (
    <Frame page={1}>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", opacity: t1 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: FONT_EN,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 5,
            color: C.gold,
            border: `3px solid ${C.orange}`,
            borderRadius: 40,
            padding: "8px 28px",
            boxShadow: `0 0 24px ${C.orange}88`,
          }}
        >
          2026 · SEPTEMBER · 進化紀錄
        </span>
      </div>

      <div style={{ position: "absolute", left: 250, top: 300 }}>
        <div style={{ position: "absolute", left: -50, top: -50, opacity: logo }}>
          <AgentCore size={680} label="" color={C.cyan} />
        </div>
        <div
          style={{
            width: 580,
            height: 580,
            borderRadius: 70,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 80px ${C.cyan}, 0 0 160px ${C.blue}88`,
            transform: `scale(${logo * 0.72}) rotate(${(1 - logo) * -90}deg)`,
          }}
        >
          <Img src={staticFile("easycure-logo.png")} style={{ width: 520, height: 520 }} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT_ZH,
            fontWeight: 900,
            fontSize: 132,
            color: C.white,
            lineHeight: 1.1,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 60}px)`,
          }}
        >
          這個月的陳董
        </div>
        <div style={{ opacity: t2, transform: `translateY(${(1 - t2) * 60}px)`, lineHeight: 1.25 }}>
          <GradientText size={140}>進化速度 </GradientText>
          <GradientText size={150} font={FONT_EN}>
            ×{Math.min(10, Math.floor(interpolate(frame, [20, 80], [1, 10], clamp)))}
          </GradientText>
        </div>
        <div style={{ marginTop: 22, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 50, color: "#cbd5e1", opacity: t3 }}>
          從 AI 使用者 → <span style={{ color: C.cyan }}>AI Agent 架構師</span>
        </div>
      </div>
      <Caption text="一個月，完成一次「系統級」升級" highlight="系統級" delay={40} size={60} bottom={CAP_BOTTOM} />
    </Frame>
  );
};

/* ───────── 2. 看影片 → 建框架 ───────── */
export const VPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [40, 110], [0, 1], clamp);
  return (
    <Frame page={2}>
      <CornerTitle text="看影片" side="left" top={150} />
      <CornerTitle text="建框架" side="right" top={150} delay={60} dim />

      {/* 垂直光束 */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M 150 400 L 150 1170 C 150 1260, 250 1300, 340 1300"
          stroke={C.cyan}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - beam}
          style={{ filter: `drop-shadow(0 0 16px ${C.cyan})` }}
        />
        <path
          d="M 640 1300 L 720 1300"
          stroke={C.blue}
          strokeWidth={10}
          opacity={interpolate(frame, [100, 115], [0, 1], clamp)}
          style={{ filter: `drop-shadow(0 0 16px ${C.cyan})` }}
        />
      </svg>

      {LAYERS.map((l, i) => {
        const e = useEnter(8 + i * 7);
        const lit = beam > i / LAYERS.length;
        return (
          <div
            key={l.en}
            style={{
              position: "absolute",
              left: 200,
              top: 400 + i * 150,
              width: 780,
              height: 130,
              opacity: e,
              transform: `perspective(1400px) rotateX(18deg) translateX(${(1 - e) * 200}px)`,
            }}
          >
            <Glass
              color={lit ? C.cyan : "#5b6b9a"}
              style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 30, padding: "0 34px" }}
            >
              <div style={{ width: 90, fontFamily: FONT_EN, fontWeight: 900, fontSize: 92, color: lit ? C.cyan : C.white }}>
                {l.en[0]}
              </div>
              <div style={{ flex: 1, fontFamily: FONT_EN, fontWeight: 700, fontSize: 48, color: C.white }}>{l.en}</div>
              <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 46, color: C.gray }}>{l.zh}</div>
            </Glass>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 340, top: 1190, opacity: useEnter(70) }}>
        <Glass
          color={C.blue}
          style={{ width: 300, height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 44, color: C.white }}>IPPOO™</div>
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 84, color: C.cyan }}>{"{ }"}</div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 30, color: C.gray }}>SOP</div>
        </Glass>
      </div>
      <div style={{ position: "absolute", left: 700, top: 1150, transform: `scale(${useEnter(95)})` }}>
        <AgentCore size={300} />
      </div>
      <Caption text="讓 AI 幫你快，讓框架幫你準" highlight="讓框架幫你準" delay={45} size={62} bottom={CAP_BOTTOM} />
    </Frame>
  );
};

/* ───────── 3. 碎片 → SSOT ───────── */
export const VCompress: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = (frame % 40) / 40;
  const stat = useEnter(70, 10);
  return (
    <Frame page={3} tint={C.orange}>
      <div style={{ position: "absolute", left: 90, top: 150, fontFamily: FONT_ZH, fontWeight: 900, fontSize: 108, color: C.white, lineHeight: 1.2 }}>
        碎片資訊
        <br />
        <span style={{ color: C.orange }}>→</span> 結構化知識
      </div>

      <div style={{ position: "absolute", left: 90, top: 520, opacity: useEnter(5) }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 36, color: C.gray, marginBottom: 20 }}>影片・貼文・筆記</div>
        <PixelCube n={8} cell={40} messy seed="a" />
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {new Array(10).fill(0).map((_, i) => {
          const y0 = 640 + i * 26;
          return (
            <path
              key={i}
              d={`M 420 ${y0} C 470 ${y0}, 480 790, 540 790`}
              stroke={i % 3 ? C.cyan : C.orange}
              strokeWidth={3}
              fill="none"
              pathLength={1}
              strokeDasharray="0.2 0.8"
              strokeDashoffset={-flow - i * 0.07}
              opacity={0.8}
            />
          );
        })}
      </svg>

      <div style={{ position: "absolute", left: 540, top: 560, transform: `scale(${useEnter(20)})` }}>
        <Glass
          color={C.orange}
          style={{
            width: 450,
            height: 460,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(${C.orange}22 2px, transparent 2px), linear-gradient(90deg, ${C.orange}22 2px, transparent 2px)`,
            backgroundSize: "44px 44px",
          }}
        >
          <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 64, color: C.white, letterSpacing: 4 }}>IPPOO</div>
          <div
            style={{
              marginTop: 20,
              padding: "18px 40px",
              border: `4px solid ${C.cyan}`,
              borderRadius: 16,
              background: "rgba(5,10,30,0.9)",
              boxShadow: `0 0 40px ${C.cyan}`,
              fontFamily: FONT_EN,
              fontWeight: 900,
              fontSize: 84,
              color: C.white,
            }}
          >
            SSOT
          </div>
          <div style={{ marginTop: 20, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, color: C.gold }}>唯一事實來源</div>
        </Glass>
      </div>

      <div style={{ position: "absolute", left: 150, top: 1120, opacity: useEnter(45) }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 36, color: C.gray, marginBottom: 16 }}>Obsidian</div>
        <PixelCube n={4} cell={56} messy={false} seed="b" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 520,
          top: 1120,
          opacity: stat,
          transform: `translateY(${(1 - stat) * 60}px)`,
          lineHeight: 1.1,
        }}
      >
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 130, color: C.white }}>
          雜訊<span style={{ color: C.cyan }}>↓</span>
        </div>
        <GradientText size={130} grad={GRAD_WARM}>
          精準↑
        </GradientText>
      </div>
      <Caption text="把碎片資訊，壓縮成唯一事實來源" highlight="唯一事實來源" delay={30} size={58} bottom={CAP_BOTTOM} />
    </Frame>
  );
};

/* ───────── 4. Skills 技能包 ───────── */
export const VSkills: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useEnter(0, 12);
  const count = Math.round(interpolate(frame, [20, 100], [0, 12], clamp));
  return (
    <Frame page={4} tint={C.orange}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", opacity: card }}>
        <span style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 170, color: C.gold, textShadow: `0 0 40px ${C.orange}` }}>
          {count}
        </span>
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 90, color: C.white }}> 套專屬 Skills</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 290,
          top: 400,
          width: 500,
          height: 420,
          borderRadius: 50,
          border: `4px solid ${C.orange}`,
          background: "rgba(60,25,5,0.85)",
          boxShadow: `0 0 90px ${C.orange}, 18px 14px 0 -4px rgba(60,25,5,0.5), 36px 28px 0 -8px rgba(60,25,5,0.3)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${card})`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 120,
              height: 120,
              marginTop: i ? -90 : 0,
              background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`,
              transform: `rotateX(60deg) rotateZ(45deg) translateY(${Math.sin(frame / 15 + i) * 6}px)`,
              boxShadow: `0 0 30px ${C.orange}`,
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
        <div style={{ marginTop: 50, fontFamily: FONT_EN, fontWeight: 900, fontSize: 72, color: C.white }}>Snapshot</div>
        <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 56, color: C.white }}>/ Restore</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 60,
          top: 880,
          width: 960,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        {SKILLS.map((s, i) => {
          const e = useEnter(20 + i * 6, 13);
          return (
            <div key={s} style={{ opacity: e, transform: `translateY(${(1 - e) * -160}px) scale(${0.7 + 0.3 * e})` }}>
              <Glass
                color={i % 2 ? C.blue : C.cyan}
                style={{ height: 118, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px", borderRadius: 18 }}
              >
                <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 40, color: C.white, whiteSpace: "nowrap" }}>{s}</div>
              </Glass>
            </div>
          );
        })}
      </div>
      <Caption text="把經驗打包成技能，隨時一鍵 Restore" highlight="一鍵 Restore" delay={60} size={54} bottom={CAP_BOTTOM} />
    </Frame>
  );
};

/* ───────── 5. 路徑探索 ───────── */
export const VExplore: React.FC = () => {
  const frame = useCurrentFrame();
  const pos = LINES.map((_, i) => ({ x: 90 + (i % 2) * 470, y: 780 + Math.floor(i / 2) * 175 }));
  const grow = interpolate(frame, [10, 60], [0, 1], clamp);
  const n = useEnter(60, 9);
  const hubX = 540;
  const hubY = 660;
  return (
    <Frame page={5}>
      <div style={{ position: "absolute", left: 90, top: 140, fontFamily: FONT_ZH, fontWeight: 900, fontSize: 120, color: C.white, opacity: useEnter(0) }}>
        路徑探索
      </div>
      <div style={{ position: "absolute", left: 90, top: 300, opacity: n, display: "flex", alignItems: "baseline", gap: 24 }}>
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 100, color: C.white }}>跨界</span>
        <span style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: 130, color: C.cyan, textShadow: `0 0 40px ${C.cyan}` }}>× N</span>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {pos.map((p, i) => {
          const tx = p.x + (i % 2 ? 0 : 430);
          const ty = p.y + 70;
          return (
            <g key={i}>
              <path
                d={`M ${hubX} ${hubY} C ${hubX} ${ty}, ${hubX} ${ty}, ${tx} ${ty}`}
                stroke={C.cyan}
                strokeWidth={5}
                fill="none"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - grow}
                style={{ filter: `drop-shadow(0 0 10px ${C.cyan})` }}
              />
            </g>
          );
        })}
      </svg>

      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", opacity: useEnter(0) }}>
        <Glass color={C.cyan} style={{ padding: "22px 48px" }}>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 76, color: C.white }}>跨界探索</div>
        </Glass>
      </div>

      {LINES.map((l, i) => {
        const e = useEnter(25 + i * 5, 13);
        const bar = interpolate(frame, [40 + i * 5, 120 + i * 3], [0, 1], clamp);
        return (
          <div key={l} style={{ position: "absolute", left: pos[i].x, top: pos[i].y, opacity: e, transform: `scale(${0.6 + 0.4 * e})` }}>
            <Glass color={i % 2 ? C.blue : C.cyan} style={{ width: 430, padding: "12px 22px", borderRadius: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 10, height: 10, borderRadius: 5, background: "#cbd5e1" }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ fontFamily: FONT_EN, fontWeight: 700, fontSize: 32, color: C.cyan }}>&gt;_</span>
                <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 44, color: C.white, whiteSpace: "nowrap" }}>{l}</span>
              </div>
              <div style={{ marginTop: 8, height: 8, background: "#1e293b", borderRadius: 4 }}>
                <div style={{ width: `${bar * 100}%`, height: 8, borderRadius: 4, background: C.cyan, boxShadow: `0 0 10px ${C.cyan}` }} />
              </div>
            </Glass>
          </div>
        );
      })}
      <Caption text="八條事業線，同時平行探索" highlight="同時平行探索" delay={40} size={62} bottom={CAP_BOTTOM} />
    </Frame>
  );
};

/* ───────── 6. 完整署名 ───────── */
export const VClose: React.FC = () => {
  const a = useEnter(0, 12);
  const b = useEnter(15);
  const c = useEnter(35);
  const rows = [
    "益力康生技集團 董事長",
    "CGM Coach 血糖教練",
    "資策會・工研院 AI 認證講師",
    "生成式 AI 創業經營導師",
    "高爾夫・匹克球 國家級教練",
    "台南市街頭藝人（國標舞）",
  ];
  return (
    <Frame page={6}>
      <div style={{ position: "absolute", left: 300, top: 130, transform: `scale(${a})` }}>
        <AgentCore size={480} label="" color={C.cyan} />
        <div
          style={{
            position: "absolute",
            inset: 130,
            borderRadius: 34,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${C.cyan}`,
          }}
        >
          <Img src={staticFile("easycure-logo.png")} style={{ width: 200, height: 200 }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 104, color: C.white, opacity: b, lineHeight: 1.2 }}>不是不務正業</div>
        <div style={{ opacity: b, lineHeight: 1.3 }}>
          <GradientText size={90}>是跨界融合的最高境界</GradientText>
        </div>
      </div>

      <div style={{ position: "absolute", left: 70, right: 70, top: 960, opacity: c, transform: `translateY(${(1 - c) * 40}px)` }}>
        <Glass color={C.orange} style={{ padding: "28px 40px" }}>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 56, color: C.white }}>
            AI Coach 益力康陳董<span style={{ fontSize: 42, color: C.gold }}>（陳俊宏）</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", marginTop: 8 }}>
            {rows.map((r) => (
              <div key={r} style={{ marginTop: 8, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, color: "#dbe4f5" }}>
                ▸ {r}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontFamily: FONT_EN, fontWeight: 700, fontSize: 30, color: C.cyan }}>
            © 2026 AI to Agent ・ All rights reserved
          </div>
        </Glass>
      </div>
      <Caption text="九月進化完成，十月繼續升級" highlight="繼續升級" delay={50} size={62} bottom={CAP_BOTTOM} />
    </Frame>
  );
};
