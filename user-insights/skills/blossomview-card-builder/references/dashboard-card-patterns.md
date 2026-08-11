# BlossomView dashboard card patterns

## Project map

- `src/App.tsx`: dashboard composition, selected `region`, shared `period`, filtered `selectedCities`, `.analytics-grid`, and right-hand rail.
- `src/components/ui/card.tsx`: local `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` primitives.
- `src/components/ui/chart.tsx`: local `ChartContainer`, `ChartConfig`, `ChartTooltip`, and `ChartTooltipContent` wrapping Recharts.
- `src/components/audience-chart.tsx`: complete analytics-chart example, including local cards, period tabs, accessible Recharts, chart configuration, and compact-number formatting.
- `src/components/geographic-table.tsx`: complete analytics-table example, including typed `cities`, country aggregation, Lucide icons, and existing card classes.
- `src/components/insights-rail.tsx`: compact sidebar sections, separators, country rankings, regional buttons, and live charts.
- `src/data/insights.ts`: the actual `UserCity`, `Region`, `Period`, `cities`, `getCities`, `getCountryTotals`, `getGrowthData`, and `liveData` contracts.
- `src/lib/utils.ts`: `cn`, `compactNumber`, and `preciseNumber`.
- `src/index.css`: design tokens, analytics styling, chart styling, rail styling, and breakpoints.
- `package.json`: authoritative installed libraries and available validation commands.

## Data contract

`App` owns the selected region:

```tsx
const [region, setRegion] = useState<Region>("Everywhere");
const selectedCities = useMemo(() => getCities(region), [region]);
```

Pass `selectedCities` into a new card:

```tsx
<ActiveEngagementCard cities={selectedCities} />
```

Declare the component with the real city type:

```tsx
import type { UserCity } from "@/data/insights";

export function ActiveEngagementCard({ cities }: { cities: UserCity[] }) {
  const totalUsers = cities.reduce((sum, city) => sum + city.users, 0);
  const activeUsers = cities.reduce((sum, city) => sum + city.active, 0);
  const activeShare = totalUsers === 0 ? 0 : (activeUsers / totalUsers) * 100;

  // Render the existing Card primitives.
}
```

Use `getCountryTotals(cities)` for a country breakdown. Its results already expose `country`, `flag`, `users`, `active`, `growth`, and `cities`; they are sorted by total users, so explicitly sort by `active` before presenting a most-active-countries chart. Use `getGrowthData(period, cities)` only for an actual period-based audience-growth series. Do not convert a current snapshot into fictional historical activity.

## Full-size analytics card

Import the existing local primitives:

```tsx
import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
```

Follow the existing geography and audience card structure:

```tsx
<Card id="active-engagement" className="analytics-card engagement-card">
  <CardHeader className="analytics-header">
    <div>
      <CardTitle>Active engagement</CardTitle>
      <CardDescription>
        Where your audience is active right now.
      </CardDescription>
    </div>
    <Activity className="section-icon" aria-hidden="true" />
  </CardHeader>
  <CardContent className="analytics-content">
    {/* Render derived headline values and, if useful, a chart. */}
  </CardContent>
</Card>
```

Create the component under `src/components/`, import it into `src/App.tsx`, and mount it inside the existing `<div className="analytics-grid">`. Preserve the globe, current cards, and sidebar. The grid already collapses to one column at and below `1000px`.

## Chart pattern

Use only the installed `recharts` library and local chart wrapper:

```tsx
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const engagementConfig = {
  active: { label: "Active users", color: "var(--mint)" },
} satisfies ChartConfig;

const countries = getCountryTotals(cities)
  .sort((left, right) => right.active - left.active)
  .slice(0, 6);
```

Pass meaningful, existing data and enable accessibility:

```tsx
<ChartContainer
  config={engagementConfig}
  className="growth-chart"
  aria-label="Active users by country"
>
  <BarChart accessibilityLayer data={countries}>
    <CartesianGrid vertical={false} strokeDasharray="3 7" />
    <XAxis dataKey="country" tickLine={false} axisLine={false} />
    <YAxis tickLine={false} axisLine={false} tickFormatter={compactNumber} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="active" fill="var(--mint)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ChartContainer>
```

Use an existing `.growth-chart`-style explicit height: Recharts' responsive container needs nonzero dimensions. Disable animations where reproducible screenshot evidence is required. See `assets/active-engagement-card.tsx` for the full typed implementation.

## Compact sidebar section

When the request is a small live insight, extend the existing rail rather than adding another nested `Card`:

```tsx
<Separator />
<section className="rail-section" aria-label="Active engagement">
  <div className="rail-section-heading">
    <span>Active engagement</span>
    <span className="subtle-label">selected region</span>
  </div>
  <div className="live-chart-value">{preciseNumber(activeUsers)}</div>
  <span className="chart-footnote">
    {activeShare.toFixed(1)}% of the selected audience
  </span>
</section>
```

`InsightsRail` already receives both filtered `cities` and unfiltered `allCities`. Use `cities` for the selected view; use `allCities` only when deliberately calculating a worldwide comparison.

## Visual and interaction contract

- Preserve the existing dark, low-chrome dashboard; do not introduce a second design system or rebuild the page.
- Use the `@/` alias, Lucide icons, existing local primitives, CSS custom properties, and the established card classes.
- Format headlines with `compactNumber`; format exact live figures with `preciseNumber`.
- Keep headings readable, use semantic sections, and mark decorative icons `aria-hidden="true"`.
- Check `390`, `720`, `721`, `768`, and `1440px`. The existing navigation has a known `721–768px` overflow; distinguish pre-existing issues from regressions caused by the new card.
- Verify `document.documentElement.scrollWidth` against `document.documentElement.clientWidth`.
- Click `Europe` and verify that the new card follows the filtered globe, country table, and insights rail; return to `Everywhere` afterward.
- Use `pnpm run typecheck` and `pnpm run build`. Inspect `package.json` before claiming an additional browser-test command exists.
