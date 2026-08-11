export type JourneyMoment = {
  landmark: string;
  title: string;
  detail: string;
  image: string;
  focus: readonly [number, number];
  travel: readonly [number, number];
};

export type JourneyChapter = {
  id: string;
  city: string;
  region: string;
  season: string;
  time: string;
  copy: string;
  latitude: number;
  longitude: number;
  accent: string;
  atmosphere: string;
  glow: string;
  image: string;
  foreground: string;
  midground: string;
  landmarks: string;
  particle: "blossom" | "sunlight" | "leaf" | "first-snow" | "snow";
  moments: readonly JourneyMoment[];
};

export const chapters: readonly JourneyChapter[] = [
  {
    id: "tokyo",
    city: "Tokyo",
    region: "Japan",
    season: "Spring",
    time: "Sunrise",
    copy:
      "The city exhales in pink light, where tradition rises and tomorrow quietly takes shape.",
    latitude: 35.6762,
    longitude: 139.6503,
    accent: "#f4a6bc",
    atmosphere: "#17101d",
    glow: "#bd698b",
    image: "/images/tokyo.webp",
    foreground: "/images/tokyo-foreground.webp",
    midground: "/images/tokyo-midground.webp",
    landmarks:
      "Mount Fuji, Tokyo Tower, Sensō-ji, cherry-blossom streets, Shibuya Crossing, and Chidorigafuchi",
    particle: "blossom",
    moments: [
      {
        landmark: "Mount Fuji",
        title: "The city wakes in pink",
        detail: "First light catches Mount Fuji and the distant Tokyo Tower.",
        image: "/images/tokyo.webp",
        focus: [0.54, 0.48],
        travel: [1, 0.12],
      },
      {
        landmark: "Sensō-ji",
        title: "Through the thunder gate",
        detail: "The red lanterns and pagoda of Sensō-ji emerge through the mist.",
        image: "/images/tokyo-temple.webp",
        focus: [0.28, 0.69],
        travel: [1, -0.16],
      },
      {
        landmark: "Sakura lanes",
        title: "Beneath a thousand blossoms",
        detail: "Follow a lantern-lit sakura street into the waking city.",
        image: "/images/tokyo-street.webp",
        focus: [0.52, 0.52],
        travel: [1, 0.06],
      },
      {
        landmark: "Shibuya",
        title: "Where the city starts to move",
        detail: "Shibuya Crossing opens beneath the first peach-colored light.",
        image: "/images/tokyo-crossing.webp",
        focus: [0.51, 0.66],
        travel: [-1, 0.08],
      },
      {
        landmark: "Chidorigafuchi",
        title: "A river of falling petals",
        detail: "The Chidorigafuchi moat reflects the last quiet of morning.",
        image: "/images/tokyo-reflection.webp",
        focus: [0.53, 0.62],
        travel: [1, 0],
      },
    ],
  },
  {
    id: "cairo",
    city: "Cairo",
    region: "Egypt",
    season: "Summer",
    time: "Noon",
    copy:
      "Light becomes architecture, casting the river, stone and sky in molten gold.",
    latitude: 30.0444,
    longitude: 31.2357,
    accent: "#f4ce80",
    atmosphere: "#19150e",
    glow: "#b78a43",
    image: "/images/cairo.webp",
    foreground: "/images/cairo-foreground.webp",
    midground: "/images/cairo-midground.webp",
    landmarks:
      "the Nile, Khan el-Khalili, the Cairo Citadel, the Giza pyramids, and the Great Sphinx",
    particle: "sunlight",
    moments: [
      {
        landmark: "The Nile",
        title: "A city made of sunlight",
        detail: "The Nile and a thousand minarets meet the bright desert horizon.",
        image: "/images/cairo.webp",
        focus: [0.45, 0.51],
        travel: [1, 0.1],
      },
      {
        landmark: "Khan el-Khalili",
        title: "Into the old bazaar",
        detail: "Golden dust drifts through the arches of Khan el-Khalili.",
        image: "/images/cairo-street.webp",
        focus: [0.51, 0.44],
        travel: [1, -0.2],
      },
      {
        landmark: "The Citadel",
        title: "Above the city of minarets",
        detail: "The domes of the Cairo Citadel rise through summer haze.",
        image: "/images/cairo-citadel.webp",
        focus: [0.4, 0.34],
        travel: [-1, 0.08],
      },
      {
        landmark: "Giza pyramids",
        title: "Where the desert begins",
        detail: "The pyramids of Giza appear beyond the last palms.",
        image: "/images/cairo-pyramids.webp",
        focus: [0.44, 0.48],
        travel: [1, 0.04],
      },
      {
        landmark: "The Sphinx",
        title: "The keeper of the horizon",
        detail: "The Great Sphinx emerges from the drifting golden sand.",
        image: "/images/cairo-sphinx.webp",
        focus: [0.63, 0.47],
        travel: [1, 0],
      },
    ],
  },
  {
    id: "paris",
    city: "Paris",
    region: "France",
    season: "Autumn",
    time: "Afternoon",
    copy:
      "The afternoon folds into bronze, glass and the slow choreography of fallen leaves.",
    latitude: 48.8566,
    longitude: 2.3522,
    accent: "#efb16e",
    atmosphere: "#18120f",
    glow: "#bd7347",
    image: "/images/paris.webp",
    foreground: "/images/paris-foreground.webp",
    midground: "/images/paris-midground.webp",
    landmarks:
      "the Eiffel Tower, the Seine, Notre-Dame, the Louvre Pyramid, and the Tuileries Garden",
    particle: "leaf",
    moments: [
      {
        landmark: "Eiffel Tower",
        title: "The afternoon turns gold",
        detail: "The Eiffel Tower rises beyond the amber rooftops.",
        image: "/images/paris.webp",
        focus: [0.66, 0.4],
        travel: [1, 0.12],
      },
      {
        landmark: "The Seine",
        title: "Along the Seine",
        detail: "The bridges of the Seine catch the soft afternoon light.",
        image: "/images/paris-seine.webp",
        focus: [0.57, 0.45],
        travel: [-1, 0.05],
      },
      {
        landmark: "Notre-Dame",
        title: "The heart of the island",
        detail: "Notre-Dame appears beyond the river and the amber trees.",
        image: "/images/paris-notre-dame.webp",
        focus: [0.61, 0.4],
        travel: [1, -0.09],
      },
      {
        landmark: "The Louvre",
        title: "A pyramid of autumn light",
        detail: "The Louvre glass pyramid gathers gold from the afternoon sky.",
        image: "/images/paris-louvre.webp",
        focus: [0.5, 0.48],
        travel: [1, 0.07],
      },
      {
        landmark: "The gardens",
        title: "A garden in late October",
        detail: "Fallen leaves collect beneath the quiet Parisian canopy.",
        image: "/images/paris-garden.webp",
        focus: [0.58, 0.58],
        travel: [1, 0],
      },
    ],
  },
  {
    id: "new-york",
    city: "New York",
    region: "United States",
    season: "Late autumn",
    time: "Sunset",
    copy:
      "Steel catches the final coral light as the first snow edits the city into silence.",
    latitude: 40.7128,
    longitude: -74.006,
    accent: "#ec9aa7",
    atmosphere: "#14101c",
    glow: "#93668a",
    image: "/images/new-york.webp",
    foreground: "/images/new-york-foreground.webp",
    midground: "/images/new-york-midground.webp",
    landmarks:
      "the Empire State Building, the Brooklyn Bridge, Grand Central Terminal, Central Park, and the Statue of Liberty",
    particle: "first-snow",
    moments: [
      {
        landmark: "Empire State",
        title: "The last light on Manhattan",
        detail: "The Empire State Building rises into the coral-blue dusk.",
        image: "/images/new-york.webp",
        focus: [0.68, 0.4],
        travel: [1, -0.06],
      },
      {
        landmark: "Brooklyn Bridge",
        title: "Across the Brooklyn Bridge",
        detail: "The city draws closer as evening falls.",
        image: "/images/new-york-bridge.webp",
        focus: [0.51, 0.53],
        travel: [1, -0.18],
      },
      {
        landmark: "Grand Central",
        title: "Under a ceiling full of stars",
        detail: "The great clock at Grand Central glows beneath its celestial ceiling.",
        image: "/images/new-york-grand-central.webp",
        focus: [0.5, 0.59],
        travel: [-1, 0.07],
      },
      {
        landmark: "Central Park",
        title: "The first snow in the park",
        detail: "Snow settles at Bethesda Terrace as the last leaves come down.",
        image: "/images/new-york-central-park.webp",
        focus: [0.5, 0.65],
        travel: [1, 0.12],
      },
      {
        landmark: "Statue of Liberty",
        title: "Liberty at the harbor",
        detail: "The copper figure turns toward the last coral light.",
        image: "/images/new-york-skyline.webp",
        focus: [0.36, 0.42],
        travel: [1, 0],
      },
    ],
  },
  {
    id: "ushuaia",
    city: "Ushuaia",
    region: "Patagonia, Argentina",
    season: "Deep winter",
    time: "Night",
    copy:
      "At the end of the continent, ice, wind and southern light move as one.",
    latitude: -54.8019,
    longitude: -68.303,
    accent: "#a6d9f6",
    atmosphere: "#091321",
    glow: "#668ad0",
    image: "/images/ushuaia.webp",
    foreground: "/images/ushuaia-foreground.webp",
    midground: "/images/ushuaia-midground.webp",
    landmarks:
      "the Martial Mountains, Ushuaia harbor, the End of the World Train, Tierra del Fuego, Beagle Channel penguins, and the Les Éclaireurs lighthouse",
    particle: "snow",
    moments: [
      {
        landmark: "Ushuaia harbor",
        title: "At the edge of the world",
        detail: "The snowy Martial Mountains rise above the lights of the harbor.",
        image: "/images/ushuaia.webp",
        focus: [0.49, 0.57],
        travel: [1, -0.08],
      },
      {
        landmark: "End of the World Train",
        title: "The last train south",
        detail: "The End of the World Train disappears into the falling snow.",
        image: "/images/ushuaia-end-of-world-train.webp",
        focus: [0.31, 0.55],
        travel: [1, 0.12],
      },
      {
        landmark: "Fuegian forest",
        title: "Into the Fuegian forest",
        detail: "Snow settles among the lenga trees.",
        image: "/images/ushuaia-forest.webp",
        focus: [0.41, 0.62],
        travel: [-1, 0.08],
      },
      {
        landmark: "Channel penguins",
        title: "The wild end of the continent",
        detail: "Magellanic penguins gather on the snowy edge of the channel.",
        image: "/images/ushuaia-beagle-wildlife.webp",
        focus: [0.67, 0.69],
        travel: [1, 0.05],
      },
      {
        landmark: "Les Éclaireurs",
        title: "Where the continent ends",
        detail: "The Les Éclaireurs lighthouse glows beneath the southern Andes.",
        image: "/images/ushuaia-channel.webp",
        focus: [0.31, 0.44],
        travel: [1, 0],
      },
    ],
  },
] as const;

export const chapterStops = chapters.map(
  (_, index) => index / (chapters.length - 1),
);

export function getActiveChapterIndex(progress: number): number {
  return Math.max(
    0,
    Math.min(chapters.length - 1, Math.round(progress * (chapters.length - 1))),
  );
}

export function interpolateCoordinates(progress: number): {
  latitude: number;
  longitude: number;
} {
  const position = Math.max(
    0,
    Math.min(chapters.length - 1, progress * (chapters.length - 1)),
  );
  const currentIndex = Math.floor(position);
  const nextIndex = Math.min(chapters.length - 1, currentIndex + 1);
  const fraction = position - currentIndex;
  const easedFraction = fraction * fraction * (3 - 2 * fraction);
  const current = chapters[currentIndex];
  const next = chapters[nextIndex];

  return {
    latitude:
      current.latitude + (next.latitude - current.latitude) * easedFraction,
    longitude:
      current.longitude + (next.longitude - current.longitude) * easedFraction,
  };
}
