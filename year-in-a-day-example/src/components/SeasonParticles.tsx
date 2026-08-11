import { motion, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties } from "react";
import { chapters } from "../data/journey";

type SeasonParticlesProps = {
  chapterIndex: number;
  progress: MotionValue<number>;
};

const count = 30;

export function SeasonParticles({
  chapterIndex,
  progress,
}: SeasonParticlesProps) {
  const opacity = useTransform(progress, [0, 0.5, 1], [0.75, 1, 0.82]);
  const chapter = chapters[chapterIndex];

  return (
    <motion.div
      className={`particles particles--${chapter.particle}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => {
        const style = {
          "--particle-x": `${(index * 61 + chapterIndex * 13) % 100}%`,
          "--particle-y": `${(index * 37 + chapterIndex * 19) % 100}%`,
          "--particle-size": `${2 + ((index * 7) % 8)}px`,
          "--particle-delay": `${-((index * 1.37) % 12)}s`,
          "--particle-duration": `${10 + ((index * 3) % 11)}s`,
          "--particle-drift": `${-48 + ((index * 19) % 97)}px`,
        } as CSSProperties;

        return <span key={index} className="particles__item" style={style} />;
      })}
    </motion.div>
  );
}
