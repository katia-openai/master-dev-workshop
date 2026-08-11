import { motion, useTransform, type MotionValue } from "motion/react";
import { chapters } from "../data/journey";
import { WebGLLandscape } from "./WebGLLandscape";

type ParallaxLandscapeProps = {
  activeChapter: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

type ParallaxMomentProps = ParallaxLandscapeProps & {
  momentIndex: number;
};

function smoothstep(start: number, end: number, value: number): number {
  const fraction = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return fraction * fraction * (3 - 2 * fraction);
}

function ParallaxMoment({
  activeChapter,
  momentIndex,
  progress,
  reducedMotion,
}: ParallaxMomentProps) {
  const chapter = chapters[activeChapter];
  const moment = chapter.moments[momentIndex];
  const last = chapter.moments.length - 1;

  const opacity = useTransform(progress, (value) => {
    const incoming =
      momentIndex === 0
        ? 1
        : smoothstep(
            (momentIndex - 0.5) / last - 0.05,
            (momentIndex - 0.5) / last + 0.05,
            value,
          );
    const outgoing =
      momentIndex === last
        ? 1
        : 1 -
          smoothstep(
            (momentIndex + 0.5) / last - 0.05,
            (momentIndex + 0.5) / last + 0.05,
            value,
          );

    return incoming * outgoing;
  });

  const sceneProgress = useTransform(progress, (value) =>
    Math.max(0, Math.min(1, (value - momentIndex / last) * 4 + 0.5)),
  );
  const horizontalTravel = (0.5 - moment.focus[0]) * 36;
  const verticalTravel = (0.5 - moment.focus[1]) * 25;
  const horizonX = useTransform(
    sceneProgress,
    [0, 1],
    reducedMotion
      ? ["0%", "0%"]
      : ["0%", `${horizontalTravel.toFixed(2)}%`],
  );
  const horizonY = useTransform(
    sceneProgress,
    [0, 1],
    reducedMotion ? ["0%", "0%"] : ["0%", `${verticalTravel.toFixed(2)}%`],
  );
  const horizonScale = useTransform(
    sceneProgress,
    [0, 1],
    reducedMotion ? [1.035, 1.035] : [1.04, 1.43],
  );

  return (
    <motion.div
      className={`landscape__world landscape__world--${chapter.id}`}
      style={{ opacity }}
      data-testid={`landmark-${chapter.id}-${momentIndex + 1}`}
      data-landmark-city={chapter.id}
      data-landmark-name={moment.landmark}
      data-moment-index={momentIndex}
      data-focus-x={moment.focus[0]}
      data-focus-y={moment.focus[1]}
      data-travel-x={moment.travel[0]}
      data-travel-y={moment.travel[1]}
      aria-hidden="true"
    >
      <motion.img
        className="landscape__horizon"
        src={moment.image}
        alt=""
        decoding="async"
        loading={momentIndex < 2 ? "eager" : "lazy"}
        data-depth-plane="skyline"
        style={{ x: horizonX, y: horizonY, scale: horizonScale }}
      />
    </motion.div>
  );
}

function ForegroundDepthPlanes({
  activeChapter,
  progress,
  reducedMotion,
}: ParallaxLandscapeProps) {
  const chapter = chapters[activeChapter];
  const stops = chapter.moments.map(
    (_, index) => index / (chapter.moments.length - 1),
  );
  const stillPositions = chapter.moments.map(() => "0%");
  const foregroundX = chapter.moments.map(
    (moment) => `${((0.5 - moment.focus[0]) * 27).toFixed(2)}%`,
  );
  const foregroundY = chapter.moments.map(
    (moment, index) =>
      `${((0.5 - moment.focus[1]) * 15 - index * 1.1).toFixed(2)}%`,
  );
  const midgroundX = chapter.moments.map(
    (moment) => `${((0.5 - moment.focus[0]) * 12).toFixed(2)}%`,
  );
  const midgroundY = chapter.moments.map(
    (moment) => `${((0.5 - moment.focus[1]) * 9).toFixed(2)}%`,
  );
  const closeX = useTransform(
    progress,
    stops,
    reducedMotion ? stillPositions : foregroundX,
  );
  const closeY = useTransform(
    progress,
    stops,
    reducedMotion ? stillPositions : foregroundY,
  );
  const closeScale = useTransform(
    progress,
    stops,
    reducedMotion
      ? [1.06, 1.06, 1.06, 1.06, 1.06]
      : [1.12, 1.17, 1.22, 1.28, 1.34],
  );
  const middleX = useTransform(
    progress,
    stops,
    reducedMotion ? stillPositions : midgroundX,
  );
  const middleY = useTransform(
    progress,
    stops,
    reducedMotion ? stillPositions : midgroundY,
  );
  const middleScale = useTransform(
    progress,
    stops,
    reducedMotion
      ? [1.045, 1.045, 1.045, 1.045, 1.045]
      : [1.09, 1.12, 1.16, 1.2, 1.24],
  );
  const middleOpacity = useTransform(
    progress,
    [0, 0.1, 0.3, 0.55, 0.8, 1],
    [0.16, 0.32, 0.42, 0.32, 0.46, 0.36],
  );
  const closeOpacity = useTransform(
    progress,
    [0, 0.12, 0.36, 0.62, 0.84, 1],
    [0.36, 0.29, 0.36, 0.28, 0.37, 0.31],
  );

  return (
    <div className="landscape__depth" aria-hidden="true">
      <motion.img
        key={`${chapter.id}-midground`}
        className="landscape__midground"
        src={chapter.midground}
        alt=""
        decoding="async"
        data-depth-plane="midground"
        style={{
          opacity: middleOpacity,
          x: middleX,
          y: middleY,
          scale: middleScale,
        }}
      />
      <motion.img
        key={`${chapter.id}-foreground`}
        className="landscape__foreground landscape__foreground--floating"
        src={chapter.foreground}
        alt=""
        decoding="async"
        data-depth-plane="landmark"
        style={{ opacity: closeOpacity, x: closeX, y: closeY, scale: closeScale }}
      />
    </div>
  );
}

export function ParallaxLandscape({
  activeChapter,
  progress,
  reducedMotion,
}: ParallaxLandscapeProps) {
  return (
    <div className="landscape__layers" data-testid="landscape-layers">
      {chapters[activeChapter].moments.map((_, index) => (
        <ParallaxMoment
          key={`${chapters[activeChapter].id}-${index}`}
          activeChapter={activeChapter}
          momentIndex={index}
          progress={progress}
          reducedMotion={reducedMotion}
        />
      ))}
      <WebGLLandscape
        activeChapter={activeChapter}
        progress={progress}
        reducedMotion={reducedMotion}
      />
      <ForegroundDepthPlanes
        activeChapter={activeChapter}
        progress={progress}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
