import { motion, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties } from "react";
import { chapters } from "../data/journey";

type JourneyProgressProps = {
  progress: MotionValue<number>;
  activeChapter: number;
  onNavigate: (index: number) => void;
};

const VIEWBOX_HEIGHT = 126;
const SOLAR_START = { x: 52, y: 106 };
const SOLAR_CONTROL = { x: 500, y: -76 };
const SOLAR_END = { x: 948, y: 106 };
const solarPath = "M 52 106 Q 500 -76 948 106";
const totalStates = chapters.reduce(
  (total, chapter) => total + chapter.moments.length,
  0,
);

let stateOffset = 0;
const cityScrollStops = chapters.map((chapter) => {
  const stop = stateOffset / (totalStates - 1);
  stateOffset += chapter.moments.length;
  return stop;
});
const citySolarStops = [0.015, 0.25, 0.5, 0.75, 0.985] as const;

function solarPoint(value: number) {
  const t = Math.max(0, Math.min(1, value));
  const inverse = 1 - t;

  return {
    x:
      inverse * inverse * SOLAR_START.x +
      2 * inverse * t * SOLAR_CONTROL.x +
      t * t * SOLAR_END.x,
    y:
      inverse * inverse * SOLAR_START.y +
      2 * inverse * t * SOLAR_CONTROL.y +
      t * t * SOLAR_END.y,
  };
}

function journeyToSolarProgress(value: number) {
  const clamped = Math.max(0, Math.min(1, value));

  for (let index = 0; index < cityScrollStops.length - 1; index += 1) {
    const start = cityScrollStops[index];
    const end = cityScrollStops[index + 1];

    if (clamped <= end) {
      const segment = (clamped - start) / Math.max(0.0001, end - start);
      return citySolarStops[index] +
        segment * (citySolarStops[index + 1] - citySolarStops[index]);
    }
  }

  const finalStart = cityScrollStops.at(-1) ?? 0;
  const finalSolarStart = citySolarStops.at(-1) ?? 0.94;
  const finalSegment =
    (clamped - finalStart) / Math.max(0.0001, 1 - finalStart);

  return finalSolarStart + finalSegment * (1 - finalSolarStart);
}

const cityStops = citySolarStops.map(solarPoint);

export function JourneyProgress({
  progress,
  activeChapter,
  onNavigate,
}: JourneyProgressProps) {
  const solarProgress = useTransform(progress, journeyToSolarProgress);
  const sunX = useTransform(solarProgress, (value) => solarPoint(value).x);
  const sunY = useTransform(solarProgress, (value) => solarPoint(value).y);

  return (
    <nav
      className="journey-progress"
      aria-label="Cities and seasons along the path of the sun"
      data-testid="sun-stepper"
    >
      <svg
        className="journey-progress__orbit"
        viewBox={`0 0 1000 ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="solar-flare">
            <stop offset="0%" stopColor="#fffdf2" stopOpacity="0.98" />
            <stop
              offset="26%"
              stopColor="var(--season-accent)"
              stopOpacity="0.72"
            />
            <stop
              offset="100%"
              stopColor="var(--season-accent)"
              stopOpacity="0"
            />
          </radialGradient>
          <radialGradient id="solar-dawn-disc" cx="45%" cy="32%">
            <stop offset="0%" stopColor="#fffbe8" />
            <stop offset="48%" stopColor="#ffc988" />
            <stop offset="100%" stopColor="#d8668f" />
          </radialGradient>
          <radialGradient id="solar-noon-disc" cx="42%" cy="36%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#fff2b6" />
            <stop offset="100%" stopColor="#e7ad54" />
          </radialGradient>
          <radialGradient id="solar-dusk-disc" cx="42%" cy="34%">
            <stop offset="0%" stopColor="#fff1d8" />
            <stop offset="48%" stopColor="#f39a88" />
            <stop offset="100%" stopColor="#8d73bd" />
          </radialGradient>
        </defs>

        <path className="journey-progress__horizon" d="M 20 106 H 980" />
        <path
          className="journey-progress__arc journey-progress__arc--track"
          d={solarPath}
        />

        <g className="journey-progress__day-cue">
          <g className="journey-progress__phase journey-progress__phase--rise">
            <circle
              className="journey-progress__phase-glow"
              cx="52"
              cy="104"
              r="22"
            />
            <path
              className="journey-progress__phase-disc"
              d="M 42 106 A 10 10 0 0 1 62 106 Z"
            />
            <path
              className="journey-progress__phase-rays"
              d="M 52 90 V 80 M 38 94 L 30 87 M 66 94 L 74 87 M 30 105 H 21 M 74 105 H 83"
            />
          </g>
          <g className="journey-progress__phase journey-progress__phase--noon">
            <circle
              className="journey-progress__phase-glow"
              cx="500"
              cy="15"
              r="19"
            />
            <circle
              className="journey-progress__phase-disc"
              cx="500"
              cy="15"
              r="5.5"
            />
            <path
              className="journey-progress__phase-rays"
              d="M 500 4 V 0 M 500 30 V 26 M 489 15 H 485 M 515 15 H 511 M 492 7 L 489 4 M 508 7 L 511 4 M 492 23 L 489 26 M 508 23 L 511 26"
            />
          </g>
          <g className="journey-progress__phase journey-progress__phase--set">
            <circle
              className="journey-progress__phase-glow"
              cx="948"
              cy="104"
              r="22"
            />
            <path
              className="journey-progress__phase-disc"
              d="M 938 106 A 10 10 0 0 1 958 106 Z"
            />
            <path
              className="journey-progress__phase-rays"
              d="M 948 90 V 80 M 934 94 L 926 87 M 962 94 L 970 87 M 926 105 H 917 M 970 105 H 979"
            />
          </g>
        </g>

        <motion.circle
          className="journey-progress__active-flare"
          cx={sunX}
          cy={sunY}
          r="25"
        />
        <motion.circle
          className="journey-progress__active-ring"
          cx={sunX}
          cy={sunY}
          r="9.5"
        />
        <motion.circle
          className="journey-progress__active-sun"
          cx={sunX}
          cy={sunY}
          r="5.4"
        />
      </svg>

      <ol className="journey-progress__cities">
        {chapters.map((chapter, index) => {
          const stop = cityStops[index];
          const style = {
            "--city-x": `${(stop.x / 1000) * 100}%`,
            "--city-y": `${(stop.y / VIEWBOX_HEIGHT) * 100}%`,
          } as CSSProperties;

          return (
            <li key={chapter.id} style={style}>
              <button
                type="button"
                className={`journey-progress__city-stop${
                  index === activeChapter
                    ? " journey-progress__city-stop--active"
                    : ""
                }`}
                aria-label={`Go to ${chapter.city}, ${chapter.season.toLowerCase()}`}
                aria-current={index === activeChapter ? "step" : undefined}
                data-testid={`sun-city-${chapter.id}`}
                onClick={() => onNavigate(index)}
              >
                <span className="journey-progress__city-dot" aria-hidden="true" />
                <span className="journey-progress__city-name" aria-hidden="true">
                  {chapter.city}
                </span>
                <span className="journey-progress__season" aria-hidden="true">
                  {chapter.season}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
