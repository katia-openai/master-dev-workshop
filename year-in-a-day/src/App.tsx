import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { JourneyProgress } from "./components/JourneyProgress";
import { chapters } from "./data/journey";

const JourneyGlobe = lazy(() =>
  import("./components/JourneyGlobe").then((module) => ({
    default: module.JourneyGlobe,
  })),
);

const KineticChoreography = lazy(() =>
  import("./components/KineticChoreography").then((module) => ({
    default: module.KineticChoreography,
  })),
);

const STATES_PER_CITY = 5;
const TOTAL_STATES = chapters.length * STATES_PER_CITY;
const LAST_STATE = TOTAL_STATES - 1;

function smoothstep(edge0: number, edge1: number, value: number) {
  const normalized = Math.max(
    0,
    Math.min(1, (value - edge0) / Math.max(0.0001, edge1 - edge0)),
  );

  return normalized * normalized * (3 - 2 * normalized);
}

function ScrollArrow() {
  return (
    <svg viewBox="0 0 18 26" fill="none" aria-hidden="true">
      <path
        d="M9 1v21m0 0-6-6m6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const journeyRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeMoment, setActiveMoment] = useState(0);
  const globeProgress = useMotionValue(0);
  const chapterProgress = useMotionValue(0);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });
  const scrollCueOpacity = useTransform(
    scrollYProgress,
    [0, 0.035, 0.12],
    [1, 1, 0],
  );
  const cityCopyLift = useTransform(
    chapterProgress,
    [0, 0.2, 0.78, 1],
    [0, -7, -7, -14],
  );

  const syncJourneyState = useCallback(
    (value: number) => {
      const globalPosition = Math.max(0, Math.min(LAST_STATE, value * LAST_STATE));
      const nextChapter = Math.min(
        chapters.length - 1,
        Math.floor(globalPosition / STATES_PER_CITY),
      );
      const chapterPosition = Math.max(
        0,
        globalPosition - nextChapter * STATES_PER_CITY,
      );
      const nextMoment = Math.min(
        STATES_PER_CITY - 1,
        Math.round(chapterPosition),
      );

      const nextChapterProgress = Math.min(
        1,
        chapterPosition / STATES_PER_CITY,
      );
      const cityTravel =
        nextChapter < chapters.length - 1
          ? smoothstep(0.68, 0.98, nextChapterProgress)
          : 0;

      chapterProgress.set(nextChapterProgress);
      globeProgress.set(
        (nextChapter + cityTravel) / (chapters.length - 1),
      );
      setActiveChapter((previous) =>
        previous === nextChapter ? previous : nextChapter,
      );
      setActiveMoment((previous) =>
        previous === nextMoment ? previous : nextMoment,
      );
    },
    [chapterProgress, globeProgress],
  );

  useMotionValueEvent(scrollYProgress, "change", syncJourneyState);

  useEffect(() => {
    syncJourneyState(scrollYProgress.get());
  }, [scrollYProgress, syncJourneyState]);

  const scrollToProgress = useCallback(
    (position: number, behavior: ScrollBehavior = "smooth") => {
      const journey = journeyRef.current;

      if (!journey) return;

      const top = journey.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(0, journey.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: top + travel * Math.max(0, Math.min(1, position)),
        behavior: prefersReducedMotion ? "instant" : behavior,
      });
    },
    [prefersReducedMotion],
  );

  const navigateToChapter = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(chapters.length - 1, index));
      const targetState =
        nextIndex * STATES_PER_CITY + (nextIndex === 0 ? 0 : 0.08);

      scrollToProgress(targetState / LAST_STATE);
    },
    [scrollToProgress],
  );

  const advanceOneState = useCallback(() => {
    const nextPosition = Math.min(
      1,
      scrollYProgress.get() + 1 / LAST_STATE,
    );

    scrollToProgress(nextPosition);
  }, [scrollToProgress, scrollYProgress]);

  const chapter = chapters[activeChapter];
  const moment = chapter.moments[activeMoment];
  const palette = {
    "--season-accent": chapter.accent,
    "--season-glow": chapter.glow,
    "--scene-atmosphere": chapter.atmosphere,
  } as CSSProperties;

  return (
    <main className="day-journey">
      <section
        ref={journeyRef}
        className="journey"
        aria-label="An abstract journey through five cities, seasons, and times of day"
        data-testid="pinned-journey"
      >
        <motion.div
          className="journey__sticky"
          animate={{ backgroundColor: chapter.atmosphere }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          style={palette}
          data-active-city={chapter.id}
          data-active-moment={activeMoment + 1}
          data-active-landmark={moment.landmark}
        >
          <h1 className="sr-only">
            Five cities across the course of a year and a day
          </h1>

          <div className="scene-atmosphere" aria-hidden="true">
            <span className="scene-atmosphere__light" />
            <span className="scene-atmosphere__grain" />
          </div>

          <AnimatePresence initial={false}>
            <motion.div
              key={`season-${chapter.id}`}
              className={`season-field season-field--${chapter.id}`}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.82 }}
              aria-hidden="true"
            >
              {Array.from({ length: 28 }, (_, index) => (
                <span key={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          <Suspense fallback={<div className="kinetic-scene__fallback" />}>
            <KineticChoreography
              activeChapter={activeChapter}
              progress={chapterProgress}
              reducedMotion={prefersReducedMotion}
            />
          </Suspense>

          <AnimatePresence initial={false}>
            <motion.div
              key={`foreground-${chapter.id}`}
              className={`foreground-depth foreground-depth--${chapter.id}`}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.72 }}
              aria-hidden="true"
            >
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="globe-stage">
            <Suspense fallback={<div className="globe globe--fallback" />}>
              <JourneyGlobe
                activeChapter={activeChapter}
                progress={globeProgress}
                reducedMotion={prefersReducedMotion}
                onNavigate={navigateToChapter}
              />
            </Suspense>
          </div>

          <motion.article
            key={chapter.id}
            className="chapter"
            initial={
              prefersReducedMotion ? false : { opacity: 0, x: -18, y: 8 }
            }
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.65 }}
            style={{ translateY: cityCopyLift }}
          >
            <h2 className="chapter__city">{chapter.city}</h2>
            <p className="chapter__copy">{chapter.copy}</p>
          </motion.article>

          <JourneyProgress
            progress={scrollYProgress}
            activeChapter={activeChapter}
            onNavigate={navigateToChapter}
          />

          <motion.button
            type="button"
            className="scroll-cue"
            style={{ opacity: scrollCueOpacity }}
            aria-label="Advance to the next movement"
            onClick={advanceOneState}
          >
            <ScrollArrow />
          </motion.button>

          <motion.div
            className="journey__travel-progress"
            style={{ scaleX: scrollYProgress }}
            aria-hidden="true"
          />
        </motion.div>
      </section>
    </main>
  );
}
