import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { SceneClose, SceneCompress, SceneCover, SceneExplore, ScenePipeline, SceneSkills } from "./scenes";
import { FPS, SCENE, TOTAL } from "./theme";

const ORDER = [SceneCover, ScenePipeline, SceneCompress, SceneSkills, SceneExplore, SceneClose];

export const ProgressFilm: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0E27" }}>
    {ORDER.map((S, i) => (
      <Sequence key={i} from={i * SCENE} durationInFrames={SCENE}>
        <S />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition
    id="ProgressFilm"
    component={ProgressFilm}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
