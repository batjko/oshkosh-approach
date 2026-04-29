# NOTAM rewire — QA validation

## Automated
- [x] `npm run typecheck` — 0 errors.
- [x] `npm run lint` — 0 errors (1 pre-existing posthog warning, unrelated).
- [x] `npm run build` — client + SSR build pass.

## Network behaviour
- [x] `curl -i http://localhost:5173/` returns:
  - `cache-control: no-store, no-cache, must-revalidate, max-age=0`
  - `pragma: no-cache`
  - `expires: 0`
- [x] HTML payload contains live FAA NOTAM ids (`6/9161`, `VOR RWY`, etc.).
- [x] Loader fetch resolves in <2s when run live (vs. 20s timeout previously).
- [x] Reloading the page issues a fresh FAA fetch (verified in dev log).

## UI verification
- [x] NOTAMs tab badge shows count of critical NOTAMs (e.g. "NOTAMs 8").
- [x] NOTAM panel header shows `Last queried YYYY-MM-DD HH:MM:SSZ · FAA NOTAM Search (KOSH)`.
- [x] Refresh button reloads the page (bound to `window.location.reload()`).
- [x] HTML-bearing NOTAM bodies (`03/120`, `6/2542`) render as clean text.
- [x] Critical-NOTAM banner at top of shell lists active critical items
      (`6/9161, 6/9163, 6/8643, 03/120, 6/2542, 03/021, 04/014, 04/027`).
- [x] Each banner item is dismissible.

## Failure-path verification
- Endpoint blocked / Akamai 403: `error` field populated, UI shows the
  red alert block with the message + a link to
  `https://notams.aim.faa.gov/notamSearch/?icaoLocation=KOSH`.
- Timeout (20s): same handling.

## Outstanding caveats
- Hardcoded credentials persist in git history (see I1) — rotate before
  public release.
- FAA NOTAM Search XHR is undocumented; if the FAA flips schema or
  applies stricter bot detection, we'll need to revisit (likely move to
  the NMS-NDS enterprise feed).
