# NOTAM LLM Translations - Implementation Plan

## Steps
1. Add server cache and OpenRouter translation modules.
2. Add a Remix `POST` resource route for translation requests.
3. Split NOTAM table rendering into row and text-box components.
4. Implement lazy loading, concurrency limiting, retry, timeout fallback, and raw/transformed toggle.
5. Validate with lint, typecheck, build, lints, and QA review.

## Files Touched
- `app/.server/notamTranslation.ts`
- `app/.server/notamTranslationCache.ts`
- `app/routes/api.translate-notam.ts`
- `app/components/notams/NotamList.tsx`
- `app/components/notams/NotamRow.tsx`
- `app/components/notams/NotamTextBox.tsx`
- `app/components/notams/types.ts`
- `app/components/FiskApproachApp.tsx`
- `app/components/section/PhaseSections.tsx`
- `app/components/section/sections/NotamSection.tsx`
- `plans/notam-llm-translations/*`

## Rollback
- Remove the translation route and server modules.
- Replace `NotamRow` usage in `NotamList` with the prior inline row rendering.
- Keep FAA NOTAM fetch untouched throughout rollback.
