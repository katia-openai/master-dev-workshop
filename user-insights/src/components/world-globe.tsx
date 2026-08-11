import createGlobe from "cobe";
import { Move, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserCity } from "@/data/insights";

export function WorldGlobe({ cities }: { cities: UserCity[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(true);

  const markers = useMemo(
    () =>
      cities.map((city, index) => ({
        location: [city.lat, city.lng] as [number, number],
        size: Math.max(0.036, Math.min(0.082, 0.034 + city.active / 46000)),
        color: (index % 4 === 0
          ? [0.53, 0.96, 0.78]
          : index % 5 === 0
            ? [0.47, 0.68, 1]
            : [0.72, 0.57, 1]) as [number, number, number],
      })),
    [cities],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    let globe: ReturnType<typeof createGlobe> | undefined;
    let animationFrameId = 0;
    let width = frame.offsetWidth;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * dpr,
        height: width * dpr,
        phi: 0,
        theta: 0.23,
        dark: 1,
        diffuse: 1.35,
        mapSamples: 22000,
        mapBrightness: 4.6,
        mapBaseBrightness: 0.055,
        baseColor: [0.15, 0.16, 0.23],
        markerColor: [0.72, 0.57, 1],
        glowColor: [0.11, 0.13, 0.23],
        markers,
        scale: 1.05,
        offset: [0, 0],
        opacity: 0.94,
      });
      setAvailable(true);
    } catch {
      setAvailable(false);
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) width = entry.contentRect.width;
    });
    observer.observe(frame);
    canvas.style.opacity = "1";

    const animate = () => {
      if (
        pointerRef.current === null &&
        !pausedRef.current &&
        !reduceMotion.matches
      ) {
        rotationRef.current += 0.0019;
      }

      globe?.update({
        phi: rotationRef.current,
        theta: 0.23,
        width: width * dpr,
        height: width * dpr,
      });
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      globe?.destroy();
    };
  }, [markers]);

  return (
    <div
      className="globe-orbit"
      aria-label={`Interactive Earth displaying ${cities.length} worldwide user locations`}
    >
      <div ref={frameRef} className="globe-frame">
        <canvas
          ref={canvasRef}
          className="globe-canvas"
          aria-label="Drag to rotate the worldwide user globe"
          data-globe-rotation="0"
          onPointerDown={(event) => {
            pointerRef.current = event.clientX;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (pointerRef.current !== null) {
              rotationRef.current += (event.clientX - pointerRef.current) / 170;
              pointerRef.current = event.clientX;
              event.currentTarget.dataset.globeRotation =
                rotationRef.current.toFixed(6);
            }
          }}
          onPointerUp={() => {
            pointerRef.current = null;
          }}
          onPointerCancel={() => {
            pointerRef.current = null;
          }}
        />
        {!available && (
          <div className="globe-fallback">
            <span>Interactive globe requires WebGL</span>
          </div>
        )}
      </div>
      <div className="globe-controls">
        <span className="drag-hint">
          <Move aria-hidden="true" />
          Drag to explore
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={paused ? "Resume globe rotation" : "Pause globe rotation"}
          title={paused ? "Resume rotation" : "Pause rotation"}
          onClick={() => {
            pausedRef.current = !pausedRef.current;
            setPaused(pausedRef.current);
          }}
        >
          {paused ? (
            <Play data-icon="inline-start" />
          ) : (
            <Pause data-icon="inline-start" />
          )}
        </Button>
      </div>
    </div>
  );
}
