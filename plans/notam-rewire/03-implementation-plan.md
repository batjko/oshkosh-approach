# NOTAM rewire — implementation plan (P1)

## Files to touch
1. `app/.server/notamList.ts` — full rewrite to POST notamSearch, parse, normalise, no secrets.
2. `app/.server/notamSearch.types.ts` — new file, raw FAA shape.
3. `app/routes/_index.tsx` — loader returns `{ notamList, fetchedAt, source }`, sets `Cache-Control: no-store`.
4. `app/components/FiskApproachApp.tsx` — pass `fetchedAt` prop down.
5. `app/components/section/PhaseSections.tsx` — forward `fetchedAt`.
6. `app/components/section/sections/NotamSection.tsx` — accept `fetchedAt`, show it.
7. `app/components/notams/NotamList.tsx` — display "Last queried HH:MM:SS UTC" + a manual reload link.
8. `public/service-worker.js` — stop caching navigation responses; only serve cached HTML when fetch fails (offline fallback). Bump cache name → v4.

## Tests / verification
- Manual: `curl http://localhost:5173/` shows `Cache-Control: no-store` header and HTML containing the FAA NOTAM ids retrieved live.
- UI: NOTAMs tab shows non-zero list and a `Last queried` timestamp that updates on every reload.
- Network tab: navigation response not served from disk/SW cache after first load.
- Type check, lint, build.

## Risk / rollback
- If the FAA NOTAM Search endpoint is blocked from production hosting (Vercel egress), wrap fetch in try/catch and surface a clear error in the UI; no fallback data masquerading as live.
- Rollback: revert these specific files; the ENV-only fallback was already broken so reverting changes nothing user-facing.

## Steps (in order)
1. Add `notamSearch.types.ts`.
2. Rewrite `notamList.ts` to call the new endpoint, normalise, return list + `fetchedAt`.
3. Update loader + `_index` headers; thread `fetchedAt` through props.
4. Update `NotamSection` + `NotamList` UI for timestamp.
5. Update SW: drop nav cache write, add v4 cache names.
6. Typecheck, lint, build, browser smoke test.
7. Update `04-implementation-instructions.md` + `05-qa-validation.md`.
