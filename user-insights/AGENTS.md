# Repository guidelines

Use this file as a map. Keep repeatable implementation detail in the project-local `skills/` directory, and keep enforceable behavior in application code, validation commands, and tests.

## Start here

- Inspect `package.json` before running or claiming a project command.
- Run `pnpm run dev` for the local Vite dashboard.
- Use `pnpm run typecheck` for focused TypeScript verification.
- Run `pnpm run build` before describing a feature as ready for a pull request.
- Do not claim that browser tests, formatting scripts, CI, a Git remote, or a hosted preview exist unless they are actually configured.

## Choose the matching skill

- For a new dashboard card, analytics panel, chart, engagement metric, regional breakdown, table, or compact insight, read and follow `skills/blossomview-card-builder/SKILL.md`.
- Use the skill's `references/dashboard-card-patterns.md` for the existing component, data, chart, styling, and layout contracts.
- Use `assets/active-engagement-card.tsx` only as an adaptable implementation asset, not as a requirement to add that exact card.
- Keep implementation detail in the skill. Do not duplicate its full workflow here.

## Repository map

- `src/App.tsx` owns dashboard composition, the selected region, selected cities, and the shared date period.
- `src/components/` contains the globe, analytics cards, geography table, navigation, and live insights rail.
- `src/components/ui/` contains the local card, chart, button, tabs, avatar, and separator primitives.
- `src/data/insights.ts` contains seeded cities and the authoritative region, country, and audience-growth helpers.
- `src/lib/utils.ts` contains class-name and number-formatting helpers.
- `src/index.css` owns the dark theme, visual tokens, analytics-card styling, and responsive breakpoints.

## Code and component conventions

- Use React, strict TypeScript, and the `@/` import alias.
- Reuse the existing card and chart primitives, `recharts`, `lucide-react`, design tokens, and CSS classes before adding a dependency or a component system.
- Derive region-sensitive content from the filtered `cities` passed down from `App`.
- Keep the interactive globe as the visual focus of the dashboard.
- Preserve existing cards, interactions, keyboard accessibility, meaningful labels, and reduced-motion behavior.
- Make the smallest relevant change. Do not redesign adjacent components.

## UI validation

- Inspect affected surfaces at mobile, tablet, breakpoint-edge, and desktop widths. Include `390`, `720`, `721`, `768`, and `1440px` when relevant.
- Use the in-app browser to reproduce visual defects, inspect actual rendered elements and computed layout, and verify the smallest focused fix. Use browser developer tooling or CDP only when direct browser inspection cannot explain the issue.
- Check browser console errors, missing assets, clipping, chart dimensions, and horizontal overflow.
- Verify `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at each required viewport. Record an existing failure before changing the code and check the same viewport after the fix.
- Test regional filters against the globe, new card, headline metrics, country table, and live insights.
- Capture before-and-after screenshots for user-visible changes.
- Run `pnpm run typecheck` and `pnpm run build` before publishing.
- Run browser or visual-regression tests only when their dependencies and commands exist in `package.json`.

## Pull-request visual evidence

- Capture the before screenshots before modifying a visible feature or responsive breakpoint. Capture the after screenshots on the same route, at the same viewport, and in the same filter state.
- For a screenshot-rich UI pull request, include matched evidence at `390px` mobile, `721px` failing-breakpoint edge, `768px` tablet, and `1440px` desktop. Include `720px` as an additional regression check when changing the existing mobile breakpoint.
- Keep screenshot names and locations predictable: `docs/visual-evidence/<change-slug>/before-390.png`, `after-390.png`, `before-721.png`, `after-721.png`, `before-768.png`, `after-768.png`, `before-1440.png`, and `after-1440.png`.
- For a combined feature-and-fix demonstration, separately preserve `before-card-1440.png` and `after-card-1440.png` before starting responsive debugging. Do not overwrite feature screenshots with breakpoint-fix screenshots.
- Use full-page screenshots when the changed card falls below the first viewport. Pause the animated globe or use reduced motion consistently so before-and-after images are comparable.
- When a card depends on the selected region, also capture `after-europe-1440.png` showing the `Europe` filter and the updated card.
- Embed the actual screenshots in the pull-request description using a mobile, breakpoint, tablet, and desktop before/after Markdown table. Use the actual GitHub repository and head-branch image URLs; do not leave local filesystem links, temporary paths, or placeholder image URLs in a published pull request.
- Commit screenshot evidence only when the user has requested a visual pull request; otherwise keep temporary browser captures outside the repository.

## Pull requests

- Use `<type>(<area>): <imperative summary>` for commit subjects and pull-request titles.
- Prefer the narrowest truthful scope, such as `feat(dashboard): add active engagement card` or `fix(navigation): prevent tablet overflow`.
- Follow `.github/pull_request_template.md`.
- Include the user-visible summary, motivation, actual validation commands, and before-and-after visual evidence.
- When one pull request includes both the dashboard feature and its responsive correction, use a truthful combined title such as `feat(dashboard): add active engagement and fix tablet overflow`.
- Upload each screenshot through the GitHub pull-request editor so GitHub creates a stable `https://github.com/user-attachments/assets/...` URL. Embed those uploaded assets inline in the mobile, breakpoint, tablet, and desktop before/after table with `<img>` tags; do not use private-repository `raw.githubusercontent.com` URLs, repository blob links, local filesystem links, temporary paths, or placeholder image URLs.
- Preview the pull-request body before saving and verify that every screenshot renders inline.
- Open a ready-for-review pull request unless the user explicitly requests a draft.
- After opening a pull request, verify its actual URL, body, embedded image links, and available checks. Report any pending or failing checks accurately.
- Do not merge without explicit authorization and the required approvals.

## Plans and scope

- Do not create an ExecPlan unless the user explicitly asks for one.
- Preserve unrelated user changes and avoid committing secrets or generated build output.
