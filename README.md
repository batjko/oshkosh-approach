# EAA Oshkosh Approach Companion

A source-backed Fisk VFR arrival companion for **EAA AirVenture
Oshkosh**, designed for use in the cockpit on a tablet (and readable
on phones). It walks general-aviation pilots through the eight phases
of the arrival — from preflight through ground/depart — with the
right information surfaced at the right moment, plus live FAA NOTAMs
for KOSH on every page load.

> The official **FAA AirVenture Notice** for the current year is the
> only authoritative source. This app is a procedural companion,
> sourced from that Notice, not a replacement for it.

Live: <https://www.oshkosh-approach.com/>

---

## What it does

- **Phase-driven flow** — eight stable phases (preflight → enroute →
  transition → ripon-to-fisk → at-fisk → inbound-runway → ground →
  depart) with a chip-style spine you can step through manually or
  display an opt-in GPS position marker without changing the selected phase.
- **Phase-aware sections** — Briefing, Map, Transitions, NOTAMs and
  Runway tabs surface only what's relevant to the current phase.
- **Two modes** — `Plan` for ground prep (warm "chart" theme,
  prose-first) and `Flight` for cockpit use (dark "cockpit" theme,
  large numerals, inline map under the hero, simplified tabs).
- **Live NOTAMs** — every reload fetches the public FAA NOTAM Search
  endpoint for KOSH; results are filtered, sorted by priority, and
  the loader sets `Cache-Control: no-store` so you always see the
  latest. A separate banner reserves itself for **truly critical**
  NOTAMs only (closures, TFRs, IFR-only, emergencies).
- **Reference sheets** — Notice acknowledgement, aircraft profile,
  parking signs, alternates and divert detail are one tap away as
  modal sheets without losing your place in the flow.
- **PWA / offline-friendly** — installable, service-worker-backed,
  with an offline fallback for navigations.
- **Tablet-first layout** — content fills up to 1280 px and stays
  readable on smaller screens.

---

## Run it locally

```sh
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

### Other scripts

```sh
npm run typecheck    # tsc --noEmit
npm run lint         # eslint . (cached)
npm run build        # Production build → build/{client,server}
npm run start        # Serve the production build via remix-serve
```

Node ≥ 20 is required (see `engines` in `package.json`).

---

## Architecture at a glance

Single-route Remix 2 app on Vite 5, Tailwind 3 + DaisyUI for styling,
Zustand for UI state, Leaflet for the map.

```
Browser ──► routes/_index.tsx ──► .server/notamList.ts ──► FAA NOTAM Search
              │ loader (no-store)
              ▼
          FiskApproachApp
              │
              ├── AppShell (AppBar, StatusBar, CriticalNotamBanner,
              │             PhaseSpine, PhaseHero)
              ├── PhaseSections (tabs bound to PHASE_TAB_LAYOUT)
              │     ├── BriefingSection
              │     ├── MapSection (lazy-loaded Leaflet)
              │     ├── TransitionsSection
              │     ├── NotamSection ──► NotamList
              │     └── RunwaySection
              ├── DivertFab
              └── *Sheet (Notice / Profile / Signs / Alternates / Divert)
```

UI state (current phase, mode, theme, profile, GPS opt-in, etc.) lives
in a single `useAppStore` Zustand store with `persist` middleware.
Procedural content is pure typed data in `app/content/oshkosh/*`,
keeping components free of inline aviation facts.

For a deeper dive see [`docs/architecture.md`](./docs/architecture.md).

For agent-facing guidance (codebase conventions, gotchas, NOTAM
pipeline contract, boundaries) see [`AGENTS.md`](./AGENTS.md).

---

## NOTAMs

The app calls the **public FAA NOTAM Search** endpoint
(`https://notams.aim.faa.gov/notamSearch/search`) — the same XHR the
official FAA NOTAM Search website uses. No API key is required.

`app/.server/notamList.ts` handles the fetch, normalises FAA dates
(`MM/DD/YYYY HHmm` Zulu and `'PERM'`), strips inline HTML from message
bodies, and forces IPv4-first DNS resolution to avoid IPv6 hangs at
the Akamai edge. NOTAMs are categorised in
`app/utils/notamFilters.ts`:

| Level     | Surfaced as                                                                       |
|-----------|-----------------------------------------------------------------------------------|
| critical  | Top banner (capped at 3 + overflow link). Real closures, TFRs, IFR-only.          |
| high      | Counted on the NOTAMs tab badge. FISK/RIPON-related, freq changes, NORDO, waiver. |
| medium    | Listed in the NOTAMs tab. Routine IAP/ILS/VOR amendments.                         |
| low       | Listed in the NOTAMs tab. Distant obstacles, taxiway lighting.                    |

Pilots refresh by reloading the page; there is no in-process or SW
cache for NOTAM data.

---

## Themes & layout

Two DaisyUI themes are defined in `tailwind.config.ts`:

- **`chart`** — warm sectional palette (`paper`, `ink`, `grass`,
  `runway`), used in `Plan` mode.
- **`cockpit`** — dark instrument-readable palette
  (`bg`, `panel`, `accent`, `live`, `alert`), used in `Flight` mode.

Cockpit numerals use `font-cockpit` (JetBrains Mono) with
`text-numeral-{lg,md,sm}` sizes for high-glance readability.

Shell containers cap at `max-w-screen-xl` (1280 px) for tablet
comfort.

---

## Logging

Both client and server emit structured logs to
[PostHog Logs](https://posthog.com/docs/logs) over OTLP — without any
PostHog-specific log SDK on the server.

- **Client** uses `posthog.logger` (posthog-js ≥ 1.368), wired in
  `app/entry.client.tsx`. We deliberately do **not** enable
  `captureConsoleLogs` (privacy/blast-radius risk per PostHog's docs).
- **Server** uses `@opentelemetry/sdk-node` with the OTLP HTTP
  exporter pointed at `https://eu.i.posthog.com/i/v1/logs`. See
  `app/.server/logger.ts`.

The instrumentation is deliberately narrow — NOTAM fetch lifecycle on
the server, plus app boot, service-worker registration, error
boundary, and the NOTAM Refresh click on the client. High-frequency
domain transitions (phase / section changes) stay in PostHog *events*,
not logs. The full verbosity contract is in
[`AGENTS.md`](./AGENTS.md#verbosity-contract).

Token defaults to the public client token already in the bundle. Set
`POSTHOG_PROJECT_KEY` on the server (e.g. as a Heroku config var) to
override.

## PWA / Service worker

`public/service-worker.js` (cache version **v6**) registers from
`routes/_index.tsx`. Strategy:

- **Navigation requests** use `cache: 'no-store'` and only an offline
  fallback HTML blob is cached. Network-first, falling back to the
  blob when offline.
- **Static assets** are cache-first against versioned caches, using exact
  public paths or the same-origin `/assets/` build path.
- Bump *every* `v\d+` token in `service-worker.js` together when you
  change SW behaviour, otherwise clients can end up with a mix of
  cache versions.

The app is installable via `public/manifest.json`.

---

## Procedural content

Everything the app says about Oshkosh — phases, frequencies,
transitions, holds, runways, alternates, signs, aircraft profiles,
divert triggers, waypoints — lives in
[`app/content/oshkosh/`](./app/content/oshkosh) as typed,
import-time-validated data.

`app/content/oshkosh/notice.ts` exposes the currently embedded Notice
year and release status. The app is loaded with the released **2026
FAA/EAA AirVenture Notice** after a source-backed review of procedural
constants.

Every fact is tied back to a citation in
[`app/content/oshkosh/sources.ts`](./app/content/oshkosh/sources.ts) —
do not introduce procedural facts without a source ref.

---

## Deployment

The Heroku app `oshkosh-approach` is configured (in the Heroku
dashboard) to **auto-deploy on push to `origin/master`** on GitHub.
There is no GitHub Actions workflow in this repo.

```
Procfile  →  web: npm run start
```

The build runs `npm run build` (Remix + Vite) and `remix-serve`
serves the resulting `build/server/index.js`.

Production: <https://www.oshkosh-approach.com/>.

---

## Project layout

```
app/
  .server/                  Server-only modules (FAA fetch + types)
  content/oshkosh/          Canonical typed procedural content
  components/
    shell/                  Chrome (AppBar, StatusBar, banner)
    phase/                  PhaseSpine, PhaseHero
    section/                Tabs + per-section panels
    sheet/, sheets/         Native <dialog> sheets
    onboarding/             First-launch wizard
    notams/, runway/, transitions/, divert/, checklist/, sources/, map/, ui/
  hooks/                    useGeolocation (opt-in)
  utils/                    notamFilters, geofencing
  store/                    useAppStore (Zustand + persist)
  routes/_index.tsx         Single route + loader
  root.tsx, entry.{client,server}.tsx, tailwind.css
public/
  service-worker.js, manifest.json, icons, fonts
plans/                      Historical implementation plans (ACE-FCA)
docs/                       Architecture + research references
```

---

## Contributing

Read [`AGENTS.md`](./AGENTS.md) first — it documents the conventions,
the NOTAM pipeline contract, and the boundaries (especially around
procedural content, the SW, and the FAA endpoint).

In short:

- Keep components ≤ 300 LoC. Split when they grow.
- Strict TypeScript. No `any` in public APIs.
- Use the `~` import alias for `app/`.
- Don't inline aviation facts in components — they live in `app/content/oshkosh/*`.
- Don't cache NOTAMs.
- Don't broaden the critical-NOTAM patterns.
- Bump SW cache versions atomically when touching `service-worker.js`.
- Run `npm run lint && npm run typecheck && npm run build` before opening a PR.

---

## License

MIT. See [`LICENSE`](./LICENSE) if present.
