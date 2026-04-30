# PWA Compliance - QA Validation

QA artifact for the Progressive Web App compliance work that followed
the SEO/AI discoverability change. Captures the additions, the
verification evidence, and the regression checks against the existing
single-route Remix app.

---

## Scope

- Bring the app to a fully installable, Lighthouse-grade PWA without
  changing functional behaviour, the loader, the store, the SSR head
  contract, or `app/content/oshkosh/*` procedural content.
- Add a deliberate user-initiated install entry point (rather than
  relying solely on the browser's automatic banner).
- Pre-cache the PWA icon set so a freshly-installed home-screen launch
  renders correctly even if the first launch is offline.

## Files added

| Path | Purpose |
|---|---|
| `app/hooks/usePwaInstall.ts` | Captures `beforeinstallprompt`, exposes `canInstall` + `promptInstall()`, detects standalone display mode, emits typed analytics for prompt outcome and `appinstalled` events. |

## Files modified

| Path | Change |
|---|---|
| `public/manifest.json` | Added `id`, `display_override`, `prefer_related_applications: false`, `launch_handler` (`navigate-existing`, `auto`). Tightened `start_url` to mark PWA-origin traffic. |
| `public/service-worker.js` | Bumped cache version `v4` -> `v5` (atomic, all three caches). Pre-cache list expanded to include `/favicon.svg`, `/apple-touch-icon.png`, `/icons/icon-192.png`, `/icons/icon-512.png`, `/browserconfig.xml` so the icon set is available offline immediately after install. |
| `app/components/shell/AppBar.tsx` | Added an `Install app` entry at the top of the existing overflow menu, conditionally rendered when `canInstall === true`. |
| `app/utils/analytics.ts` | Added `'pwa install prompted'` and `'pwa installed'` typed events to `AppEventMap`. |

## PWA installability matrix

| Requirement | Status | Evidence |
|---|---|---|
| Served over HTTPS in production | ✓ | `https://www.oshkosh-approach.com` |
| Web App Manifest linked from `<head>` | ✓ | `<link rel="manifest" href="/manifest.json">` in `app/root.tsx`. |
| Manifest has `name` / `short_name` | ✓ | `Oshkosh Approach - Fisk VFR arrival companion` / `Oshkosh Approach`. |
| Manifest has `start_url`, `scope` | ✓ | `start_url: "/?source=pwa"`, `scope: "/"`. |
| Manifest has `display: standalone` (or fullscreen / minimal-ui) | ✓ | `display: standalone`, with `display_override: ["standalone", "minimal-ui", "browser"]`. |
| Manifest has `theme_color` and `background_color` | ✓ | Primary `#1f4e8c` and chart paper `#f5efe1`. |
| Manifest icons include 192px and 512px PNG | ✓ | `/icons/icon-192.png` (192x192), `/icons/icon-512.png` (512x512). |
| Manifest icon with `purpose: maskable` | ✓ | `/icons/icon-512.png` declared `purpose: "any maskable"`. |
| Stable PWA `id` for identity continuity | ✓ | `id: "/?source=pwa"`. |
| Service worker registered with `fetch` handler | ✓ | `public/service-worker.js` has `install`, `activate`, and `fetch` listeners; registration in `app/routes/_index.tsx`. |
| Offline fallback for navigation requests | ✓ | SW caches a single offline HTML at `/__offline_fallback__` and serves it on network error. |
| iOS - `apple-mobile-web-app-capable` | ✓ | Set in `app/routes/_index.tsx` meta. |
| iOS - `apple-mobile-web-app-title` | ✓ | `Oshkosh Approach`. |
| iOS - `apple-mobile-web-app-status-bar-style` | ✓ | `default`. |
| iOS - `apple-touch-icon` 180x180 | ✓ | `<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">`. |
| Android - `mobile-web-app-capable` | ✓ | Meta set. |
| Viewport with safe-area handling | ✓ | `width=device-width, initial-scale=1, viewport-fit=cover`. |
| Windows tile metadata | ✓ | `msapplication-TileColor`, `msapplication-config`, `browserconfig.xml`. |
| Color-scheme hint | ✓ | `<meta name="color-scheme" content="light dark">`. |
| User-initiated install affordance | ✓ | `Install app` overflow-menu entry, surfaced only when the browser has fired `beforeinstallprompt`. |

## Verification commands

Run from a production build started with `PORT=5191 npm run start`:

```sh
curl -s http://localhost:5191/manifest.json | python3 -m json.tool
curl -s http://localhost:5191/service-worker.js | head -16
curl -sI http://localhost:5191/ | grep -i cache-control
curl -s http://localhost:5191/ | grep -oE '<(link[^>]*manifest|meta[^>]*apple-mobile-web-app|meta[^>]*viewport|meta[^>]*theme-color)[^>]*>'
```

Expected results (verified):

- Manifest returns 200 / `application/json` with all PWA spec fields.
- Service worker file declares `eaa-approach-v5` cache names and the
  expanded `STATIC_ASSETS` list.
- `Cache-Control: no-store` preserved on `/` -> NOTAM freshness intact.
- Document `<head>` contains `link[rel=manifest]`, `apple-mobile-web-app-*` meta, viewport meta with `viewport-fit=cover`, and theme-color.

## Lighthouse-style PWA audit (manual)

| Lighthouse PWA criterion | Status |
|---|---|
| Installable: web app manifest meets install criteria | Pass. |
| Installable: registers a service worker that controls page and `start_url` | Pass. |
| PWA Optimized: configured for a custom splash screen | Pass (`name`, 512px PNG, `background_color`, `theme_color` all present). |
| PWA Optimized: sets a theme color for the address bar | Pass. |
| PWA Optimized: content is sized correctly for the viewport | Pass (`viewport` meta + responsive Tailwind layout, no horizontal scroll on shell containers). |
| PWA Optimized: has a `<meta name="viewport">` tag with `width` or `initial-scale` | Pass. |
| PWA Optimized: provides a valid `apple-touch-icon` | Pass (180x180). |
| PWA Optimized: manifest has a maskable icon | Pass. |

## Functional regression checks

| Concern | Check | Result |
|---|---|---|
| NOTAM freshness | `curl -I /` returns `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`. | Preserved. |
| Loader behaviour | `app/routes/_index.tsx` loader untouched - still calls `getKoshNotams()` and returns the same shape with no-store headers. | Preserved. |
| FAA endpoint contract | `app/.server/notamList.ts` not modified by this work. | Preserved. |
| Service-worker semantics | Strategy unchanged: navigation = network-first with offline HTML fallback; static assets = cache-first; external map tiles = stale-while-revalidate. Only the cache version key and the static asset list changed (additive). | Preserved. |
| Existing client SW | Cache version bump from v4 -> v5 will purge the old caches on activate (existing behaviour - documented in AGENTS.md as intentional). All three cache name constants bumped together as required. | Aligned with contract. |
| Zustand store | `useAppStore.ts` not modified. Persisted shape unchanged (still `oshkosh-app-storage-v2`, same partialize keys). | Preserved. |
| AppBar interactions | Existing menu items (theme toggle, map toggle, parking signs, alternates, divert briefing, reset onboarding) unchanged in order and behaviour. The new `Install app` entry is conditional and additive. | Preserved. |
| Analytics catalog | Two new typed events added (`pwa install prompted`, `pwa installed`) - additive only, existing events unchanged. | Preserved. |
| Procedural content | No edits in `app/content/oshkosh/*`. | Preserved. |
| FiskApproachApp props / children tree | Not modified. | Preserved. |
| Service worker registration | Still registered in `app/routes/_index.tsx` `useEffect` after hydration. | Preserved. |
| SSR safety of new hook | `usePwaInstall` initialises with `typeof window === 'undefined'` guard; deferred state starts `null` on both server and client; no hydration mismatch surface introduced. | Verified. |
| Privacy guardrails | The hook never logs raw GPS, aircraft identity, or NOTAM text. The `pwa install prompted` event captures only `surface` and `outcome`. | Preserved. |
| Dependency surface | `package.json` and `package-lock.json` not changed. | Preserved. |

## Tooling

- `npm run lint` - 0 errors (3 pre-existing posthog warnings unrelated).
- `npm run typecheck` - clean.
- `npm run build` - clean.

## Known pre-existing issue (out of scope)

The `OfflineIndicator` and a date-formatting site in `StatusBar` cause
React hydration warnings on first paint (visible as React #418/#425/#423 in
the production console). These warnings reproduce on `master` before
this work and are not introduced or affected by the PWA changes.
Flagged here for later remediation; not a blocker for installability.

## Open follow-ups (not part of this change)

- Add `screenshots` to the manifest for richer install promotions on
  Android (Lighthouse "PWA Optimized" extra).
- Add `shortcuts` to the manifest once the app supports query/hash
  deep-linking into specific sheets or sections.
- Resolve the pre-existing hydration warnings in `OfflineIndicator`
  and `StatusBar`.
