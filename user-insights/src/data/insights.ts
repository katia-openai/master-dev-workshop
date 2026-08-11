export type Region =
  "Everywhere" | "Americas" | "Europe" | "Asia Pacific" | "Africa";
export type Period = "7d" | "28d" | "90d";

export type UserCity = {
  city: string;
  country: string;
  flag: string;
  region: Exclude<Region, "Everywhere">;
  lat: number;
  lng: number;
  users: number;
  active: number;
  growth: number;
};

export const regions: Region[] = [
  "Everywhere",
  "Americas",
  "Europe",
  "Asia Pacific",
  "Africa",
];

export const cities: UserCity[] = [
  {
    city: "San Francisco",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 37.7749,
    lng: -122.4194,
    users: 284320,
    active: 1842,
    growth: 18.4,
  },
  {
    city: "New York",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 40.7128,
    lng: -74.006,
    users: 246180,
    active: 1615,
    growth: 14.2,
  },
  {
    city: "Austin",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 30.2672,
    lng: -97.7431,
    users: 112640,
    active: 704,
    growth: 22.8,
  },
  {
    city: "Seattle",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 47.6062,
    lng: -122.3321,
    users: 89420,
    active: 488,
    growth: 11.6,
  },
  {
    city: "Los Angeles",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 34.0522,
    lng: -118.2437,
    users: 83610,
    active: 476,
    growth: 9.8,
  },
  {
    city: "Toronto",
    country: "Canada",
    flag: "🇨🇦",
    region: "Americas",
    lat: 43.6532,
    lng: -79.3832,
    users: 94620,
    active: 512,
    growth: 16.7,
  },
  {
    city: "São Paulo",
    country: "Brazil",
    flag: "🇧🇷",
    region: "Americas",
    lat: -23.5505,
    lng: -46.6333,
    users: 132860,
    active: 806,
    growth: 24.3,
  },
  {
    city: "Mexico City",
    country: "Mexico",
    flag: "🇲🇽",
    region: "Americas",
    lat: 19.4326,
    lng: -99.1332,
    users: 68150,
    active: 394,
    growth: 19.1,
  },
  {
    city: "Buenos Aires",
    country: "Argentina",
    flag: "🇦🇷",
    region: "Americas",
    lat: -34.6037,
    lng: -58.3816,
    users: 43620,
    active: 258,
    growth: 12.4,
  },
  {
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    region: "Europe",
    lat: 51.5072,
    lng: -0.1276,
    users: 198740,
    active: 1208,
    growth: 17.2,
  },
  {
    city: "Berlin",
    country: "Germany",
    flag: "🇩🇪",
    region: "Europe",
    lat: 52.52,
    lng: 13.405,
    users: 146230,
    active: 894,
    growth: 21.6,
  },
  {
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
    region: "Europe",
    lat: 48.8566,
    lng: 2.3522,
    users: 127480,
    active: 768,
    growth: 15.8,
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    flag: "🇳🇱",
    region: "Europe",
    lat: 52.3676,
    lng: 4.9041,
    users: 86240,
    active: 526,
    growth: 13.9,
  },
  {
    city: "Stockholm",
    country: "Sweden",
    flag: "🇸🇪",
    region: "Europe",
    lat: 59.3293,
    lng: 18.0686,
    users: 54820,
    active: 312,
    growth: 20.1,
  },
  {
    city: "Lisbon",
    country: "Portugal",
    flag: "🇵🇹",
    region: "Europe",
    lat: 38.7223,
    lng: -9.1393,
    users: 46380,
    active: 277,
    growth: 28.7,
  },
  {
    city: "Barcelona",
    country: "Spain",
    flag: "🇪🇸",
    region: "Europe",
    lat: 41.3874,
    lng: 2.1686,
    users: 61240,
    active: 368,
    growth: 12.3,
  },
  {
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    region: "Asia Pacific",
    lat: 35.6762,
    lng: 139.6503,
    users: 176540,
    active: 1072,
    growth: 18.9,
  },
  {
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    region: "Asia Pacific",
    lat: 1.3521,
    lng: 103.8198,
    users: 118760,
    active: 732,
    growth: 26.4,
  },
  {
    city: "Bengaluru",
    country: "India",
    flag: "🇮🇳",
    region: "Asia Pacific",
    lat: 12.9716,
    lng: 77.5946,
    users: 164890,
    active: 1018,
    growth: 31.2,
  },
  {
    city: "Seoul",
    country: "South Korea",
    flag: "🇰🇷",
    region: "Asia Pacific",
    lat: 37.5665,
    lng: 126.978,
    users: 103620,
    active: 628,
    growth: 14.6,
  },
  {
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    region: "Asia Pacific",
    lat: -33.8688,
    lng: 151.2093,
    users: 96340,
    active: 582,
    growth: 16.8,
  },
  {
    city: "Jakarta",
    country: "Indonesia",
    flag: "🇮🇩",
    region: "Asia Pacific",
    lat: -6.2088,
    lng: 106.8456,
    users: 74620,
    active: 442,
    growth: 27.5,
  },
  {
    city: "Mumbai",
    country: "India",
    flag: "🇮🇳",
    region: "Asia Pacific",
    lat: 19.076,
    lng: 72.8777,
    users: 82510,
    active: 498,
    growth: 23.7,
  },
  {
    city: "Auckland",
    country: "New Zealand",
    flag: "🇳🇿",
    region: "Asia Pacific",
    lat: -36.8509,
    lng: 174.7645,
    users: 31480,
    active: 186,
    growth: 11.2,
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    region: "Asia Pacific",
    lat: 25.2048,
    lng: 55.2708,
    users: 78840,
    active: 468,
    growth: 29.1,
  },
  {
    city: "Nairobi",
    country: "Kenya",
    flag: "🇰🇪",
    region: "Africa",
    lat: -1.2921,
    lng: 36.8219,
    users: 62850,
    active: 378,
    growth: 34.2,
  },
  {
    city: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    region: "Africa",
    lat: 6.5244,
    lng: 3.3792,
    users: 84270,
    active: 506,
    growth: 38.6,
  },
  {
    city: "Cape Town",
    country: "South Africa",
    flag: "🇿🇦",
    region: "Africa",
    lat: -33.9249,
    lng: 18.4241,
    users: 51620,
    active: 308,
    growth: 19.4,
  },
  {
    city: "Cairo",
    country: "Egypt",
    flag: "🇪🇬",
    region: "Africa",
    lat: 30.0444,
    lng: 31.2357,
    users: 42780,
    active: 254,
    growth: 22.1,
  },
];

export const activitySeed = [
  {
    type: "New signup",
    city: "Berlin",
    flag: "🇩🇪",
    detail: "joined the community",
    age: "just now",
    accent: "violet",
  },
  {
    type: "Plan upgraded",
    city: "Tokyo",
    flag: "🇯🇵",
    detail: "moved to Pro",
    age: "24s ago",
    accent: "mint",
  },
  {
    type: "Team created",
    city: "São Paulo",
    flag: "🇧🇷",
    detail: "invited 4 teammates",
    age: "1m ago",
    accent: "blue",
  },
  {
    type: "New signup",
    city: "Nairobi",
    flag: "🇰🇪",
    detail: "joined the community",
    age: "2m ago",
    accent: "violet",
  },
  {
    type: "Milestone",
    city: "London",
    flag: "🇬🇧",
    detail: "reached 10k sessions",
    age: "4m ago",
    accent: "mint",
  },
] as const;

export function getCities(region: Region) {
  return region === "Everywhere"
    ? cities
    : cities.filter((city) => city.region === region);
}

export function getCountryTotals(selectedCities: UserCity[]) {
  const countries = new Map<
    string,
    {
      country: string;
      flag: string;
      users: number;
      active: number;
      growth: number;
      cities: number;
    }
  >();

  for (const city of selectedCities) {
    const entry = countries.get(city.country);
    if (entry) {
      entry.users += city.users;
      entry.active += city.active;
      entry.growth += city.growth;
      entry.cities += 1;
    } else {
      countries.set(city.country, {
        country: city.country,
        flag: city.flag,
        users: city.users,
        active: city.active,
        growth: city.growth,
        cities: 1,
      });
    }
  }

  return [...countries.values()]
    .map((entry) => ({ ...entry, growth: entry.growth / entry.cities }))
    .sort((a, b) => b.users - a.users);
}

export function getGrowthData(period: Period, selectedCities: UserCity[]) {
  const count = period === "7d" ? 7 : period === "28d" ? 28 : 30;
  const total = selectedCities.reduce((sum, city) => sum + city.users, 0);
  const end = new Date(2026, 6, 28);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end);
    date.setDate(
      end.getDate() - (count - index - 1) * (period === "90d" ? 3 : 1),
    );
    const progress = index / Math.max(count - 1, 1);
    const baseline = total * (0.71 + progress * 0.29);
    const movement =
      total * (Math.sin(index * 0.72) * 0.019 + Math.cos(index * 0.31) * 0.012);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      users: Math.round(baseline + movement),
      previous: Math.round(
        total * (0.64 + progress * 0.245 + Math.sin(index * 0.54) * 0.012),
      ),
      signups: Math.round(
        1650 +
          progress * 1300 +
          Math.sin(index * 1.1) * 580 +
          Math.cos(index * 0.35) * 260,
      ),
    };
  });
}

export const liveData = Array.from({ length: 32 }, (_, index) => ({
  time: index,
  active: Math.round(
    12900 +
      index * 46 +
      Math.sin(index * 0.88) * 690 +
      Math.cos(index * 0.39) * 330,
  ),
}));
