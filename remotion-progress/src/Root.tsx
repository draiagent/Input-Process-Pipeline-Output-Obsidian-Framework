import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { SceneClose, SceneCompress, SceneCover, SceneExplore, ScenePipeline, SceneSkills } from "./scenes";
import { FPS, SCENE, TOTAL } from "./theme";
import { VClose, VCompress, VCover, VExplore, VPipeline, VSkills } from "./vertical";

const ORDER = [SceneCover, ScenePipeline, SceneCompress, SceneSkills, SceneExplore, SceneClose];
const ORDER_V = [VCover, VPipeline, VCompress, VSkills, VExplore, VClose];

const Film: React.FC<{ order: React.FC[] }> = ({ order }) => (
  <AbsoluteFill style={{ background: "#0A0E27" }}>
    {order.map((S, i) => (
      <Sequence key={i} from={i * SCENE} durationInFrames={SCENE}>
        <S />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const ProgressFilm: React.FC = () => <Film order={ORDER} />;
export const ProgressFilmVertical: React.FC = () => <Film order={ORDER_V} />;

export const Root: React.FC = () => (
  <>
    <Composition id="ProgressFilm" component={ProgressFilm} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition
      id="ProgressFilmVertical"
      component={ProgressFilmVertical}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
