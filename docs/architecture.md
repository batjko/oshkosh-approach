# Architecture

A deeper companion to the [root README](../README.md) and
[`AGENTS.md`](../AGENTS.md). Read those first; this document expands
on the *why* behind the structure.

---

## Design principles

1. **Phase-driven progressive disclosure.** A pilot's needs change
   sharply between preflight, en-route, the conga line, the runway
   call, and on the ground. The UI is structured around eight stable
   `PhaseId`s rather than a flat scroll of "everything you might
   want". Tabs change *aspect* of the current phase; sheets carry
   long-form references off the main scroll.

2. **Source-backed content.** Every aviation fact in the app is
   data, not markup. `app/content/oshkosh/*` is the single source of
   truth, every piece tied to a `SourceRef` in
   `app/content/oshkosh/sources.ts`. UI components consume typed
   exports and never inline domain knowledge.

3. **Authoritative live NOTAMs.** The FAA NOTAM Search response is
   never cached — neither in-process nor in the service worker.
   Reload = fresh data. The loader sets `Cache-Control: no-store`
   and the SW's navigation handler uses `fetch(..., { cache:
   'no-store' })`.

4. **Cockpit-friendly chrome.** The `cockpit` theme, large numerals,
   tightened tab set in flight mode, and `1280 px` tablet-comfort
   shell width all serve glance-readability under workload.

5. **Offline graceful degradation.** Service worker caches static
   assets and an offline-fallback HTML page; navigations are still
   network-first so a connected pilot always sees fresh state.

---

## Module boundaries

```
┌────────────────────────────────────────────────────────────────┐
│ app/routes/_index.tsx                                          │
│   loader() → getKoshNotams() → NotamFetchResult                │
│   default export → <FiskApproachApp />                         │
└────────────────────────────────────────────────────────────────┘
              │ props (notamList, fetchedAt, source, fetchError)
              ▼
┌────────────────────────────────────────────────────────────────┐
│ app/components/FiskApproachApp.tsx                             │
│   - reads `mode` from store                                    │
│   - computes critical NOTAMs via getCriticalNotams             │
│   - composes <AppShell> + <PhaseSections> + sheets + DivertFab │
└────────────────────────────────────────────────────────────────┘
              │
   ┌──────────┴───────────────────┐
   ▼                              ▼
┌────────────────────┐   ┌─────────────────────────────────────┐
│ AppShell (chrome)  │   │ PhaseSections (per-phase content)   │
│  AppBar            │   │  SectionTabs (PHASE_TAB_LAYOUT)     │
│  StatusBar         │   │  SectionPanel × 5                   │
│  CriticalNotamBanr │   │    BriefingSection                  │
│  PhaseSpine        │   │    MapSection (lazy Leaflet)        │
│  PhaseHero         │   │    TransitionsSection               │
│  <main> children   │   │    NotamSection → NotamList         │
│                    │   │    RunwaySection                    │
│  OnboardingFlow*   │   └─────────────────────────────────────┘
└────────────────────┘
   * gated by `onboardingComplete`
```

`Sheet` instances (`NoticeSheet`, `ProfileSheet`, `SignsSheet`,
`AlternatesSheet`, `DivertSheet`) and `DivertFab` are siblings of
`AppShell`, mounted at the top level of `FiskApproachApp` so they
overlay anything beneath them via the native `<dialog>` API.

---

## State management

A single Zustand store, [`app/store/useAppStore.ts`](../app/store/useAppStore.ts),
with `persist` middleware (`localStorage`).

| Field                     | Persisted | Notes                                                       |
|---------------------------|:--:|--------------------------------------------------------------------|
| `currentPhase`            | ✅ | Stable named ID; reset triggers `defaultSectionForPhase`.          |
| `mode`                    | ✅ | `pre-flight` \| `in-flight`. Flight unlock requires Notice ack.    |
| `theme`                   | ✅ | `chart` \| `cockpit`.                                              |
| `enableMap`               | ✅ | Map fallback toggle.                                               |
| `noticeYearAcknowledged`  | ✅ | Required for in-flight unlock.                                     |
| `aircraftProfileId`       | ✅ | Drives specialty branching (rotorcraft, ultralight, NORDO, etc.).  |
| `aircraftIdentity`        | ✅ | Pilot-provided "Cessna red 1234N"-style ATC self-description.      |
| `assignedRunwayId`        | ✅ | Set at Fisk; surfaced in RunwaySection.                            |
| `gpsEnabled`              | ✅ | Opt-in flag for `useGeolocation`.                                  |
| `onboardingComplete`      | ✅ | Gates `<OnboardingFlow>`.                                          |
| `currentLocation`         | ❌ | Live geolocation; session-only.                                    |
| `activeSection`           | ❌ | Reset by phase changes via `defaultSectionForPhase`.               |
| `openSheet`               | ❌ | Currently-open modal sheet.                                        |

> **Migration warning** — adding/removing/renaming persisted fields
> without a Zustand `version`/`migrate` step will silently leave
> existing clients with a stale shape. Either add a migration or
> bump the persist `name`.

---

## Phase → section layout

`app/components/section/PhaseSections.tsx` defines:

```ts
const PHASE_TAB_LAYOUT: Record<PhaseId, SectionId[]> = {
  preflight:       ['briefing', 'map', 'transitions', 'notams'],
  enroute:         ['briefing', 'map', 'transitions', 'notams'],
  transition:      ['briefing', 'map', 'transitions'],
  'ripon-to-fisk': ['briefing', 'map', 'transitions'],
  'at-fisk':       ['runway', 'briefing', 'map'],
  'inbound-runway':['runway', 'briefing', 'map'],
  ground:          ['runway', 'briefing', 'map'],
  depart:          ['runway', 'briefing', 'map']
}
```

In `in-flight` mode the `'map'` tab is filtered out (the map renders
inline beneath the hero). `defaultSectionForPhase(phaseId)` sets the
landing tab whenever the phase changes.

---

## NOTAM pipeline

```
GET /                         (browser)
  └─ Remix loader             (app/routes/_index.tsx)
       └─ getKoshNotams()     (app/.server/notamList.ts)
            └─ POST notams.aim.faa.gov/notamSearch/search
                 ├─ Forces IPv4-first DNS
                 ├─ Mozilla User-Agent (Akamai bot bypass)
                 ├─ AbortSignal.timeout(20s)
                 └─ application/x-www-form-urlencoded body
            └─ transformNotamList()
                 ├─ keywordToType()  → coarse bucket
                 ├─ parseFaaDate()   → ISO-8601 or 'PERM'
                 ├─ cleanMessage()   → strip inline HTML
                 └─ filter currently-active
       └─ json(result, { headers: { Cache-Control: 'no-store', … } })
  └─ <FiskApproachApp notamList=… fetchedAt=… source=… fetchError=… />
       ├─ getCriticalNotams() → CriticalNotamBanner (cap 3 + overflow)
       └─ PhaseSections
            └─ NotamSection
                 └─ NotamList (table + filters + Refresh)
```

### Priority categorisation
[`app/utils/notamFilters.ts`](../app/utils/notamFilters.ts) classifies
each NOTAM by **word-anchored** regex matches in
`CRITICAL_PATTERNS → HIGH_PATTERNS → MEDIUM_PATTERNS`, defaulting to
`low`. Substring matches are deliberately avoided so that benign
mentions of `'closed'` or `'runway'` don't promote routine
amendments to critical.

- `getCriticalNotams` — the only items the banner shows.
- `getImportantNotams` — `critical + high`, used for the tab badge.
- `sortNotamsByPriority` — used by `NotamList` when "Sort by priority" is on.

---

## Logging

Structured logs flow into PostHog Logs (OTLP) on both client and
server. The implementation lives in two small modules:

- [`app/lib/clientLogger.ts`](../app/lib/clientLogger.ts) wraps the
  `posthog.logger` API exposed by `posthog-js` ≥ 1.368. Used by
  `ErrorBoundary`, the service-worker registration in
  `routes/_index.tsx`, and the NOTAM Refresh button in `NotamList`.
- [`app/.server/logger.ts`](../app/.server/logger.ts) initialises a
  single OpenTelemetry `NodeSDK` on first import (idempotent,
  best-effort) and exposes
  `serverLogger.{debug,info,warn,error}`. Used today only by the FAA
  NOTAM fetch in `app/.server/notamList.ts` to record
  start / success / failure with `elapsedMs` and counts.

Configuration:
- Endpoint: `https://eu.i.posthog.com/i/v1/logs` (matches the EU
  client host).
- Token: `POSTHOG_PROJECT_KEY` env var, falling back to the public
  client token already shipped in the bundle.
- Resource attributes:
  - `service.name = oshkosh-approach-{web,server}`
  - `service.version = HEROKU_RELEASE_VERSION` (server) or `'dev'`
  - `deployment.environment = production | development`

Privacy decisions:
- We do **not** enable `posthog-js`'s `captureConsoleLogs`. Forwarding
  every `console.*` call from the app and its dependencies has too
  large a blast radius (tokens in stack traces, third-party noise).
- Logger calls do not write to the browser console.

The instrumentation today is intentionally narrow — see the verbosity
contract in [`AGENTS.md`](../AGENTS.md#verbosity-contract). High-frequency
domain transitions (phase / section changes, theme toggles, etc.)
belong in PostHog *events*, not logs.

## Service worker

[`public/service-worker.js`](../public/service-worker.js) v4.

- **Install** caches `STATIC_ASSETS = ['/', '/manifest.json',
  '/favicon.ico']`.
- **Activate** deletes cache entries that don't match the current
  `v\d+` cache names.
- **Fetch** for navigations: network-first with `cache: 'no-store'`.
  On success, replaces `'/__offline_fallback__'` with the fresh HTML.
  On failure, serves the stored fallback. Result: HTML (and the
  embedded SSR'd NOTAMs) is always fresh online.
- **Fetch** for assets: cache-first against `STATIC_CACHE_NAME` /
  `DYNAMIC_CACHE_NAME` for whitelisted domains
  (`tile.openstreetmap.org`, `fonts.googleapis.com`,
  `fonts.gstatic.com`).

> Bump every `v\d+` together when changing SW behaviour. Mixed cache
> versions across clients lead to "works on my machine" reports that
> are actually stale-asset reports.

---

## Geolocation and proximity utilities

`app/hooks/useGeolocation.ts` is opt-in: it only calls
`navigator.geolocation` when `gpsEnabled` is `true` in the store.
It writes back `currentLocation` (lat, lng, accuracy) and clears it
on opt-out.

`app/utils/geofencing.ts` provides distance and proximity calculations
from canonical waypoints. GPS is display-only: it never changes the
selected phase or issues operational prompts.

---

## Theming

DaisyUI themes in [`tailwind.config.ts`](../tailwind.config.ts):

- `chart` — light, warm. Default for `Plan` mode. Maps to sectional
  paper/ink/runway/grass tokens.
- `cockpit` — dark, instrument-readable. Default for `Flight` mode.
  Maps to `bg/panel/rail/accent/live/alert`.

Both themes are registered with DaisyUI plus the stock `light` /
`dark` themes (kept for fallback). The active theme attribute is
written to `<html data-theme="...">` from `AppShell` on mount and
on `theme` change.

Custom font sizes (`text-numeral-{lg,md,sm}`) and the `font-cockpit`
family give cockpit readouts the high-glance feel the chrome aims
for.

---

## Build & deploy

- **Build**: `remix vite:build` produces `build/client/` (static
  bundle) and `build/server/` (SSR bundle + handler).
- **Run**: `remix-serve ./build/server/index.js` (Procfile).
- **Heroku**: app `oshkosh-approach`, custom domain
  `www.oshkosh-approach.com`. The dashboard is configured to
  auto-deploy on push to `origin/master` on GitHub. There is **no**
  CI workflow file in this repo (intentional — the integration is
  managed in Heroku, not committed).
- **Node** ≥ 20.

There is no preview/staging environment. Validate locally
(`npm run build && npm run start`) before pushing.

---

## Things that look weird but are intentional

- **No tests script** in `package.json`. The pure-data invariants in
  `app/content/oshkosh/__tests__/invariants.test.ts` are kept as
  executable documentation; if a runner is added later, point it at
  that path.
- **Single `.server` module**. The Remix `.server` convention
  excludes the file from the client bundle. Don't import it from
  client components.
- **`v2/` directory absent**. The first-principles UX rebuild was
  staged in a temporary `app/components/v2/` and atomically flipped
  to the final paths. The directory was removed post-flip.
- **`docs/oshkosh-approach-refresh-plan.md`** is the historical
  pre-rebuild plan. Kept for context; the rebuild has shipped.
- **`plans/notam-rewire/`** captures the ACE-FCA artefacts (R1, P1,
  I1) for the FAA endpoint switch. Preserved as a worked example.
