import type { MotionValue } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
import { chapters, interpolateCoordinates } from "../data/journey";

type JourneyGlobeProps = {
  activeChapter: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
  onNavigate: (index: number) => void;
};

const radians = Math.PI / 180;
const front = new THREE.Vector3(0, 0, 1);
const verticalAxis = new THREE.Vector3(0, 1, 0);

const globeThemes = [
  {
    surface: "#887780",
    emissive: "#1a0813",
    dawn: "#ff9fb7",
    moon: "#9fb2ef",
    cloud: "#ffe0ea",
    cityLights: "#ffc2ad",
    roughness: 0.72,
    clearcoat: 0.3,
    cloudOpacity: 0.2,
    lightOpacity: 0.64,
    dawnIntensity: 4.8,
    moonIntensity: 2.15,
    exposure: 1.01,
  },
  {
    surface: "#978164",
    emissive: "#231405",
    dawn: "#ffc368",
    moon: "#51a7c8",
    cloud: "#ead8bd",
    cityLights: "#ffc778",
    roughness: 0.83,
    clearcoat: 0.14,
    cloudOpacity: 0.07,
    lightOpacity: 0.42,
    dawnIntensity: 6.2,
    moonIntensity: 1.05,
    exposure: 1.08,
  },
  {
    surface: "#89786d",
    emissive: "#1b0e08",
    dawn: "#eda56e",
    moon: "#a3a0b7",
    cloud: "#eadccf",
    cityLights: "#ffc59c",
    roughness: 0.76,
    clearcoat: 0.27,
    cloudOpacity: 0.15,
    lightOpacity: 0.6,
    dawnIntensity: 4.65,
    moonIntensity: 1.7,
    exposure: 1.01,
  },
  {
    surface: "#707887",
    emissive: "#080c1d",
    dawn: "#ff8e9e",
    moon: "#668ed8",
    cloud: "#dce8ff",
    cityLights: "#ffd1b0",
    roughness: 0.63,
    clearcoat: 0.44,
    cloudOpacity: 0.21,
    lightOpacity: 0.9,
    dawnIntensity: 3.65,
    moonIntensity: 2.85,
    exposure: 0.96,
  },
  {
    surface: "#687f92",
    emissive: "#061426",
    dawn: "#82cbee",
    moon: "#82adff",
    cloud: "#e0f5ff",
    cityLights: "#acdfff",
    roughness: 0.58,
    clearcoat: 0.56,
    cloudOpacity: 0.36,
    lightOpacity: 0.5,
    dawnIntensity: 2.9,
    moonIntensity: 4.35,
    exposure: 1.04,
  },
] as const;

function latLngVector(latitude: number, longitude: number, radius = 1) {
  const lat = latitude * radians;
  const lng = longitude * radians;

  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lng) * radius,
    Math.sin(lat) * radius,
    -Math.cos(lat) * Math.sin(lng) * radius,
  );
}

function focusQuaternion(latitude: number, longitude: number) {
  return new THREE.Quaternion().setFromUnitVectors(
    latLngVector(latitude, longitude).normalize(),
    front,
  );
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

export function JourneyGlobe({
  activeChapter,
  progress,
  reducedMotion,
  onNavigate,
}: JourneyGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeChapterRef = useRef(activeChapter);
  const reducedMotionRef = useRef(reducedMotion);
  const manualRotationRef = useRef(0);
  const manualRotationTargetRef = useRef(0);
  const dragRef = useRef<{ x: number; rotation: number } | null>(null);
  const [webGlAvailable, setWebGlAvailable] = useState(true);
  const [ready, setReady] = useState(false);

  activeChapterRef.current = activeChapter;
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    manualRotationTargetRef.current = 0;
  }, [activeChapter]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebGlAvailable(false);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    camera.position.set(0, 0, 9.15);

    const earth = new THREE.Group();
    const surface = new THREE.Group();
    earth.add(surface);
    scene.add(earth);

    const textureLoader = new THREE.TextureLoader();
    const day = textureLoader.load("/textures/earth/day.jpg");
    const normal = textureLoader.load("/textures/earth/normal.jpg");
    const specular = textureLoader.load("/textures/earth/specular.jpg");
    const lights = textureLoader.load("/textures/earth/lights.png");
    const clouds = textureLoader.load("/textures/earth/clouds.png");

    day.colorSpace = THREE.SRGBColorSpace;
    lights.colorSpace = THREE.SRGBColorSpace;
    clouds.colorSpace = THREE.SRGBColorSpace;
    [day, normal, specular, lights, clouds].forEach((texture) => {
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    });

    const sphereGeometry = new THREE.SphereGeometry(2, 96, 72);
    const earthMaterial = new THREE.MeshPhysicalMaterial({
      map: day,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.38, 0.38),
      roughnessMap: specular,
      color: "#747a7e",
      metalness: 0.08,
      roughness: 0.72,
      clearcoat: 0.34,
      clearcoatRoughness: 0.58,
      emissive: "#080b12",
      emissiveIntensity: 0.24,
    });
    const planet = new THREE.Mesh(sphereGeometry, earthMaterial);
    planet.castShadow = true;
    planet.receiveShadow = true;
    surface.add(planet);

    const lightMaterial = new THREE.MeshBasicMaterial({
      map: lights,
      color: "#ffd0a8",
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const lightLayer = new THREE.Mesh(
      sphereGeometry,
      lightMaterial,
    );
    lightLayer.scale.setScalar(1.003);
    surface.add(lightLayer);

    const cloudMaterial = new THREE.MeshPhysicalMaterial({
      map: clouds,
      alphaMap: clouds,
      color: "#e7edf2",
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      roughness: 0.9,
    });
    const cloudLayer = new THREE.Mesh(
      sphereGeometry,
      cloudMaterial,
    );
    cloudLayer.scale.setScalar(1.0125);
    surface.add(cloudLayer);

    const ambient = new THREE.HemisphereLight(0xb8c7df, 0x08070b, 1.08);
    const dawn = new THREE.DirectionalLight(0xffb58f, 5.1);
    const moon = new THREE.DirectionalLight(0x8db5ef, 1.8);
    dawn.position.set(-5.6, 4.8, 6.4);
    moon.position.set(5.2, 1.4, 2.8);
    scene.add(ambient, dawn, moon);

    let currentQuaternion = focusQuaternion(
      chapters[activeChapterRef.current].latitude,
      chapters[activeChapterRef.current].longitude,
    );
    earth.quaternion.copy(currentQuaternion);

    const markerVectors = chapters.map((chapter) =>
      latLngVector(chapter.latitude, chapter.longitude, 2.07),
    );
    const targetQuaternion = new THREE.Quaternion();
    const manualQuaternion = new THREE.Quaternion();
    const projected = new THREE.Vector3();
    const resolvedThemes = globeThemes.map((theme) => ({
      ...theme,
      surface: new THREE.Color(theme.surface),
      emissive: new THREE.Color(theme.emissive),
      dawn: new THREE.Color(theme.dawn),
      moon: new THREE.Color(theme.moon),
      cloud: new THREE.Color(theme.cloud),
      cityLights: new THREE.Color(theme.cityLights),
    }));
    let frameId = 0;
    let disposed = false;
    let frame = 0;
    let announcedReady = false;
    let lastTimestamp = 0;
    let averageFrameMs = 1000 / 60;

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const render = (timestamp: number) => {
      if (disposed) return;

      const deltaSeconds =
        lastTimestamp === 0
          ? 1 / 60
          : Math.min(0.05, Math.max(0.001, (timestamp - lastTimestamp) / 1000));
      lastTimestamp = timestamp;
      averageFrameMs = THREE.MathUtils.lerp(
        averageFrameMs,
        deltaSeconds * 1000,
        0.06,
      );
      const coordinates = interpolateCoordinates(progress.get());
      targetQuaternion.copy(
        focusQuaternion(coordinates.latitude, coordinates.longitude),
      );
      manualRotationRef.current = reducedMotionRef.current
        ? manualRotationTargetRef.current
        : THREE.MathUtils.damp(
            manualRotationRef.current,
            manualRotationTargetRef.current,
            5.2,
            deltaSeconds,
          );
      manualQuaternion.setFromAxisAngle(
        verticalAxis,
        manualRotationRef.current,
      );
      targetQuaternion.premultiply(manualQuaternion);

      const easing = reducedMotionRef.current
        ? 1
        : 1 - Math.exp(-4.1 * deltaSeconds);
      currentQuaternion.slerp(targetQuaternion, easing);
      earth.quaternion.copy(currentQuaternion);

      const time = reducedMotionRef.current ? 0 : timestamp * 0.001;
      const theme = resolvedThemes[activeChapterRef.current];
      const themeEasing = reducedMotionRef.current
        ? 1
        : 1 - Math.exp(-2.9 * deltaSeconds);

      earthMaterial.color.lerp(theme.surface, themeEasing);
      earthMaterial.emissive.lerp(theme.emissive, themeEasing);
      earthMaterial.roughness = THREE.MathUtils.lerp(
        earthMaterial.roughness,
        theme.roughness,
        themeEasing,
      );
      earthMaterial.clearcoat = THREE.MathUtils.lerp(
        earthMaterial.clearcoat,
        theme.clearcoat,
        themeEasing,
      );
      dawn.color.lerp(theme.dawn, themeEasing);
      dawn.intensity = THREE.MathUtils.lerp(
        dawn.intensity,
        theme.dawnIntensity,
        themeEasing,
      );
      moon.color.lerp(theme.moon, themeEasing);
      moon.intensity = THREE.MathUtils.lerp(
        moon.intensity,
        theme.moonIntensity,
        themeEasing,
      );
      cloudMaterial.color.lerp(theme.cloud, themeEasing);
      cloudMaterial.opacity = THREE.MathUtils.lerp(
        cloudMaterial.opacity,
        theme.cloudOpacity,
        themeEasing,
      );
      lightMaterial.color.lerp(theme.cityLights, themeEasing);
      lightMaterial.opacity = THREE.MathUtils.lerp(
        lightMaterial.opacity,
        theme.lightOpacity,
        themeEasing,
      );
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        theme.exposure,
        themeEasing,
      );

      cloudLayer.rotation.y = time * 0.006;
      surface.rotation.z = Math.sin(time * 0.16) * 0.004;

      const bounds = container.getBoundingClientRect();

      markerVectors.forEach((vector, index) => {
        const element = markerRefs.current[index];

        if (!element) return;

        projected.copy(vector).applyQuaternion(currentQuaternion);
        const visible = projected.z > 0.24;
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * bounds.width;
        const y = (-projected.y * 0.5 + 0.5) * bounds.height;

        element.style.transform = `translate3d(${x - 17}px, ${y - 17}px, 0)`;
        element.style.opacity = visible ? "1" : "0.3";
        element.style.pointerEvents = "auto";
        element.dataset.hemisphere = visible ? "front" : "back";
        element.removeAttribute("aria-hidden");
      });

      renderer.render(scene, camera);

      if (frame % 12 === 0) {
        canvas.dataset.frameMs = averageFrameMs.toFixed(2);
        canvas.dataset.motion = "time-damped";
      }

      if (!announcedReady) {
        announcedReady = true;
        canvas.dataset.renderer = "active";
        setReady(true);
      }

      frame += 1;
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      disposeObject(scene);
      [day, normal, specular, lights, clouds].forEach((texture) =>
        texture.dispose(),
      );
      renderer.dispose();
    };
  }, [progress]);

  const beginDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      x: event.clientX,
      rotation: manualRotationTargetRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const updateDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current || !containerRef.current) return;

    const width = Math.max(1, containerRef.current.offsetWidth);
    manualRotationTargetRef.current =
      dragRef.current.rotation +
      ((event.clientX - dragRef.current.x) / width) * Math.PI * 1.7;
  };

  const finishDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`globe${webGlAvailable ? "" : " globe--fallback"}${
        ready ? " globe--ready" : ""
      }`}
      role="group"
      aria-label={`Interactive Earth focused on ${chapters[activeChapter].city}. Choose a real geographic marker for Tokyo, Cairo, Paris, New York, or Ushuaia in Argentine Patagonia.`}
      data-testid="journey-globe"
    >
      <div className="globe__shadow" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="globe__canvas"
        aria-hidden="true"
        data-renderer="loading"
        onPointerDown={beginDrag}
        onPointerMove={updateDrag}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      />
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          ref={(element) => {
            markerRefs.current[index] = element;
          }}
          type="button"
          className={`globe__marker${
            index === activeChapter ? " globe__marker--active" : ""
          }`}
          aria-label={`Explore ${chapter.city}, ${chapter.region}`}
          aria-current={index === activeChapter ? "location" : undefined}
          data-testid={`globe-marker-${chapter.id}`}
          onClick={() => onNavigate(index)}
        >
          <span className="globe__marker-halo" aria-hidden="true" />
          <span className="globe__marker-dot" aria-hidden="true" />
          <span className="globe__marker-label" aria-hidden="true">
            {chapter.city}
          </span>
        </button>
      ))}
    </div>
  );
}
