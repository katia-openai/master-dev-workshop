# Mission Control · public workshop demo

A standalone, responsive personal workday dashboard with a persistent five-column board. The entire experience runs on explicitly fictional, deterministic workshop fixtures; no account, OAuth configuration, credential, private inbox, external service, or connected plugin is required.

## Get started

```bash
cd /Users/katia/dev/workshops/master-prep/mission-control
npm install
npm run dev
```

Open the local URL printed by the development server. The Sites starter runs a project-local Cloudflare D1 database, so manually created tasks and status changes survive page reloads and fixture refreshes.

```bash
npm run db:generate
npm test
npm run build
```

## What to try

- Check Today, Inbox, Schedule, Waiting on, and Deadlines.
- Search or filter the board by fictional Slack, Gmail, Calendar, or manual source.
- Open a task to see its source, example link, deadline, waiting-on person, and status.
- Move cards by dragging or by choosing a new status inside task details.
- Add a manual task; reload the page and refresh fixtures to verify it remains.
- Use **Reset demo data** to deliberately restore the original fictional board.

## Fixture data and reference artwork

The original visual reference is included at `assets/mission-control-moodboard.png`. It informs the lilac, chartreuse, cobalt, coral, yellow, rounded translucent-material visual system; it is not presented as a screenshot of the dashboard.

The complete seed dataset lives in:

```text
fixtures/slack.json
fixtures/gmail.json
fixtures/calendar.json
fixtures/tasks.json
fixtures/README.md
```

Every person, channel, message, email, meeting, deadline, and task is fabricated. Links exclusively use `example.com`. The stable reference day is August 11, 2026 in `America/Chicago`; everyone sees the same demo schedule.

## Honest optional integrations

Slack, Gmail, and Google Calendar remain unconnected; the source-status endpoint reports this honestly without adding persistent integration warnings to the interface. Refresh reads the bundled fixture adapters and does not connect to, scan, or import an account. A future integration may accept an explicit, read-only, user-approved import from an actually available agent connector. It must never send messages or email, invent a connection, expose private material, replace existing task statuses, or overwrite manual tasks. This workshop app remains fully functional without those integrations.

## Persistence and privacy

The Sites configuration declares a dedicated `DB` D1 binding. Hosted task routes require the platform-forwarded `oai-authenticated-user-id`; every query and update is scoped to that authenticated owner on the server. Only local `localhost` development uses the synthetic `local-workshop-demo` owner. Fixture refresh updates bundled fixture content while preserving saved statuses and user-created tasks. Reset intentionally replaces only the current owner's records. The workshop site is publicly viewable, while durable task changes remain available only to an identified viewer and stay owner-scoped.

## API

```text
GET    /api/tasks             list and seed your own tasks
POST   /api/tasks             create a durable manual task
PATCH  /api/tasks/:taskId     update your own task status
POST   /api/refresh           refresh fictional fixtures without overwriting work
POST   /api/reset             deliberately restore your own fictional seed data
GET    /api/sources           inspect honest fictional source status
```

The included tests validate fictional fixtures, safe links, all board columns, source connections, status persistence, manual-task survival, reset behavior, and per-user task ownership.
