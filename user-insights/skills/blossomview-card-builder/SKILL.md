---
name: blossomview-card-builder
description: Build or update cards, charts, metrics, tables, and insights for the BlossomView React dashboard. Use when asked to add a new dashboard card, analytics panel, engagement or retention metric, regional insight, live-activity section, or chart while matching BlossomView's existing Card primitives, Recharts wrappers, selected-region data, styling tokens, accessible controls, and responsive layout.
---

# BlossomView Card Builder

Build a new card as though its author already knows this codebase. Reuse the dashboard's actual components, data, formatting, and visual language. Read [references/dashboard-card-patterns.md](references/dashboard-card-patterns.md) before choosing the implementation.

## Start with the existing system

1. Read `src/App.tsx` to locate the existing dashboard state and the two card placement options.
2. Read `src/components/ui/card.tsx` and reuse `Card`, `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent`.
3. Read `src/components/audience-chart.tsx` and `src/components/geographic-table.tsx` for full-size analytics cards, or `src/components/insights-rail.tsx` for a compact sidebar section.
4. Read `src/data/insights.ts` and `src/lib/utils.ts`. Derive metrics from the existing `UserCity[]`, `getCountryTotals`, `getGrowthData`, `compactNumber`, and `preciseNumber`.
5. Read the relevant `.analytics-*`, `.rail-*`, and breakpoint rules in `src/index.css`.

## Choose the right card

- Add an independent analytics card to the existing `.analytics-grid` in `src/App.tsx`.
- Add a compact insight inside `InsightsRail` when the request belongs with live activity, country rankings, or regional distribution.
- Add a chart only when it explains a meaningful relationship; use the installed `recharts` package and the local `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, and `ChartConfig` from `@/components/ui/chart`.
- Use `assets/active-engagement-card.tsx` as a working starting point for an analytics card. Rename and adapt it to the actual request; do not mount the template unchanged when the user asks for another metric.

## Preserve the data contract

- Accept the region-filtered `cities: UserCity[]` from `App`; never import the unfiltered global `cities` into a card that should follow the selected region.
- Derive totals, counts, percentages, rankings, and chart points from those props or from existing typed helpers. Guard empty lists and zero denominators.
- Pass the existing `period` and `setPeriod` only when a card genuinely needs the shared date filter.
- Do not invent backend endpoints, new state-management systems, fetch requests, historical series, percentages, or unrelated dependencies.
- Use `compactNumber` for compact headline values and `preciseNumber` when displaying exact counts.

## Match BlossomView

- Import application code through the `@/` alias.
- Use existing semantic CSS classes and custom properties, especially `analytics-card`, `analytics-header`, `analytics-content`, `chart-headline`, `chart-comparison`, `section-icon`, `--primary`, `--mint`, `--muted-foreground`, and `--border`.
- Use `lucide-react` icons with `aria-hidden="true"`; reuse the local `Button`, `Tabs`, and `Separator` when needed.
- Preserve the globe as the dominant first-screen feature. Add cards below it unless the user explicitly requests a different layout.
- Add an informative heading, a meaningful description, an accessible chart label where appropriate, and a stable unique card `id`.
- Keep the existing responsive grid. Verify the card at `390`, `720`, `721`, `768`, and `1440` pixels; inspect document overflow instead of assuming a successful build proves the UI works.

## Verify and hand off

1. Run `pnpm run typecheck` and `pnpm run build`.
2. Inspect the live dashboard in the browser at the requested breakpoints.
3. Select `Europe`, confirm the new card changes with the existing globe and insights rail, and switch back to `Everywhere`.
4. Check browser console errors, layout clipping, card semantics, and horizontal overflow.
5. Capture before-and-after screenshots for user-visible changes. Save incidental screenshots outside the repository unless the user requests committed visual evidence.
6. Run browser tests only when the repository actually provides the corresponding test dependency and script; do not claim an absent Playwright suite exists.
7. Follow the repository's `AGENTS.md` for commit subjects, pull-request titles, validation reporting, and visual evidence. Do not generate an ExecPlan.

## Example requests

- "Use $blossomview-card-builder to add an active-engagement card to the dashboard."
- "Add a top-growing cities card that changes with the selected region."
- "Add a country engagement chart using the dashboard's existing components."
- "Add a small retention insight to the right-hand rail without redesigning the page."
