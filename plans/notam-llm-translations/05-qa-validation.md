# NOTAM LLM Translations - QA Validation

## Automated Checks
- Passed: `npm run typecheck`
- Passed: `npm run lint`
  - Existing warnings remain in `app/lib/clientLogger.ts`, `app/provider.tsx`, and `app/utils/analytics.ts` for `import/no-named-as-default`.
- Passed: `npm run build`

## Focus Areas
- Table row stability at narrow and tablet widths.
- Raw FAA text remains default and authoritative.
- AI explanation uses app-rendered escaped HTML only.
- Timeout, invalid, missing-config, and OpenRouter error states fail soft.
- Cache key changes when NOTAM text, model ID, or prompt schema version changes.
- Duplicate visible rows do not trigger duplicate OpenRouter calls for the same key.

## Evidence
- Raw NOTAM rendering remains the default row content.
- AI explanations are fetched through a non-blocking resource route.
- Server accepts text-only structured output and renders escaped HTML itself.
- Timeout/error/invalid/unavailable responses leave raw text visible.
- Filesystem cache is keyed by NOTAM identity, raw text, model ID, and prompt schema version.
- Translation requests include a server-signed token emitted with the loader payload, limiting the endpoint to current server-rendered NOTAM payloads.
- Endpoint adds same-origin checks, lightweight rate limiting, expired bucket eviction, and `Retry-After` feedback for rate-limited clients.
- QA review found no blocking or high-severity issues after the signed-token/rate-limit/keying fixes.
- Browser smoke check was limited by a stale service-worker-controlled tab; a fresh dev server was started, but the existing browser tab continued to show cached assets. Automated build/type/lint validation passed.
