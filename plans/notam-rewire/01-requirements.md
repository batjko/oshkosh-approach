# NOTAM rewire — requirements (R1)

## Problem
- App's NOTAM source `https://external-api.faa.gov/notamapi/v1/notams` returns HTTP 404.
- FAA decommissioned the legacy endpoint as part of the NOTAM Management Service (NMS) cutover (changeover ~2026-04-18).
- Hardcoded `client_id` / `client_secret` are committed in `app/.server/notamList.ts:11-12`.
- UI silently shows zero NOTAMs to pilots.

## Constraints
- Must remain a static-friendly Remix loader (no enterprise FAA agreement / NMS subscription).
- Single-page PWA, must work without an API key the user has to manage.
- Aviation context: data shown is treated as authoritative when sourced from the official FAA system. No "advisory" disclaimer.

## Acceptance
- KOSH NOTAMs render in the `NOTAMs` tab on every page load.
- A "Last queried" timestamp is visible on the NOTAM panel and updates every reload.
- Reloading the page always refetches: no server-side cache, no SW cache for the NOTAM payload, no HTTP `Cache-Control` allowing stale.
- No client_id/client_secret literals remain in source.
- App still degrades gracefully if FAA is unreachable (shows last error + retry hint, but does not pretend NOTAMs don't exist).

## Source of truth
- `https://notams.aim.faa.gov/notamSearch/search` (FAA NOTAM Search XHR). Verified live and returning JSON `notamList[]` for `designatorsForLocation=KOSH`.
