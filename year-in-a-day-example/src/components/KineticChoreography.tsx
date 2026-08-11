import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { chapters } from "../data/journey";

type KineticChoreographyProps = {
  activeChapter: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

type DanceMode = "spiral" | "radiate" | "loop" | "rise" | "drift";

type Motif =
  | "petals"
  | "torii"
  | "lantern"
  | "cairo-lantern"
  | "minaret"
  | "needles"
  | "ribbons"
  | "aurora"
  | "art-deco"
  | "bubbles"
  | "facets"
  | "stone"
  | "lattice"
  | "cathedral"
  | "leaves"
  | "clock"
  | "snow"
  | "lights"
  | "prisms"
  | "pebbles"
  | "liberty";

type DanceConfig = {
  mode: DanceMode;
  accent: string;
  secondary: string;
  metal: string;
  motifs: readonly Motif[];
};

type MaterialSet = {
  accent: THREE.MeshPhysicalMaterial;
  secondary: THREE.MeshPhysicalMaterial;
  metal: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  dark: THREE.MeshPhysicalMaterial;
  pearl: THREE.MeshStandardMaterial;
};

type AnimatedObject = {
  object: THREE.Object3D;
  origin: THREE.Vector3;
  rotation: THREE.Euler;
  spin: THREE.Vector3;
  drift: number;
};

type OrbitalLine = {
  object: THREE.Object3D;
  rotation: THREE.Euler;
  speed: number;
};

type RuntimeCity = {
  index: number;
  config: DanceConfig;
  root: THREE.Group;
  cityFrame: THREE.Group;
  stageGroups: THREE.Group[];
  animatedObjects: AnimatedObject[];
  ambientElements: THREE.Object3D[];
  orbitalLines: OrbitalLine[];
  points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  winterSnow?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  amplitude: ReturnType<typeof danceAmplitude>;
  progress: number;
};

type LandmarkAssetConfig = {
  id: string;
  source: string;
  scale: readonly [number, number];
  enterAt: number;
  focusAt: number;
  exitAt: number;
  focusX: number;
  focusY: number;
  direction: -1 | 1;
  orbitX: number;
  orbitY: number;
  orbitDepth: number;
  tint?: string;
  maxOpacity?: number;
};

const dances: readonly DanceConfig[] = [
  {
    mode: "spiral",
    accent: "#d78aa5",
    secondary: "#551117",
    metal: "#66666d",
    motifs: ["petals", "torii", "lantern", "ribbons", "needles"],
  },
  {
    mode: "radiate",
    accent: "#b88a49",
    secondary: "#185f79",
    metal: "#8b7554",
    motifs: ["bubbles", "cairo-lantern", "minaret", "facets", "stone"],
  },
  {
    mode: "loop",
    accent: "#b17740",
    secondary: "#918b80",
    metal: "#75634f",
    motifs: ["lattice", "ribbons", "cathedral", "facets", "leaves"],
  },
  {
    mode: "rise",
    accent: "#bb6878",
    secondary: "#52698f",
    metal: "#68717f",
    motifs: ["art-deco", "lights", "clock", "leaves", "snow"],
  },
  {
    mode: "drift",
    accent: "#7eb7d2",
    secondary: "#234d79",
    metal: "#6e8d98",
    motifs: ["aurora", "prisms", "snow", "pebbles", "facets"],
  },
] as const;

const landmarkAssets: ReadonlyArray<readonly LandmarkAssetConfig[]> = [
  [],
  [
    {
      id: "giza",
      source: "/sprites/cairo-giza-weathered.webp",
      scale: [3.22, 2.15],
      enterAt: 0.08,
      focusAt: 0.58,
      exitAt: 0.94,
      focusX: -1.52,
      focusY: -0.42,
      direction: 1,
      orbitX: 2.05,
      orbitY: 0.4,
      orbitDepth: 2.65,
      tint: "#b3a08d",
      maxOpacity: 0.9,
    },
    {
      id: "sphinx",
      source: "/sprites/cairo-sphinx-weathered.webp",
      scale: [2.52, 1.68],
      enterAt: 0.38,
      focusAt: 0.79,
      exitAt: 1,
      focusX: 1.5,
      focusY: -0.64,
      direction: -1,
      orbitX: 1.84,
      orbitY: 0.3,
      orbitDepth: 2.45,
      tint: "#aa9b8b",
      maxOpacity: 0.86,
    },
  ],
  [
    {
      id: "eiffel",
      source: "/sprites/paris-eiffel.webp",
      scale: [1.7, 2.55],
      enterAt: 0,
      focusAt: 0.12,
      exitAt: 1,
      focusX: 1.68,
      focusY: -0.18,
      direction: -1,
      orbitX: 2.12,
      orbitY: 0.36,
      orbitDepth: 2.5,
      maxOpacity: 0.92,
    },
    {
      id: "alexandre-bridge",
      source: "/sprites/paris-alexandre-bridge.webp",
      scale: [3.4, 2.27],
      enterAt: 0.18,
      focusAt: 0.5,
      exitAt: 0.93,
      focusX: -0.3,
      focusY: -1.46,
      direction: 1,
      orbitX: 2.72,
      orbitY: 0.54,
      orbitDepth: 2.78,
      maxOpacity: 0.86,
    },
  ],
  [
    {
      id: "empire",
      source: "/sprites/new-york.webp",
      scale: [1.64, 2.46],
      enterAt: 0,
      focusAt: 0.12,
      exitAt: 0.86,
      focusX: 1.74,
      focusY: -0.2,
      direction: 1,
      orbitX: 2.06,
      orbitY: 0.34,
      orbitDepth: 2.55,
      tint: "#dfe7ef",
      maxOpacity: 0.9,
    },
    {
      id: "brooklyn-bridge",
      source: "/sprites/new-york-brooklyn-bridge.webp",
      scale: [3.25, 2.17],
      enterAt: 0.2,
      focusAt: 0.51,
      exitAt: 0.91,
      focusX: 0.24,
      focusY: -1.4,
      direction: 1,
      orbitX: 2.68,
      orbitY: 0.52,
      orbitDepth: 2.72,
      maxOpacity: 0.84,
    },
    {
      id: "liberty",
      source: "/sprites/new-york-liberty.webp",
      scale: [1.65, 2.48],
      enterAt: 0.36,
      focusAt: 0.79,
      exitAt: 1,
      focusX: -1.66,
      focusY: -0.12,
      direction: -1,
      orbitX: 2.08,
      orbitY: 0.4,
      orbitDepth: 2.6,
      tint: "#b8cac8",
      maxOpacity: 0.9,
    },
  ],
  [
    {
      id: "les-eclaireurs",
      source: "/sprites/ushuaia-lighthouse.webp",
      scale: [2.36, 1.58],
      enterAt: 0,
      focusAt: 0.18,
      exitAt: 0.72,
      focusX: 1.62,
      focusY: -0.4,
      direction: -1,
      orbitX: 2.36,
      orbitY: 0.46,
      orbitDepth: 2.62,
      maxOpacity: 0.92,
    },
    {
      id: "end-of-world-train",
      source: "/sprites/ushuaia-train.webp",
      scale: [3.12, 1.86],
      enterAt: 0.26,
      focusAt: 0.65,
      exitAt: 1,
      focusX: -1.34,
      focusY: -0.62,
      direction: 1,
      orbitX: 2.62,
      orbitY: 0.5,
      orbitDepth: 2.72,
      maxOpacity: 0.9,
    },
  ],
];

const TAU = Math.PI * 2;

function smoothstep(edge0: number, edge1: number, value: number) {
  const normalized = THREE.MathUtils.clamp(
    (value - edge0) / Math.max(0.0001, edge1 - edge0),
    0,
    1,
  );

  return normalized * normalized * (3 - 2 * normalized);
}

function hermite(
  value: number,
  start: number,
  end: number,
  startTangent: number,
  endTangent: number,
) {
  const squared = value * value;
  const cubed = squared * value;

  return (
    (2 * cubed - 3 * squared + 1) * start +
    (cubed - 2 * squared + value) * startTangent +
    (-2 * cubed + 3 * squared) * end +
    (cubed - squared) * endTangent
  );
}

function choreographyPhase(value: number, stageCount: number) {
  const lastStage = stageCount - 1;
  const entryEnd = 0.1;
  const exitStart = 0.8;
  const travelSlope = lastStage / (exitStart - entryEnd);

  if (value < entryEnd) {
    const normalized = THREE.MathUtils.clamp(value / entryEnd, 0, 1);

    return hermite(
      normalized,
      -2,
      0,
      0,
      travelSlope * entryEnd,
    );
  }

  if (value <= exitStart) {
    return ((value - entryEnd) / (exitStart - entryEnd)) * lastStage;
  }

  const normalized = THREE.MathUtils.clamp(
    (value - exitStart) / (1 - exitStart),
    0,
    1,
  );

  return hermite(
    normalized,
    lastStage,
    lastStage + 2,
    travelSlope * (1 - exitStart),
    0,
  );
}

function landmarkOrbitAngle(value: number, config: LandmarkAssetConfig) {
  if (value <= config.focusAt) {
    const approach = smoothstep(
      config.enterAt,
      config.focusAt,
      value,
    );

    return THREE.MathUtils.lerp(-Math.PI, 0, approach) * config.direction;
  }

  const departure = smoothstep(
    config.focusAt,
    config.exitAt,
    value,
  );

  return THREE.MathUtils.lerp(0, Math.PI, departure) * config.direction;
}

function createMaterials(config: DanceConfig): MaterialSet {
  return {
    accent: new THREE.MeshPhysicalMaterial({
      color: config.accent,
      metalness: 0.12,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      transparent: true,
      opacity: 0.82,
    }),
    secondary: new THREE.MeshPhysicalMaterial({
      color: config.secondary,
      metalness: 0.28,
      roughness: 0.28,
      clearcoat: 0.82,
      transparent: true,
      opacity: 0.92,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: config.metal,
      metalness: 0.94,
      roughness: 0.2,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: config.secondary,
      metalness: 0.02,
      roughness: 0.08,
      transmission: 0.76,
      thickness: 0.7,
      transparent: true,
      opacity: 0.48,
      clearcoat: 1,
    }),
    dark: new THREE.MeshPhysicalMaterial({
      color: "#101116",
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1,
    }),
    pearl: new THREE.MeshStandardMaterial({
      color: "#c8c3c2",
      metalness: 0.45,
      roughness: 0.22,
      emissive: new THREE.Color(config.accent).multiplyScalar(0.08),
    }),
  };
}

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  scale: [number, number, number] = [1, 1, 1],
) {
  const object = new THREE.Mesh(geometry, material);
  object.scale.set(...scale);
  return object;
}

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.22);
  shape.bezierCurveTo(0.18, -0.08, 0.21, 0.14, 0, 0.32);
  shape.bezierCurveTo(-0.21, 0.14, -0.18, -0.08, 0, -0.22);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.014,
    bevelThickness: 0.012,
  });
  geometry.center();
  return geometry;
}

function createRibbon(
  material: THREE.Material,
  seed: number,
  vertical = false,
) {
  const direction = seed % 2 === 0 ? 1 : -1;
  const points = Array.from({ length: 6 }, (_, index) => {
    const t = index / 5;
    const wave = Math.sin(t * Math.PI * 2 + seed) * 0.3;

    return vertical
      ? new THREE.Vector3(wave, (t - 0.5) * 2.3, Math.cos(t * Math.PI) * 0.36)
      : new THREE.Vector3(
          (t - 0.5) * 2.4 * direction,
          wave,
          Math.cos(t * Math.PI + seed) * 0.38,
        );
  });
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 48, 0.035, 6, false);

  return mesh(geometry, material);
}

function createTorii(materials: MaterialSet) {
  const group = new THREE.Group();
  const post = new THREE.CylinderGeometry(0.045, 0.07, 1.15, 10);
  const left = mesh(post, materials.secondary);
  const right = mesh(post, materials.secondary);
  const lower = mesh(
    new THREE.BoxGeometry(1.38, 0.07, 0.1),
    materials.secondary,
  );

  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.94, 0.02);
  roofShape.quadraticCurveTo(-0.46, 0.13, 0, 0.08);
  roofShape.quadraticCurveTo(0.46, 0.13, 0.94, 0.02);
  roofShape.lineTo(0.88, -0.11);
  roofShape.quadraticCurveTo(0.44, -0.02, 0, -0.05);
  roofShape.quadraticCurveTo(-0.44, -0.02, -0.88, -0.11);
  roofShape.closePath();
  const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
    depth: 0.11,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  roofGeometry.translate(0, 0, -0.055);
  const top = mesh(roofGeometry, materials.secondary);

  const lintel = mesh(
    new THREE.BoxGeometry(1.62, 0.055, 0.13),
    materials.secondary,
  );

  left.position.set(-0.55, -0.05, 0);
  right.position.set(0.55, -0.05, 0);
  top.position.y = 0.59;
  lintel.position.y = 0.48;
  lower.position.y = 0.31;
  group.add(left, right, top, lintel, lower);

  return group;
}

function createLantern(materials: MaterialSet) {
  const group = new THREE.Group();
  const profile = [
    new THREE.Vector2(0.14, -0.46),
    new THREE.Vector2(0.28, -0.39),
    new THREE.Vector2(0.36, -0.22),
    new THREE.Vector2(0.39, 0),
    new THREE.Vector2(0.36, 0.22),
    new THREE.Vector2(0.28, 0.39),
    new THREE.Vector2(0.14, 0.46),
  ];
  const body = mesh(
    new THREE.LatheGeometry(profile, 32),
    new THREE.MeshPhysicalMaterial({
      color: "#b87c68",
      roughness: 0.62,
      transparent: true,
      opacity: 0.9,
      transmission: 0.04,
      emissive: "#8e4f3e",
      emissiveIntensity: 0.48,
    }),
  );
  group.add(body);

  for (let index = -4; index <= 4; index += 1) {
    const normalized = index / 4;
    const radius = 0.39 - Math.abs(normalized) * 0.17;
    const ring = mesh(
      new THREE.TorusGeometry(
        radius,
        0.006,
        5,
        30,
      ),
      materials.metal,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = index * 0.1;
    group.add(ring);
  }

  const capGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.07, 18);
  const topCap = mesh(capGeometry, materials.dark);
  const bottomCap = mesh(capGeometry, materials.dark);
  topCap.position.y = 0.49;
  bottomCap.position.y = -0.49;
  group.add(topCap, bottomCap);

  const tassel = mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.48, 7),
    materials.metal,
  );
  tassel.position.y = -0.76;
  group.add(tassel);

  return group;
}

function createCairoLantern(materials: MaterialSet) {
  const group = new THREE.Group();
  const glass = materials.dark.clone();
  glass.transparent = true;
  glass.opacity = 0.72;
  glass.roughness = 0.08;
  glass.clearcoat = 1;
  const brass = materials.metal.clone();
  brass.color.set("#9f7b43");
  brass.metalness = 0.72;
  brass.roughness = 0.22;
  const body = mesh(
    new THREE.SphereGeometry(0.35, 24, 18),
    glass,
    [0.82, 1.28, 0.82],
  );
  const core = mesh(
    new THREE.SphereGeometry(0.12, 14, 10),
    new THREE.MeshStandardMaterial({
      color: "#ffdfaa",
      emissive: "#bc7137",
      emissiveIntensity: 1.35,
    }),
  );

  group.add(body, core);

  for (let index = 0; index < 6; index += 1) {
    const rib = mesh(
      new THREE.TorusGeometry(0.35, 0.012, 5, 36),
      brass,
    );
    rib.rotation.set(
      Math.PI / 2,
      0,
      (index / 6) * Math.PI,
    );
    rib.scale.y = 1.28;
    group.add(rib);
  }

  [-0.52, 0.52].forEach((y) => {
    const cap = mesh(
      new THREE.ConeGeometry(0.16, 0.18, 10),
      brass,
    );
    cap.position.y = y;
    cap.rotation.z = y < 0 ? Math.PI : 0;
    group.add(cap);
  });

  return group;
}

function createMinaret(materials: MaterialSet) {
  const group = new THREE.Group();
  const stone = materials.pearl.clone();
  stone.color.set("#7f6a4a");
  stone.roughness = 0.72;
  const metal = materials.metal.clone();
  metal.color.set("#a87944");
  const shaft = mesh(
    new THREE.CylinderGeometry(0.055, 0.13, 1.15, 12),
    stone,
  );
  const balcony = mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.08, 16),
    metal,
  );
  const upper = mesh(
    new THREE.CylinderGeometry(0.04, 0.075, 0.46, 12),
    stone,
  );
  const crown = mesh(
    new THREE.ConeGeometry(0.11, 0.28, 12),
    metal,
  );
  const finial = mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.25, 6),
    metal,
  );

  shaft.position.y = -0.18;
  balcony.position.y = 0.41;
  upper.position.y = 0.67;
  crown.position.y = 1.03;
  finial.position.y = 1.28;
  group.add(shaft, balcony, upper, crown, finial);

  return group;
}

function createLibertyTorch(materials: MaterialSet) {
  const group = new THREE.Group();
  const copper = materials.secondary.clone();
  copper.color.set("#5f8f8a");
  copper.metalness = 0.34;
  copper.roughness = 0.5;
  const handle = mesh(
    new THREE.CylinderGeometry(0.07, 0.12, 0.82, 12),
    copper,
  );
  const crown = mesh(
    new THREE.TorusGeometry(0.19, 0.025, 7, 36),
    copper,
  );
  const flame = mesh(
    new THREE.IcosahedronGeometry(0.2, 1),
    new THREE.MeshStandardMaterial({
      color: "#ffd28b",
      emissive: "#e27948",
      emissiveIntensity: 2.4,
      roughness: 0.3,
    }),
    [0.68, 1.38, 0.68],
  );

  handle.position.y = -0.28;
  crown.position.y = 0.18;
  crown.rotation.x = Math.PI / 2;
  flame.position.y = 0.48;
  flame.rotation.z = -0.22;
  group.add(handle, crown, flame);

  return group;
}

function createArtDecoFan(materials: MaterialSet) {
  const group = new THREE.Group();
  const silver = materials.metal.clone();
  silver.color.set("#778291");
  silver.metalness = 0.72;
  silver.roughness = 0.25;
  const coral = materials.accent.clone();
  coral.color.set("#a85d69");
  coral.metalness = 0.36;
  coral.roughness = 0.34;
  const hub = mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20),
    coral,
  );

  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  for (let index = 0; index < 9; index += 1) {
    const angle = -1.05 + (index / 8) * 2.1;
    const length = 0.72 + Math.sin((index / 8) * Math.PI) * 0.34;
    const ray = mesh(
      new THREE.BoxGeometry(0.035, length, 0.035),
      index % 2 === 0 ? coral : silver,
    );

    ray.position.set(
      Math.sin(angle) * length * 0.42,
      Math.cos(angle) * length * 0.42,
      0,
    );
    ray.rotation.z = -angle;
    group.add(ray);
  }

  return group;
}

function createAuroraMotif(materials: MaterialSet, seed: number) {
  const group = new THREE.Group();

  for (let index = 0; index < 3; index += 1) {
    const ribbon = createRibbon(
      index % 2 === 0 ? materials.glass : materials.secondary,
      seed + index * 3,
    );
    ribbon.position.y = (index - 1) * 0.2;
    ribbon.rotation.z = index % 2 ? 0.2 : -0.15;
    ribbon.scale.set(1.18 + index * 0.1, 0.48, 0.8);
    group.add(ribbon);
  }

  return group;
}

function createClock(materials: MaterialSet) {
  const group = new THREE.Group();
  const ring = mesh(
    new THREE.TorusGeometry(0.52, 0.035, 8, 56),
    materials.metal,
  );
  const handA = mesh(
    new THREE.BoxGeometry(0.035, 0.43, 0.025),
    materials.accent,
  );
  const handB = mesh(
    new THREE.BoxGeometry(0.035, 0.3, 0.025),
    materials.accent,
  );

  handA.position.y = 0.18;
  handA.rotation.z = 0.22;
  handB.position.x = 0.13;
  handB.rotation.z = Math.PI / 2;
  group.add(ring, handA, handB);

  return group;
}

function addOrbit(
  group: THREE.Group,
  _materials: MaterialSet,
  radius: number,
  rotation: [number, number, number],
  opacity = 0.42,
) {
  const material = new THREE.MeshBasicMaterial({
    color: "#c49a86",
    transparent: true,
    opacity: opacity * 0.58,
    depthWrite: false,
  });

  const orbit = mesh(
    new THREE.TorusGeometry(radius, 0.006, 5, 192),
    material,
  );
  orbit.rotation.set(...rotation);
  orbit.name = "world-orbit";
  orbit.userData.orbitSpeed = 0.012 + radius * 0.0025;
  group.add(orbit);

  return orbit;
}

function createNeedleField(
  materials: MaterialSet,
  count: number,
  spread: number,
  side: -1 | 1,
) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const height = 0.72 + ((index * 7) % 9) * 0.19;
    const needle = mesh(
      new THREE.CylinderGeometry(
        0.018 + (index % 3) * 0.007,
        0.08 + (index % 2) * 0.025,
        height,
        8,
      ),
      index % 5 === 0 ? materials.accent : materials.metal,
    );

    needle.position.set(
      side * (2.4 + (index % 4) * spread),
      -1.48 + (index % 5) * 0.42,
      -1.1 + (index % 3) * 0.38,
    );
    needle.rotation.z = side * (0.04 + (index % 3) * 0.035);
    group.add(needle);
  }

  return group;
}

function createMinaretField(
  materials: MaterialSet,
  count: number,
  side: -1 | 1,
) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const minaret = createMinaret(materials);
    const scale = 0.5 + (index % 4) * 0.13;

    minaret.position.set(
      side * (3.55 + (index % 4) * 0.34),
      -1.58 + (index % 3) * 0.48,
      -1.2 + (index % 5) * 0.36,
    );
    minaret.rotation.set(
      side * 0.03,
      side * (0.12 + (index % 3) * 0.06),
      side * (0.025 + (index % 2) * 0.02),
    );
    minaret.scale.setScalar(scale);
    group.add(minaret);
  }

  return group;
}

function createLargePetalSwarm(materials: MaterialSet) {
  const group = new THREE.Group();
  const geometry = createPetalGeometry();
  const petalMaterial = materials.accent.clone();
  petalMaterial.roughness = 0.42;
  petalMaterial.opacity = 0.76;
  petalMaterial.transmission = 0.08;
  const pearlPetalMaterial = materials.pearl.clone();
  pearlPetalMaterial.transparent = true;
  pearlPetalMaterial.opacity = 0.7;

  for (let index = 0; index < 72; index += 1) {
    const turn = index * 2.399963 + (index % 5) * 0.13;
    const radius = 1.8 + ((index * 17) % 23) * 0.13;
    const depth = -1.5 + ((index * 29) % 37) * 0.1;
    const petal = mesh(
      geometry,
      index % 8 === 0 ? pearlPetalMaterial : petalMaterial,
    );
    const scale =
      depth > 1.2
        ? 0.44 + (index % 3) * 0.12
        : 0.18 + (index % 4) * 0.055;

    petal.position.set(
      Math.cos(turn) * radius * 1.18,
      Math.sin(turn) * radius * 0.62,
      depth,
    );
    petal.rotation.set(turn * 0.37, turn * 0.61, turn);
    petal.scale.set(scale * 0.72, scale, scale * 0.55);
    petal.userData.phase = index * 0.43;
    petal.userData.radius = radius;
    group.add(petal);
  }

  return group;
}

function createTokyoFrame(materials: MaterialSet) {
  const group = new THREE.Group();
  const primaryTorii = createTorii(materials);
  primaryTorii.position.set(2.62, 1.92, -0.34);
  primaryTorii.rotation.set(-0.08, -0.34, -0.22);
  primaryTorii.scale.setScalar(1.34);
  group.add(primaryTorii);

  const lowerTorii = createTorii(materials);
  lowerTorii.position.set(-2.78, -1.04, -0.08);
  lowerTorii.rotation.set(0.12, 0.48, 0.34);
  lowerTorii.scale.setScalar(1.08);
  group.add(lowerTorii);

  const crown = mesh(
    new THREE.TorusGeometry(3.2, 0.055, 12, 112, Math.PI * 0.74),
    materials.secondary,
  );
  crown.position.set(0.94, -2.94, -0.62);
  crown.rotation.set(1.14, -0.16, 0.12);
  crown.scale.y = 0.86;
  group.add(crown);

  const lantern = createLantern(materials);
  lantern.position.set(2.68, 1.62, 0.92);
  lantern.rotation.set(-0.18, 0.36, 0.11);
  lantern.scale.setScalar(0.92);
  group.add(lantern);

  group.add(createNeedleField(materials, 12, 0.26, -1));
  group.add(createNeedleField(materials, 10, 0.24, 1));

  const petals = createLargePetalSwarm(materials);
  petals.name = "ambient-swarm";
  group.add(petals);

  addOrbit(group, materials, 2.62, [1.08, 0.18, 0.28], 0.5);
  addOrbit(group, materials, 3.28, [1.28, -0.34, -0.18], 0.28);

  return group;
}

function createCairoFrame(materials: MaterialSet) {
  const group = new THREE.Group();

  group.add(createMinaretField(materials, 3, -1));

  addOrbit(group, materials, 2.8, [1.18, -0.42, 0.16], 0.45);
  addOrbit(group, materials, 3.48, [1.36, 0.36, -0.22], 0.24);

  return group;
}

function createParisFrame(materials: MaterialSet) {
  const group = new THREE.Group();

  const pyramid = mesh(
    new THREE.ConeGeometry(1.02, 1.38, 4),
    materials.glass,
  );
  pyramid.position.set(2.72, -1.68, 0.26);
  pyramid.rotation.y = Math.PI * 0.25;
  pyramid.scale.setScalar(0.68);
  group.add(pyramid);

  for (let index = 0; index < 24; index += 1) {
    const leaf = mesh(
      createPetalGeometry(),
      index % 4 === 0 ? materials.pearl : materials.accent,
      [0.18, 0.28, 0.16],
    );
    const angle = index * 1.73;
    leaf.position.set(
      Math.cos(angle) * (2.3 + (index % 5) * 0.42),
      Math.sin(angle) * (1.2 + (index % 4) * 0.17),
      -0.8 + (index % 7) * 0.33,
    );
    leaf.rotation.set(angle, angle * 0.4, angle * 0.72);
    group.add(leaf);
  }

  addOrbit(group, materials, 2.76, [1.22, 0.2, 0.44], 0.42);
  addOrbit(group, materials, 3.5, [1.44, -0.26, -0.22], 0.22);

  return group;
}

function createNewYorkFrame(materials: MaterialSet) {
  const group = new THREE.Group();

  const clock = createClock(materials);
  clock.position.set(3.36, 2.02, 0.86);
  clock.scale.setScalar(1.02);
  clock.rotation.set(-0.12, 0.24, -0.14);
  group.add(clock);

  for (let index = 0; index < 34; index += 1) {
    const snow = mesh(
      new THREE.OctahedronGeometry(0.035 + (index % 4) * 0.02, 0),
      materials.pearl,
    );
    const angle = index * 2.399;
    snow.position.set(
      Math.cos(angle) * (2.1 + (index % 7) * 0.36),
      Math.sin(angle) * (1.2 + (index % 4) * 0.24),
      -1.3 + (index % 9) * 0.34,
    );
    snow.userData.phase = index * 0.31;
    group.add(snow);
  }

  addOrbit(group, materials, 2.88, [1.08, 0.36, 0.24], 0.36);
  addOrbit(group, materials, 3.62, [1.38, -0.18, -0.3], 0.2);

  return group;
}

function createSnowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  if (context) {
    const glow = context.createRadialGradient(32, 32, 1, 32, 32, 27);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.18, "rgba(240,249,255,.96)");
    glow.addColorStop(0.48, "rgba(202,232,255,.38)");
    glow.addColorStop(1, "rgba(202,232,255,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 64, 64);
    context.translate(32, 32);
    context.strokeStyle = "rgba(255,255,255,.78)";
    context.lineWidth = 1.5;

    for (let arm = 0; arm < 6; arm += 1) {
      context.rotate(Math.PI / 3);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, 21);
      context.moveTo(0, 13);
      context.lineTo(-5, 8);
      context.moveTo(0, 13);
      context.lineTo(5, 8);
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createSnowVolume(count = 280) {
  const positions = new Float32Array(count * 3);
  const random = (index: number, offset: number) => {
    const value = Math.sin((index + 1) * (12.9898 + offset * 7.13)) * 43758.5453;
    return value - Math.floor(value);
  };

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (random(index, 1) - 0.5) * 11.5;
    positions[index * 3 + 1] = (random(index, 2) - 0.5) * 8.2;
    positions[index * 3 + 2] = -1.8 + random(index, 3) * 4.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions.slice(), 3),
  );
  const material = new THREE.PointsMaterial({
    color: "#e9f7ff",
    size: 0.105,
    map: createSnowTexture(),
    transparent: true,
    opacity: 0.82,
    alphaTest: 0.035,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const snow = new THREE.Points(geometry, material);
  snow.name = "winter-snow";
  snow.userData.basePositions = positions;

  return snow;
}

function createUshuaiaFrame(materials: MaterialSet) {
  const group = new THREE.Group();

  for (let index = 0; index < 16; index += 1) {
    const prism = mesh(
      new THREE.OctahedronGeometry(0.34 + (index % 4) * 0.12, 0),
      index % 4 === 0 ? materials.pearl : materials.glass,
      [0.74, 1.5 + (index % 3) * 0.45, 0.72],
    );
    const side = index % 2 === 0 ? -1 : 1;
    prism.position.set(
      side * (2.3 + (index % 5) * 0.42),
      -1.7 + (index % 7) * 0.52,
      -1.5 + (index % 6) * 0.46,
    );
    prism.rotation.set(index * 0.13, index * 0.31, side * index * 0.04);
    prism.scale.multiplyScalar(0.72);
    group.add(prism);
  }

  for (let index = 0; index < 4; index += 1) {
    const aurora = createRibbon(
      index % 2 ? materials.glass : materials.secondary,
      11 + index,
    );
    aurora.position.set(0, 1.6 + index * 0.28, -1.3 + index * 0.22);
    aurora.rotation.z = index % 2 ? 0.14 : -0.18;
    aurora.scale.set(2.4 + index * 0.18, 0.65, 1);
    group.add(aurora);
  }

  group.add(createSnowVolume());

  addOrbit(group, materials, 2.72, [1.28, 0.24, 0.3], 0.38);
  addOrbit(group, materials, 3.46, [1.52, -0.3, -0.18], 0.22);

  return group;
}

function createCityFrame(
  activeChapter: number,
  materials: MaterialSet,
) {
  switch (activeChapter) {
    case 0:
      return createTokyoFrame(materials);
    case 1:
      return createCairoFrame(materials);
    case 2:
      return createParisFrame(materials);
    case 3:
      return createNewYorkFrame(materials);
    default:
      return createUshuaiaFrame(materials);
  }
}

function createMotif(
  motif: Motif,
  materials: MaterialSet,
  seed: number,
): THREE.Object3D {
  const group = new THREE.Group();

  if (motif === "torii") return createTorii(materials);
  if (motif === "lantern") return createLantern(materials);
  if (motif === "cairo-lantern") return createCairoLantern(materials);
  if (motif === "minaret") return createMinaret(materials);
  if (motif === "aurora") return createAuroraMotif(materials, seed);
  if (motif === "art-deco") return createArtDecoFan(materials);
  if (motif === "liberty") return createLibertyTorch(materials);
  if (motif === "clock") return createClock(materials);

  if (motif === "ribbons" || motif === "lattice") {
    group.add(createRibbon(motif === "lattice" ? materials.metal : materials.glass, seed));
    group.add(
      createRibbon(
        motif === "lattice" ? materials.accent : materials.secondary,
        seed + 3,
      ),
    );
    group.children[1].rotation.z = 0.55;
    return group;
  }

  const count =
    motif === "petals" || motif === "leaves" || motif === "snow"
      ? motif === "petals"
        ? 20
        : 14
      : motif === "bubbles"
        ? 10
      : motif === "needles" || motif === "lights"
        ? 9
        : 6;

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * TAU + seed * 0.27;
    const radius =
      motif === "petals"
        ? 0.58 + (index % 5) * 0.25
        : 0.35 + (index % 4) * 0.18;
    let item: THREE.Object3D;

    switch (motif) {
      case "petals":
      case "leaves":
        item = mesh(
          createPetalGeometry(),
          motif === "petals" ? materials.accent : materials.secondary,
          [0.82, 0.82, 0.82],
        );
        break;
      case "bubbles":
        item = mesh(
          new THREE.SphereGeometry(0.15 + (index % 3) * 0.045, 24, 18),
          index % 3 === 0 ? materials.glass : materials.dark,
          [1, 1.12 + (index % 2) * 0.18, 1],
        );
        break;
      case "facets":
        item = mesh(
          new THREE.TetrahedronGeometry(0.3 + (index % 3) * 0.045, 0),
          index % 3 === 0 ? materials.glass : materials.metal,
          [0.8, 1.28, 0.82],
        );
        break;
      case "stone":
        item = mesh(
          new THREE.IcosahedronGeometry(0.26, 1),
          materials.dark,
          [1.2, 0.75, 0.9],
        );
        break;
      case "cathedral":
        item = mesh(
          new THREE.ConeGeometry(0.09 + (index % 3) * 0.025, 0.8, 8),
          index % 2 ? materials.metal : materials.glass,
        );
        break;
      case "needles":
        item = mesh(
          new THREE.CylinderGeometry(0.018, 0.055, 0.8 + (index % 4) * 0.25, 6),
          index % 3 ? materials.metal : materials.accent,
        );
        break;
      case "snow":
      case "prisms":
        item = mesh(
          new THREE.OctahedronGeometry(motif === "snow" ? 0.09 : 0.24, 0),
          motif === "snow" ? materials.pearl : materials.glass,
          motif === "prisms" ? [0.7, 1.5, 0.7] : [1, 1, 1],
        );
        break;
      case "lights":
        item = mesh(
          new THREE.SphereGeometry(0.055 + (index % 3) * 0.02, 10, 8),
          new THREE.MeshStandardMaterial({
            color: "#ffe7ba",
            emissive: index % 2 ? "#ef8d7f" : "#ffd99d",
            emissiveIntensity: 2.2,
          }),
        );
        break;
      case "pebbles": {
        const pebble = new THREE.Group();
        const body = mesh(
          new THREE.CapsuleGeometry(0.18, 0.28, 5, 10),
          materials.dark,
          [0.84, 1.14, 0.84],
        );
        const inset = mesh(
          new THREE.SphereGeometry(0.11, 10, 8),
          materials.pearl,
          [0.86, 1.22, 0.42],
        );
        inset.position.set(0, -0.04, 0.14);
        pebble.add(body, inset);
        item = pebble;
        break;
      }
      default:
        item = mesh(new THREE.IcosahedronGeometry(0.2, 0), materials.accent);
    }

    item.position.set(
      Math.cos(angle) * radius * 1.35,
      Math.sin(angle) * radius,
      ((index % 5) - 2) * 0.12,
    );
    item.rotation.set(angle * 0.7, angle * 0.38, angle);
    group.add(item);
  }

  return group;
}

function danceAmplitude(mode: DanceMode) {
  switch (mode) {
    case "spiral":
      return { x: 4.25, y: 1.65, z: 1.55, turn: 0.92 };
    case "radiate":
      return { x: 4.55, y: 1.25, z: 1.4, turn: 0.78 };
    case "loop":
      return { x: 4.05, y: 1.48, z: 1.8, turn: 0.72 };
    case "rise":
      return { x: 3.95, y: 1.9, z: 1.45, turn: 0.66 };
    case "drift":
      return { x: 4.45, y: 1.38, z: 1.75, turn: 0.58 };
  }
}

function disposeScene(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
      geometries.add(object.geometry);
    }

    if (
      !(object instanceof THREE.Mesh) &&
      !(object instanceof THREE.Points) &&
      !(object instanceof THREE.Sprite)
    ) {
      return;
    }

    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    meshMaterials.forEach((material) => {
      materials.add(material);
      const mappedMaterial = material as THREE.Material & {
        map?: THREE.Texture | null;
      };

      if (mappedMaterial.map) textures.add(mappedMaterial.map);
    });
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

export function KineticChoreography({
  activeChapter,
  progress,
  reducedMotion,
}: KineticChoreographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const activeChapterRef = useRef(activeChapter);
  const reducedMotionRef = useRef(reducedMotion);
  const [ready, setReady] = useState(false);
  const config = dances[activeChapter];
  const chapter = chapters[activeChapter];

  activeChapterRef.current = activeChapter;
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const foregroundCanvas = foregroundCanvasRef.current;

    if (!canvas || !foregroundCanvas) return;

    canvas.dataset.renderer = "loading";
    foregroundCanvas.dataset.renderer = "loading";

    let renderer: THREE.WebGLRenderer;
    let foregroundRenderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      foregroundRenderer = new THREE.WebGLRenderer({
        canvas: foregroundCanvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.dataset.renderer = "fallback";
      foregroundCanvas.dataset.renderer = "fallback";
      return;
    }

    renderer.setClearColor(0x000000, 0);
    foregroundRenderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    foregroundRenderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.25),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    foregroundRenderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    foregroundRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    foregroundRenderer.toneMappingExposure = 0.92;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 50);
    camera.position.set(0, 0, 8.2);
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const environment = environmentGenerator.fromScene(
      new RoomEnvironment(),
      0.03,
    ).texture;
    const foregroundEnvironmentGenerator = new THREE.PMREMGenerator(
      foregroundRenderer,
    );
    const foregroundEnvironment = foregroundEnvironmentGenerator.fromScene(
      new RoomEnvironment(),
      0.03,
    ).texture;
    scene.environment = environment;

    const ambient = new THREE.HemisphereLight(0xc4d1e4, 0x120c15, 0.82);
    const key = new THREE.DirectionalLight(0xffc9b5, 2.75);
    const rim = new THREE.PointLight(
      dances[activeChapterRef.current].secondary,
      4.4,
      15,
      1.6,
    );
    key.position.set(-4, 5, 6);
    rim.position.set(4.4, -2, 3.5);
    ambient.layers.enable(1);
    key.layers.enable(1);
    rim.layers.enable(1);
    scene.add(ambient, key, rim);

    const runtimeCities: Array<RuntimeCity | undefined> = new Array(
      dances.length,
    );
    const buildRuntimeCity = (runtimeIndex: number) => {
        const existing = runtimeCities[runtimeIndex];

        if (existing) return existing;

        const runtimeConfig = dances[runtimeIndex];
        const root = new THREE.Group();
        const materialSet = createMaterials(runtimeConfig);
        const cityFrame = createCityFrame(runtimeIndex, materialSet);
        const stageGroups: THREE.Group[] = [];
        const animatedObjects: AnimatedObject[] = [];
        const ambientElements: THREE.Object3D[] = [];
        const orbitalLines: OrbitalLine[] = [];

        root.add(cityFrame);
        scene.add(root);

        cityFrame.traverse((object) => {
          if (object.userData.phase !== undefined) {
            object.userData.origin = object.position.clone();
            object.userData.originRotation = object.rotation.clone();
            ambientElements.push(object);
          }

          if (object.name === "world-orbit") {
            orbitalLines.push({
              object,
              rotation: object.rotation.clone(),
              speed: Number(object.userData.orbitSpeed ?? 0.015),
            });
          }
        });

        runtimeConfig.motifs.forEach((motif, stageIndex) => {
          const stage = new THREE.Group();
          const seed = stageIndex + runtimeIndex * 7;
          const primary = createMotif(motif, materialSet, seed);
          const motifScale =
            motif === "cairo-lantern" || motif === "lantern"
              ? 0.82
              : motif === "minaret" || motif === "liberty"
                ? 0.76
                : motif === "art-deco"
                  ? 0.82
                  : 1;

          primary.scale.setScalar(
            (stageIndex % 2 ? 0.9 : 1.04) * motifScale,
          );
          stage.add(primary);
          root.add(stage);
          stageGroups.push(stage);

          [primary].forEach((object) => {
            const itemIndex = animatedObjects.length;
            const structural =
              motif === "torii" ||
              motif === "needles" ||
              motif === "minaret" ||
              motif === "art-deco" ||
              motif === "cathedral" ||
              motif === "liberty";
            const spinScale = structural ? 0.12 : 1;

            animatedObjects.push({
              object,
              origin: object.position.clone(),
              rotation: object.rotation.clone(),
              spin: new THREE.Vector3(
                (0.07 + (itemIndex % 5) * 0.015) * spinScale,
                (0.09 + (itemIndex % 7) * 0.012) * spinScale,
                (itemIndex % 2 ? 1 : -1) *
                  (0.045 + (itemIndex % 3) * 0.012) *
                  spinScale,
              ),
              drift: (itemIndex % 11) * 0.43,
            });
          });
        });

        const pointCount = 132;
        const positions = new Float32Array(pointCount * 3);

        for (let index = 0; index < pointCount; index += 1) {
          const angle = index * 2.399963 + runtimeIndex * 0.34;
          const radius = 2.8 + ((index * 47) % 100) * 0.032;
          positions[index * 3] = Math.cos(angle) * radius;
          positions[index * 3 + 1] = Math.sin(angle) * radius * 0.58;
          positions[index * 3 + 2] =
            -1.7 + ((index * 29 + runtimeIndex * 7) % 100) * 0.026;
        }

        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        const points = new THREE.Points(
          pointGeometry,
          new THREE.PointsMaterial({
            color: runtimeConfig.accent,
            size: 0.025,
            transparent: true,
            opacity: 0.38,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        root.add(points);

        const initialProgress =
          runtimeIndex < activeChapterRef.current
            ? 1
            : runtimeIndex === activeChapterRef.current
              ? progress.get()
              : 0;

        const runtime: RuntimeCity = {
          index: runtimeIndex,
          config: runtimeConfig,
          root,
          cityFrame,
          stageGroups,
          animatedObjects,
          ambientElements,
          orbitalLines,
          points,
          winterSnow: cityFrame.getObjectByName("winter-snow") as
            | THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
            | undefined,
          amplitude: danceAmplitude(runtimeConfig.mode),
          progress: initialProgress,
        };

        runtime.root.visible = runtimeIndex === activeChapterRef.current;
        runtimeCities[runtimeIndex] = runtime;
        return runtime;
    };

    buildRuntimeCity(activeChapterRef.current);

    const rimColors = dances.map((dance) => new THREE.Color(dance.secondary));
    let frameId = 0;
    let disposed = false;
    let frame = 0;
    let lastTimestamp = 0;
    let averageFrameMs = 1000 / 60;
    let warmupTimer = 0;
    let warmupIdleHandle = 0;
    const warmupQueue = dances
      .map((_, index) => index)
      .filter((index) => index !== activeChapterRef.current)
      .sort(
        (left, right) =>
          Math.abs(left - activeChapterRef.current) -
          Math.abs(right - activeChapterRef.current),
      );
    const warmNextCity = () => {
      const nextIndex = warmupQueue.shift();

      if (nextIndex === undefined || disposed) return;
      const buildNext = () => {
        if (disposed) return;
        buildRuntimeCity(nextIndex);
        warmupTimer = window.setTimeout(warmNextCity, 420);
      };

      const idleWindow = window as unknown as {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

      if (idleWindow.requestIdleCallback) {
        warmupIdleHandle = idleWindow.requestIdleCallback(buildNext, {
          timeout: 900,
        });
      } else {
        warmupTimer = window.setTimeout(buildNext, 560);
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);

      renderer.setSize(width, height, false);
      foregroundRenderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z =
        width < 560 ? 10.2 : width / height > 1.75 ? 8 : 8.6;
      camera.fov = width < 560 ? 50 : 43;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
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
      const isReducedMotion = reducedMotionRef.current;
      const time = isReducedMotion ? 0 : timestamp * 0.001;
      const targetChapter = activeChapterRef.current;
      const targetProgress = progress.get();
      let hasNativeForeground = false;
      if (!runtimeCities[targetChapter]) buildRuntimeCity(targetChapter);
      const lightEasing = isReducedMotion
        ? 1
        : 1 - Math.exp(-2.8 * deltaSeconds);
      rim.color.lerp(rimColors[targetChapter], lightEasing);

      runtimeCities.forEach((runtime) => {
        if (!runtime) return;

        const localTarget =
          runtime.index < targetChapter
            ? 1
            : runtime.index > targetChapter
              ? 0
              : targetProgress;
        runtime.progress = isReducedMotion
          ? localTarget
          : THREE.MathUtils.damp(
              runtime.progress,
              localTarget,
              5.4,
              deltaSeconds,
            );

        const value = runtime.progress;
        const journeyPhase = choreographyPhase(
          value,
          runtime.stageGroups.length,
        );
        runtime.root.visible = runtime.index === targetChapter;
        if (!runtime.root.visible) return;

        runtime.root.position.set(0, 0, 0);
        runtime.root.scale.setScalar(1);
        runtime.root.rotation.y =
          (isReducedMotion ? 0 : Math.sin(time * 0.32 + runtime.index) * 0.018);
        runtime.root.rotation.z =
          (isReducedMotion ? 0 : Math.cos(time * 0.27 + runtime.index) * 0.009);

        runtime.points.rotation.z =
          time * (runtime.config.mode === "drift" ? 0.006 : 0.011);
        runtime.points.rotation.y = -time * 0.008;

        if (runtime.winterSnow) {
          runtime.winterSnow.rotation.y = Math.sin(time * 0.07) * 0.025;
          runtime.winterSnow.rotation.z =
            -0.04 + Math.sin(time * 0.11) * 0.018;

          if (frame % 2 === 0) {
            const attribute = runtime.winterSnow.geometry.getAttribute(
              "position",
            ) as THREE.BufferAttribute;
            const basePositions = runtime.winterSnow.userData
              .basePositions as Float32Array;
            const fall = (isReducedMotion ? 0 : time * 0.42) + value * 2.2;

            for (let index = 0; index < attribute.count; index += 1) {
              const baseX = basePositions[index * 3];
              const baseY = basePositions[index * 3 + 1];
              const baseZ = basePositions[index * 3 + 2];
              const wrappedY =
                ((((baseY + 4.1 - fall) % 8.2) + 8.2) % 8.2) - 4.1;

              attribute.setXYZ(
                index,
                baseX + Math.sin(time * 0.24 + index * 0.71) * 0.08,
                wrappedY,
                baseZ,
              );
            }

            attribute.needsUpdate = true;
          }
        }

        runtime.stageGroups.forEach((stage, stageIndex) => {
          const delta = stageIndex - journeyPhase;
          const angle = delta * runtime.amplitude.turn;
          const proximity = Math.exp(-delta * delta * 0.72);
          const cityMovement =
            runtime.config.mode === "radiate"
              ? Math.sin(time * 0.5 + stageIndex) * 0.18
              : runtime.config.mode === "rise"
                ? Math.sin(time * 0.32 + stageIndex) * 0.28
                : Math.sin(time * 0.25 + stageIndex) * 0.12;
          const focusSide = stageIndex % 2 === 0 ? -1 : 1;

          stage.position.set(
            Math.sin(angle) * runtime.amplitude.x +
              proximity * focusSide * 2.18,
            Math.sin(angle * 0.64 + stageIndex * 0.27) *
              runtime.amplitude.y +
              cityMovement +
              (runtime.config.mode === "rise" ? proximity * 0.45 : 0),
            Math.cos(angle) * runtime.amplitude.z -
              1.48 +
              proximity * 0.18,
          );
          stage.rotation.set(
            Math.sin(angle * 0.45) * 0.22,
            -angle * 0.38 + time * 0.018,
            runtime.config.mode === "spiral"
              ? angle * 0.32 + time * 0.014
              : Math.sin(angle) * 0.16,
          );
          stage.scale.setScalar(0.36 + proximity * 0.48);

          const stageDepth = stage.position.z + runtime.root.position.z;
          const previousLayer = Number(stage.userData.compositeLayer ?? 0);
          const nextLayer =
            runtime.index === 0
              ? 0
              : previousLayer === 1
                ? stageDepth < -1.92
                  ? 0
                  : 1
                : stageDepth > -1.62
                  ? 1
                  : 0;

          if (nextLayer !== previousLayer) {
            stage.traverse((object) => object.layers.set(nextLayer));
            stage.userData.compositeLayer = nextLayer;
          }

          if (nextLayer === 1) hasNativeForeground = true;
        });

        runtime.animatedObjects.forEach((item, index) => {
          const sway =
            Math.sin(time * 0.32 + item.drift + journeyPhase * 0.72) * 0.05;

          item.object.position.set(
            item.origin.x + sway,
            item.origin.y + Math.cos(time * 0.26 + item.drift) * 0.038,
            item.origin.z + Math.sin(time * 0.23 + item.drift) * 0.045,
          );
          item.object.rotation.set(
            item.rotation.x + time * item.spin.x,
            item.rotation.y + time * item.spin.y,
            item.rotation.z + time * item.spin.z + index * 0.001,
          );
        });

        runtime.ambientElements.forEach((object, index) => {
          const phase = Number(object.userData.phase ?? index * 0.4);
          const origin = object.userData.origin as THREE.Vector3;
          const originRotation = object.userData.originRotation as THREE.Euler;

          object.position.x =
            origin.x + Math.sin(time * 0.18 + phase) * 0.1;
          object.position.y =
            origin.y + Math.cos(time * 0.15 + phase) * 0.075;
          object.rotation.x =
            originRotation.x + time * (0.09 + (index % 3) * 0.032);
          object.rotation.z =
            originRotation.z + time * (index % 2 ? 0.082 : -0.082);
        });

        runtime.orbitalLines.forEach((line, index) => {
          const phase = time * line.speed + index * 0.8 + runtime.index;
          line.object.rotation.set(
            line.rotation.x + Math.sin(phase) * 0.012,
            line.rotation.y + phase * 0.18,
            line.rotation.z + Math.cos(phase * 0.84) * 0.014,
          );
        });

        runtime.cityFrame.position.y =
          Math.cos(time * 0.11 + runtime.index) *
          (isReducedMotion ? 0 : 0.026);
      });

      camera.position.x =
        isReducedMotion ? 0 : Math.sin(time * 0.095) * 0.045;
      camera.position.y =
        isReducedMotion ? 0 : Math.cos(time * 0.078) * 0.035;
      camera.lookAt(0, 0, 0);
      camera.layers.set(0);
      scene.environment = environment;
      renderer.render(scene, camera);
      camera.layers.set(1);
      scene.environment = foregroundEnvironment;
      if (hasNativeForeground) {
        foregroundRenderer.render(scene, camera);
      } else {
        foregroundRenderer.clear();
      }
      camera.layers.set(0);
      scene.environment = environment;

      if (frame % 8 === 0) {
        const activeRuntime =
          runtimeCities[targetChapter] ??
          runtimeCities.find(
            (runtime): runtime is RuntimeCity => runtime !== undefined,
          );

        if (!activeRuntime) return;
        const journeyPhase = choreographyPhase(
          activeRuntime.progress,
          activeRuntime.stageGroups.length,
        );
        const activeStage = Math.max(
          0,
          Math.min(
            activeRuntime.stageGroups.length - 1,
            Math.round(journeyPhase),
          ),
        );
        canvas.dataset.activeStage = String(activeStage + 1);
        canvas.dataset.activeMotif = activeRuntime.config.motifs[activeStage];
        canvas.dataset.progress = activeRuntime.progress.toFixed(4);
        canvas.dataset.targetProgress = targetProgress.toFixed(4);
        canvas.dataset.phase = journeyPhase.toFixed(3);
        canvas.dataset.activeCity = String(targetChapter);
        canvas.dataset.assetScope = "active-city-only";
        canvas.dataset.frameMs = averageFrameMs.toFixed(2);
        foregroundCanvas.dataset.activeStages = activeRuntime
          ? activeRuntime.stageGroups
              .map((stage, index) =>
                Number(stage.userData.compositeLayer ?? 0) === 1
                  ? String(index + 1)
                  : "",
              )
              .filter(Boolean)
              .join(",")
          : "";
        foregroundCanvas.dataset.activeCity = String(targetChapter);
      }

      frame += 1;
      frameId = window.requestAnimationFrame(render);
    };

    runtimeCities.forEach((runtime) => {
      if (runtime) {
        runtime.root.visible = runtime.index === activeChapterRef.current;
      }
    });

    let renderedObjectCount = 0;
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) renderedObjectCount += 1;
    });

    canvas.dataset.renderer = "active";
    foregroundCanvas.dataset.renderer = "active";
    canvas.dataset.objectCount = String(renderedObjectCount);
    canvas.dataset.motion = "persistent-time-damped";
    canvas.dataset.occlusion = "physical-dom-and-canvas-layers";
    foregroundCanvas.dataset.motion = "native-depth-layer-switch";
    foregroundCanvas.dataset.occlusion = "physical-canvas-layers";
    setReady(true);
    warmNextCity();
    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(warmupTimer);
      const idleWindow = window as unknown as {
        cancelIdleCallback?: (handle: number) => void;
      };
      idleWindow.cancelIdleCallback?.(warmupIdleHandle);
      observer.disconnect();
      disposeScene(scene);
      environment.dispose();
      foregroundEnvironment.dispose();
      environmentGenerator.dispose();
      foregroundEnvironmentGenerator.dispose();
      renderer.dispose();
      foregroundRenderer.dispose();
    };
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let frameId = 0;
    let frame = 0;
    let lastTimestamp = 0;
    let canvasBounds = canvas.getBoundingClientRect();
    let globeBounds: DOMRect | null = null;
    const localProgress = chapters.map((_, index) =>
      index < activeChapterRef.current
        ? 1
        : index === activeChapterRef.current
          ? progress.get()
          : 0,
    );

    const measure = () => {
      canvasBounds = canvas.getBoundingClientRect();
      globeBounds =
        document
          .querySelector<HTMLElement>('[data-testid="journey-globe"]')
          ?.getBoundingClientRect() ?? null;
    };

    const renderLandmarks = (timestamp: number) => {
      const deltaSeconds =
        lastTimestamp === 0
          ? 1 / 60
          : Math.min(0.05, Math.max(0.001, (timestamp - lastTimestamp) / 1000));
      lastTimestamp = timestamp;

      if (frame % 24 === 0 || !globeBounds) measure();

      const activeIndex = activeChapterRef.current;
      const targetProgress = progress.get();
      const isReducedMotion = reducedMotionRef.current;
      const time = isReducedMotion ? 0 : timestamp * 0.001;
      const states: string[] = [];

      chapters.forEach((_, cityIndex) => {
        const cityTarget =
          cityIndex < activeIndex
            ? 1
            : cityIndex > activeIndex
              ? 0
              : targetProgress;
        localProgress[cityIndex] = isReducedMotion
          ? cityTarget
          : THREE.MathUtils.damp(
              localProgress[cityIndex],
              cityTarget,
              6.2,
              deltaSeconds,
            );

        landmarkAssets[cityIndex].forEach((landmarkConfig, assetIndex) => {
          const key = `${cityIndex}-${landmarkConfig.id}`;
          const element = landmarkRefs.current[key];

          if (!element || !globeBounds) {
            if (element) element.style.opacity = "0";
            return;
          }

          if (cityIndex !== activeIndex) {
            element.style.opacity = "0";
            element.style.zIndex = "2";
            element.dataset.layer = "inactive";
            return;
          }

          const value = localProgress[cityIndex];
          const angle = landmarkOrbitAngle(value, landmarkConfig);
          const depth = Math.cos(angle);
          const depthProgress = (depth + 1) / 2;
          const layer = depth >= 0 ? "front" : "behind";
          const globeRadius = globeBounds.width * 0.408;
          const unit = globeRadius / 2;
          const viewportScale = canvasBounds.width < 560 ? 0.76 : 1;
          const viewportSpread = canvasBounds.width < 560 ? 0.7 : 1;
          const spatialScale = 0.22 + depthProgress * 0.82;
          const width =
            globeBounds.width *
            (landmarkConfig.scale[0] / 4.6) *
            viewportScale;
          const height =
            globeBounds.height *
            (landmarkConfig.scale[1] / 4.6) *
            viewportScale;
          const pathUnit = unit * viewportSpread;
          const frontWeight = depthProgress * depthProgress;
          const sideScale = 0.22 + 0.5 * 0.82;
          const sideHalfWidth = (width * sideScale * 0.5) / pathUnit;
          const sideFocusOffset = Math.abs(landmarkConfig.focusX) * 0.25;
          const clearedOrbitX =
            globeRadius / pathUnit +
            sideHalfWidth +
            sideFocusOffset +
            0.14;
          const orbitX = Math.max(landmarkConfig.orbitX, clearedOrbitX);
          const worldX =
            landmarkConfig.focusX * frontWeight +
            Math.sin(angle) * orbitX;
          const worldY =
            landmarkConfig.focusY * frontWeight +
            Math.sin(angle) * landmarkConfig.orbitY;
          const centerX =
            globeBounds.left + globeBounds.width / 2 - canvasBounds.left;
          const centerY =
            globeBounds.top + globeBounds.height / 2 - canvasBounds.top;
          const x = centerX + worldX * unit * viewportSpread;
          const y =
            centerY - worldY * unit +
            (isReducedMotion
              ? 0
              : Math.sin(time * 0.27 + assetIndex * 1.7) *
                3 *
                depthProgress);
          const enterSpan = Math.min(
            0.055,
            Math.max(0.018, (landmarkConfig.focusAt - landmarkConfig.enterAt) * 0.12),
          );
          const exitSpan = Math.min(
            0.055,
            Math.max(0.018, (landmarkConfig.exitAt - landmarkConfig.focusAt) * 0.12),
          );
          const visibility =
            smoothstep(
              landmarkConfig.enterAt,
              landmarkConfig.enterAt + enterSpan,
              value,
            ) *
            (1 -
              smoothstep(
                landmarkConfig.exitAt - exitSpan,
                landmarkConfig.exitAt,
                value,
              ));
          const rotation =
            Math.sin(angle * 0.72) * 0.055 +
            (isReducedMotion ? 0 : Math.sin(time * 0.12 + assetIndex) * 0.006);

          element.style.width = `${width}px`;
          element.style.height = `${height}px`;
          element.style.opacity = String(
            visibility * (landmarkConfig.maxOpacity ?? 0.9),
          );
          element.style.zIndex = layer === "front" ? "4" : "2";
          element.style.transform =
            `translate3d(${x}px, ${y}px, 0) ` +
            `translate(-50%, -50%) rotate(${rotation}rad) scale(${spatialScale})`;
          element.dataset.layer = layer;
          element.dataset.depth = depthProgress.toFixed(3);

          if (cityIndex === activeIndex) {
            states.push(
              [
                landmarkConfig.id,
                layer,
                visibility.toFixed(3),
                depthProgress.toFixed(3),
              ].join(":"),
            );
          }
        });
      });

      if (frame % 8 === 0) {
        canvas.dataset.landmarkMode = "physical-layer-switch";
        canvas.dataset.landmarkStates = states.join("|");
      }

      frame += 1;
      frameId = window.requestAnimationFrame(renderLandmarks);
    };

    measure();
    frameId = window.requestAnimationFrame(renderLandmarks);

    return () => window.cancelAnimationFrame(frameId);
  }, [progress]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`kinetic-scene__canvas${ready ? " kinetic-scene__canvas--ready" : ""}`}
        aria-hidden="true"
        data-testid="kinetic-choreography"
        data-renderer="loading"
        data-city={chapter.id}
        data-dance={config.mode}
      />
      <canvas
        ref={foregroundCanvasRef}
        className={`kinetic-scene__canvas kinetic-scene__canvas--foreground${ready ? " kinetic-scene__canvas--ready" : ""}`}
        aria-hidden="true"
        data-testid="native-foreground-choreography"
        data-renderer="loading"
      />
      {landmarkAssets.flatMap((assets, cityIndex) =>
        assets.map((landmark) => {
          const key = `${cityIndex}-${landmark.id}`;

          return (
            <img
              key={key}
              ref={(element) => {
                landmarkRefs.current[key] = element;
              }}
              className="landmark-orbit"
              src={landmark.source}
              alt=""
              aria-hidden="true"
              draggable={false}
              decoding="async"
              data-landmark={landmark.id}
              data-city={chapters[cityIndex].id}
            />
          );
        }),
      )}
    </>
  );
}
