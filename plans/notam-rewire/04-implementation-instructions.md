# NOTAM rewire — implementation notes (I1)

## Source of truth
- Endpoint: `POST https://notams.aim.faa.gov/notamSearch/search`
  (`Content-Type: application/x-www-form-urlencoded; charset=UTF-8`)
- No API key. Public XHR powering the FAA NOTAM Search UI.

## Critical operational details discovered while building
1. **Akamai bot block on UA**. The endpoint silently hangs (no response, no 4xx)
   when the `User-Agent` looks non-browser (e.g. `OshkoshApproachCompanion/1.0`).
   Solution: present a standard Chrome UA string. Without it, fetch will time out.
2. **DNS happy-eyeballs**. Akamai resolves both A and AAAA. Some Node SSR
   contexts hang on the IPv6 candidate. We force IPv4-first via
   `dns.setDefaultResultOrder('ipv4first')` at module load.
3. **Mixed message format**. ~1 in 8 NOTAMs ship `plainLanguageMessage` as
   inline HTML (`<table>`, `<b>`, `<br>`). We strip tags + decode the
   handful of entities the FAA actually emits, falling back to
   `traditionalMessage` if stripping leaves <16 chars.
4. **Date format**. `MM/DD/YYYY HHmm` (Zulu) or the literal `'PERM'`.
   Parsed with a strict regex, defensive `Date()` fallback.

## Caching policy
- Loader: zero memoisation. Every page load hits FAA fresh.
- Document `Cache-Control: no-store, no-cache, must-revalidate` + `Pragma`
  + `Expires: 0` (`app/routes/_index.tsx`).
- Service worker (`public/service-worker.js`) caches v4. Navigation
  responses are no longer pinned per URL; we keep a single `/__offline_fallback__`
  blob that is overwritten on each successful fetch and only served when
  the network call fails.
- UI surfaces `Last queried <ISO>Z · FAA NOTAM Search (KOSH)` in the
  NOTAM panel header. Refresh button = full `window.location.reload()`.

## Files changed
- `app/.server/notamList.ts` (rewritten)
- `app/.server/notamSearch.types.ts` (new)
- `app/routes/_index.tsx` (loader + headers)
- `app/components/FiskApproachApp.tsx` (props chain)
- `app/components/section/PhaseSections.tsx` (props chain)
- `app/components/section/sections/NotamSection.tsx` (props pass-through)
- `app/components/notams/NotamList.tsx` (timestamp + refresh + error block)
- `public/service-worker.js` (v3 → v4, no-cache for navigations)

## Cleanup
- Deleted leftover `app/components/v2/` staging directory (atomic flip
  was completed earlier but the dir wasn't removed; nothing imported from it).
- Removed the hardcoded `client_id` / `client_secret` from `notamList.ts`
  (the new endpoint requires neither). The credentials remain in git
  history — recommend rotating with FAA support before public release.

## Out of scope / follow-ups
- Move to FAA NMS subscription when generally available.
- Persist a longer-lived offline NOTAM snapshot keyed by phase.
- Surface filtered-by-phase relevant NOTAMs into PhaseHero.
