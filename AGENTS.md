# AGENTS.md

Phase-driven, source-backed Fisk VFR arrival companion for EAA AirVenture
Oshkosh. Tablet/mobile single-page Remix app with offline (PWA) support.

> **Pilot safety boundary**: this app is a procedural companion. The
> authoritative source is the FAA AirVenture Notice for the current year.
> Never modify procedural content (`app/content/oshkosh/*`) without
> citing the Notice section the change comes from.

---

## Quick Reference

```sh
npm run dev          # Vite dev server on :5173 (Remix HMR)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint . (cached)
npm run build        # Production build → build/{client,server}
npm run start        # Serve production build (remix-serve)
```

There is no test runner script. Pure-data invariant tests live at
`app/content/oshkosh/__tests__/invariants.test.ts` but are currently not
wired to a runner — treat them as executable documentation.

Deploy: Heroku auto-deploys on `git push origin master` (no `.github/`
workflows; the integration is configured in the Heroku dashboard).
Production: <https://www.oshkosh-approach.com/>.

---

## Working Agreements

### Code Philosophy
- Follow the functional paradigm; prefer pure functions and immutability where practical
- Prioritize testability, readability, and maintainability over cleverness
- Code must be documented, well-tested, and comprehensively typed (if the language supports it)

### Workflow Discipline
- Run relevant tests and linters after every round of changes before returning to the user
- After completing major functional changes, check if README or other docs need updates
- Follow instructions closely; get user approval before expanding scope
- When multiple valid approaches exist, present options and let the user decide

### Communication Style
- Be direct and factual; avoid unnecessary commentary, caveats, or disclaimers
- Use a casual, matter-of-fact tone—like colleagues collaborating
- Stay salient to the task at hand

---

## Project Structure

```
app/
  .server/                  # Server-only modules (Remix `.server` convention)
    notamList.ts            # FAA NOTAM Search fetch + transform
    notamSearch.types.ts    # Raw FAA response shape
    logger.ts               # OpenTelemetry NodeSDK → PostHog Logs (OTLP)
  content/oshkosh/          # Canonical procedural content (typed, immutable)
    types.ts                # Domain types: PhaseId, RunwayDefinition, etc.
    phases.ts               # 8 ordered phases (preflight → depart)
    runways.ts, transitions.ts, holds.ts, alternates.ts, signs.ts,
    waypoints.ts, frequencies.ts, profiles.ts, divert.ts, notice.ts,
    sources.ts              # Citations for every fact (FAA Notice §refs)
  components/
    shell/                  # AppShell, AppBar, StatusBar, CriticalNotamBanner
    phase/                  # PhaseSpine (chip nav), PhaseHero (current phase)
    section/                # SectionTabs, SectionPanel, PhaseSections
      sections/             # BriefingSection, MapSection, RunwaySection,
                            # NotamSection, TransitionsSection
    sheet/Sheet.tsx         # Native <dialog>-based sheet primitive
    sheets/                 # NoticeSheet, ProfileSheet, SignsSheet,
                            # AlternatesSheet, DivertSheet
    onboarding/             # 3-step first-launch wizard
    notams/NotamList.tsx    # Filtered/sorted NOTAM table
    runway/, transitions/, divert/, checklist/, sources/, map/, ui/
  hooks/useGeolocation.ts   # Opt-in GPS, store-driven
  lib/
    clientLogger.ts         # Wrapper over posthog.logger (PostHog Logs)
  utils/
    notamFilters.ts         # Priority categorisation (critical/high/medium/low)
    geofencing.ts           # Phase-named zones from canonical waypoints
    analytics.ts            # Typed PostHog wrapper + event catalog
  store/useAppStore.ts      # Zustand store (persist), single source of UI state
  routes/_index.tsx         # Single route. Loader fetches NOTAMs.
  root.tsx, provider.tsx, entry.{client,server}.tsx, tailwind.css
public/
  service-worker.js         # PWA SW (cache version: v4)
  manifest.json
plans/                      # Historical implementation plans (ACE-FCA)
docs/                       # Reference docs + this AGENTS.md
```

---

## Tech Stack

| Layer       | Choice                                                |
|-------------|-------------------------------------------------------|
| Framework   | Remix 2.10 (Vite 5 plugin)                            |
| Runtime     | Node ≥20, `remix-serve`                               |
| UI          | React 18, Tailwind 3 + DaisyUI 4 (themes: chart, cockpit) |
| State       | Zustand 5 with `persist` middleware                   |
| Map         | Leaflet 1.9 + react-leaflet 4 (lazy-loaded)           |
| Icons       | react-icons (Material Design)                         |
| Analytics   | PostHog (client + server logs via OpenTelemetry)      |
| Deploy      | Heroku (Procfile: `web: npm run start`)               |

TypeScript is strict. ESLint config: `.eslintrc.cjs` (typescript +
react-hooks + jsx-a11y + import). Standardjs spirit, ESLint rules
override.

---

## Architecture Overview

The app is a single-route SPA-style Remix app:

1. `app/routes/_index.tsx` is the only route. Its loader calls
   `getKoshNotams()` and returns `NotamFetchResult`. Loader sets
   `Cache-Control: no-store` so reloads always re-fetch FAA.
2. The route renders `FiskApproachApp`, which composes:
   - `AppShell` (chrome): `AppBar` → `StatusBar` → `CriticalNotamBanner`
     → `PhaseSpine` → `PhaseHero` → `<main>` slot.
   - `PhaseSections` inside the `<main>` slot: phase-aware tabs
     (briefing / map / transitions / notams / runway) bound to
     `PHASE_TAB_LAYOUT`.
   - Floating `DivertFab` and modal `*Sheet` primitives.
3. UI state is centralised in `useAppStore` (Zustand). Phase changes
   reset `activeSection` via `defaultSectionForPhase`.
4. Procedural content is pure data in `app/content/oshkosh/*` — never
   inline domain facts in components.

### Mental model
- **Phase = state**: 8 stable phase IDs drive what's on screen.
- **Section = view**: tabs change *what aspect* of the current phase
  the pilot sees; layout is `PHASE_TAB_LAYOUT[phaseId]`.
- **Sheet = modal detail**: long-form references (Notice, signs, etc.)
  live in sheets, not the main scroll.
- **Mode = chrome**: `pre-flight` (planning) vs `in-flight` (cockpit
  theme, larger numerals, inline map under hero, no map tab).

---

## Domain Vocabulary

| Term | Meaning |
|---|---|
| **Notice** / **AirVenture Notice** | The annual FAA pamphlet defining the Oshkosh VFR arrival. Authoritative. |
| **Fisk** | VFR reporting point ~5 NM SW of OSH where ATC assigns runways. |
| **Ripon** | VFR reporting point ~15 NM SW of OSH; entry to the conga line. |
| **Conga line** | The 90 KIAS / 1800 ft MSL single-file procession Ripon → Fisk. |
| **NORDO** | "No-radio" — distinct procedure for vintage radio-incapable aircraft. |
| **Conga line break-off** | Standard divert: return to transition starting point. |
| **PERM (NOTAM)** | NOTAM with no end date — permanent change. |
| **Mass arrival** | Pre-organised type-club arrival (Bonanza, RV, etc.). |
| **OBST** | Obstruction NOTAM (typically tower lights). Almost never critical. |
| **Phase** | One of 8 stable IDs: preflight, enroute, transition, ripon-to-fisk, at-fisk, inbound-runway, ground, depart. |

---

## Conventions

### Naming & files
- Components: `PascalCase.tsx`, one component per file (default + named exports both work; current code prefers named).
- Hooks: `useXxx.ts` in `app/hooks/`.
- Store: single `useAppStore` (Zustand). Add new state via the existing `AppState` interface; export typed selectors when re-used.
- Server-only code goes in `app/.server/*` (Remix excludes it from the client bundle).
- Procedural content lives **only** in `app/content/oshkosh/*`. UI components consume it via the typed exports from `~/content/oshkosh`.

### Imports
- Use the `~` alias for `app/` (configured via `vite-tsconfig-paths`).
- Group order: external → `~/...` → relative.
- Don't import from `app/.server/*` in client components — Remix will throw.

### Styling
- Tailwind utilities + DaisyUI components. Custom tokens defined in `tailwind.config.ts`:
  - Themes: `chart` (warm sectional, daylight) and `cockpit` (dark, instrument-readable).
  - Colors: `chart.{paper,ink,muted,warn,danger,grass,runway}`, `cockpit.{bg,panel,rail,accent,live,alert}`.
  - Numerals: `font-cockpit` (JetBrains Mono) + `text-numeral-{lg,md,sm}` for cockpit readouts.
- Shell containers use `max-w-screen-xl` (1280px) for tablet comfort. Don't narrow them without reason.
- Keep components ≤300 LoC; split when they grow. Prefer early returns.

### Typing
- Strict TS. No `any` in public APIs (lint enforces). Use `NotamLike`-style narrow constraints when accepting heterogeneous shapes.
- Domain types live in `app/content/oshkosh/types.ts` — reuse, don't redeclare.

### State (Zustand)
- Persisted: `currentPhase, mode, theme, enableMap, noticeYearAcknowledged, aircraftProfileId, aircraftIdentity, assignedRunwayId, gpsEnabled, onboardingComplete`.
- Session-only: `currentLocation, activeSection, openSheet`.
- Phase changes go through `setCurrentPhase / nextPhase / prevPhase` so `activeSection` is recomputed via `defaultSectionForPhase`.

---

## NOTAM Pipeline (read this before touching it)

Source: **public** FAA NOTAM Search XHR endpoint
`POST https://notams.aim.faa.gov/notamSearch/search`. No API key. The
older `external-api.faa.gov/notamapi/v1/notams` endpoint is decommissioned.

`app/.server/notamList.ts` does the work:
1. Forces IPv4-first DNS (`dns.setDefaultResultOrder('ipv4first')`) — the FAA Akamai edge resolves both A and AAAA, and Node SSR sometimes hangs on v6.
2. Sends a real-browser `User-Agent` header — Akamai's bot detection blocks the default Node UA.
3. Parses dates as either `MM/DD/YYYY HHmm` (Zulu) or the literal `'PERM'`.
4. Strips inline HTML from `plainLanguageMessage` (FAA embeds `<table>`, `<br>`, etc.) via `cleanMessage`.
5. Returns `{ notamList, fetchedAt, source, error? }`. The route loader sets `Cache-Control: no-store` so every reload re-fetches.

### Priority categorisation (`app/utils/notamFilters.ts`)
Word-anchored regex match, in order:

| Level    | Match scope                                                                  |
|----------|------------------------------------------------------------------------------|
| critical | `RWY N CLOSED`, `ARPT CLSD`, `TFR`, `IFR ONLY`, `VFR PROHIBITED`, `EMERGENCY` |
| high     | `FISK`, `RIPON`, `AIRVENTURE`, frequency changes, `NORDO`, `WAIVER`           |
| medium   | `IAP`, `ILS`, `VOR RWY`, `RNAV`, `MINIMUMS`, `MDA`, `NAVAID`, `DME`, `SID/STAR` |
| low      | everything else (typically distant `OBST TOWER LGT`)                          |

- `getCriticalNotams` → only `critical`. Used by `CriticalNotamBanner`.
- `getImportantNotams` → `critical + high`. Used by the NOTAMs tab badge.
- Banner caps at 3 visible items + overflow link to the NOTAMs tab.

**Don't broaden the patterns.** Substring matches (`'closed'`, `'runway'`) cause every routine IAP amendment to light up the banner.

---

## Logging

Structured logs flow into [PostHog Logs](https://posthog.com/docs/logs)
on both sides. Project token defaults to the public client token; the
server can override via `POSTHOG_PROJECT_KEY` env var.

### Client (`app/lib/clientLogger.ts`)
Wraps `posthog.logger` (posthog-js ≥ 1.368). Use it for app-level
events that benefit from structured attributes:

```ts
import { clientLogger } from '~/lib/clientLogger'
clientLogger.info('sw.registered', { scope: reg.scope })
clientLogger.error('client.errorBoundary', { message, stack })
```

- PostHog is initialised in `app/utils/analytics.ts` (called from `app/provider.tsx` after hydration). Defaults: `defaults: '2026-01-30'`, `person_profiles: 'identified_only'`, `capture_pageview: 'history_change'`, `capture_pageleave: 'if_capture_pageview'`.
- We intentionally **do not** enable `captureConsoleLogs` — PostHog's docs flag it as a privacy/blast-radius risk; everything from third-party libs would leak.
- Logger calls don't write to the browser console. If you want both, log explicitly to console as well.

### Server (`app/.server/logger.ts`)
Boots a single OpenTelemetry `NodeSDK` on first import and exposes a
small typed API (`serverLogger.{debug,info,warn,error}`):

```ts
import { serverLogger } from '~/.server/logger'
serverLogger.info('notam.fetch.success', { icao, count, elapsedMs })
```

- Endpoint: `https://eu.i.posthog.com/i/v1/logs` (matches the EU client host).
- Resource attributes: `service.name=oshkosh-approach-server`, `service.version` from `HEROKU_RELEASE_VERSION`, `deployment.environment` from `NODE_ENV`.
- Init is idempotent and best-effort; if it fails the API degrades to `console.*` so the app never crashes because of telemetry.
- Don't import `~/.server/logger` from client components — Remix will throw.

### Verbosity contract

Keep volume low. Today we log:

| Side   | Event                          | Level | Attributes                          |
|--------|--------------------------------|-------|-------------------------------------|
| server | `notam.fetch.start`            | info  | `icao`                              |
| server | `notam.fetch.success`          | info  | `icao, count, rawCount, elapsedMs`  |
| server | `notam.fetch.failed`           | error | `icao, error, elapsedMs`            |
| client | `client.booted`                | info  | `service, environment, userAgent`   |
| client | `sw.registered`                | info  | `scope, updateViaCache`             |
| client | `sw.registration.failed`       | error | `message`                           |
| client | `client.errorBoundary`         | error | `message, stack, componentStack`    |
| client | `notam.refresh.click`          | info  | `currentCount`                      |

Do NOT log on every phase change, every render, every store mutation,
or any path that fires per-frame or per-keystroke. Phase/section
changes belong in PostHog *events* (analytics), not logs.

## Service Worker

`public/service-worker.js` (cache version `v4`).

- Navigation requests: `fetch(request, { cache: 'no-store' })`. Only the offline fallback HTML is cached, replaced on each successful navigation. This guarantees fresh SSR (and fresh NOTAMs) on every page load.
- Static assets: cache-first against `STATIC_CACHE_NAME` / `DYNAMIC_CACHE_NAME`.
- **Bump every `v\d+` in this file together** when changing SW behaviour, or clients get stuck with a stale mix of caches.

---

## Boundaries

### Always do (without asking)
- Read files, run `npm run lint`, `npm run typecheck`, `npm run build` after edits.
- Fix obvious typos and inline-comment fixes.
- Update `app/content/oshkosh/sources.ts` when you cite a new Notice ref.

### Ask first
- Adding or upgrading dependencies (especially Remix, React, Zustand majors).
- Changing the FAA NOTAM endpoint, request shape, headers, or DNS settings.
- Modifying `service-worker.js` (cache busting affects every existing client).
- Bumping or restructuring `app/content/oshkosh/*` content. Always cite a source.
- Changing the persisted shape of `useAppStore` (will silently break existing localStorage state — needs a migration).
- Anything in `Procfile`, `package.json` engines, or deploy config.
- Enabling `captureConsoleLogs` for posthog-js (privacy / blast-radius risk).
- Adding new log call sites in hot paths (every render / phase change / key-stroke). Logs are structured analytics, not `printf`.

### Never do (refuse or flag)
- Modify secrets, tokens, or `.env` files.
- Push directly to `master` or to `heroku` without explicit user instruction.
- Hardcode API keys (the old FAA `client_id`/`client_secret` were removed — do not reintroduce).
- Inline procedural facts (frequencies, altitudes, runway diagrams) into components — they belong in `app/content/oshkosh/*`.
- Cache the FAA NOTAM response in-process or in the SW. NOTAMs are authoritative and must be fresh on every reload.
- Treat substring `'closed'` / `'runway'` as critical NOTAM signals (regression of the priority logic).
- Introduce IPv6-first DNS, custom `User-Agent`, or a long client-side timeout that bypasses the loader's `AbortSignal.timeout(20s)`.

---

## Gotchas

- **`@remix-run/react` `<MetaFunction>` is per-route**: the route in this repo defines its own; root sets the layout shell.
- **`activeSection` is not persisted** by design — phase changes reset it via `defaultSectionForPhase`. Persisting it would strand pilots on a stale tab after a reload mid-flight.
- **`max-w-screen-md` was the old shell width** (768 px). All shell containers now use `max-w-screen-xl` (1280 px). Don't accidentally re-narrow them in new components.
- **In-flight mode hides the `map` section tab** because the map is rendered inline beneath the PhaseHero. Tab IDs come from `PHASE_TAB_LAYOUT[phaseId]` minus `'map'` when `mode === 'in-flight'`.
- **Geolocation is opt-in**: `useGeolocation` only requests permission when `gpsEnabled` is `true` in the store. Don't call `navigator.geolocation` from anywhere else.
- **Service worker can serve stale JS in dev** if it was registered before a code change. If something looks wrong in the browser but not in `curl` of the SSR HTML, hard-reload (Cmd-Shift-R) or unregister the SW once.
- **Heroku auto-deploys** on `git push origin master`. There is no preview environment. Validate locally first.
- **PostHog is initialised in `app/utils/analytics.ts` via `app/provider.tsx`** — `entry.client.tsx` is a vanilla Remix hydration entry. Project key/host default to hardcoded EU values but are overridable via `VITE_PUBLIC_POSTHOG_TOKEN` / `VITE_PUBLIC_POSTHOG_HOST`. Init is post-hydration to avoid SSR mismatches; `<PostHogProvider>` wraps from first paint so the subtree is not remounted.
- **App analytics events live in `app/utils/analytics.ts` (`AppEventMap` / `trackAppEvent`)**. Capture is mostly centralised inside `useAppStore` actions (phase, mode, sheet, GPS, theme, profile, runway, onboarding, section). NOTAM totals are summarised by priority via `countNotamsByPriority` — never send raw NOTAM text. Do not capture geolocation, aircraft identity, or call sign.
- **The 2026 FAA Notice publishes mid-May 2026**. Until then, `app/content/oshkosh/notice.ts` runs in `'baseline'` mode using the 2025 Notice. Flip to `'released'` only after a full content review against the 2026 Notice.

---

## When Stuck

- Ask a clarifying question rather than guessing
- Propose 2-3 options with tradeoffs and let the user choose
- For large changes, outline a plan before implementing
- If something seems wrong in the codebase, flag it rather than silently "fixing" it
- For procedural content (anything in `app/content/oshkosh/*`), cite the FAA Notice section before changing it. If you can't, stop and ask.
