# NOTAM rewire — solution design

## Where logic lives today
- Fetch + transform: `app/.server/notamList.ts:1-94`
- Loader: `app/routes/_index.tsx:10-13`
- UI: `app/components/notams/NotamList.tsx`, wrapped by `app/components/section/sections/NotamSection.tsx`
- Filters / priority: `app/utils/notamFilters.ts`
- Service worker: `public/service-worker.js` (currently does NOT touch this data because it's SSR'd into the document).

## New target source
- POST `https://notams.aim.faa.gov/notamSearch/search`
- `application/x-www-form-urlencoded`
- Required params (verified): `designatorsForLocation=KOSH`, `radius=10`, `offset=0`, plus the rest of the form's defaults (lat/long zeros, `flightPathBuffer=4`, etc.).
- Response: `{ notamList: RawNotam[] }`.

## RawNotam shape (relevant fields)
- `notamNumber` (e.g. `6/9161`)
- `facilityDesignator` (`OSH`), `icaoId` (`KOSH`)
- `issueDate`, `startDate`, `endDate` — strings: `MM/DD/YYYY HHmm` or `PERM`
- `keyword` (e.g. `IAP`, `RWY`, `OBST`, `AD`, `NAV`) → maps to our existing `type` taxonomy
- `plainLanguageMessage` — preferred user-facing text
- `traditionalMessage` — fallback
- `status` (`Active` / `Cancelled`)

## Mapping to `TransformedNotam`
- `id` ← `notamNumber`
- `number` ← `notamNumber`
- `type` ← bucketed from `keyword` ('Airport' | 'Runway' | 'Airspace' | 'Navigation' | 'Other')
- `text` ← `plainLanguageMessage` || `traditionalMessage`
- `effectiveStart` ← parsed from `startDate` (kept as ISO string)
- `effectiveEnd` ← parsed from `endDate`, `'PERM'` → `'PERM'` literal
- Filter rule: keep if `status === 'Active'` AND (effectiveEnd === 'PERM' OR end >= now) AND (start <= now).

## Caching policy
- Loader: zero in-process cache. Each call hits FAA fresh.
- HTTP response: `Cache-Control: no-store` on the document so browsers and intermediaries do not reuse it.
- Service worker: navigation handler currently does `cache.put(request, response)` for every 200 (`public/service-worker.js:73-77`). Change to **not** cache navigation responses (only fall back to a stale snapshot when offline). NOTAMs travel inside the navigation document, so this also covers them.
- Add a `fetchedAt: ISOString` to the loader payload and surface it in the UI.

## Secrets
- Remove the hardcoded `client_id` / `client_secret` (the new endpoint requires neither).
- Keep `.env` usage for any future enterprise key.
- Recommend rotating the leaked credentials with FAA support after merge.

## Risks
- FAA's search endpoint is undocumented / could change. Mitigation: typed parser, defensive fallback to `traditionalMessage`, error surfaces in UI not silently empty.
- Some NOTAMs have `endDate: 'PERM'`; date filter must handle the literal.
- Origin / referer headers might be required to avoid WAF block. Mitigation: send `User-Agent`, `Origin`, `Referer` like a browser. (Verified working in this session.)

## Out of scope
- NMS enterprise subscription.
- Persisted offline NOTAM snapshot beyond the SW HTML fallback.
