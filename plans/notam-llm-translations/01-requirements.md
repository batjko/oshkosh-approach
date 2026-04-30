# NOTAM LLM Translations - Requirements

## Business Requirements
- Keep raw FAA NOTAM text visible and authoritative in the main NOTAM list.
- Add optional AI explanations that help pilots understand abbreviations, affected operations, and items to verify.
- Cache successful explanations server-side so repeat users on the same live server filesystem benefit from prior translations.
- Let users retry failed explanations and toggle between raw and AI-explained views.

## Acceptance Criteria
- Raw text renders immediately for every row.
- Translation requests are lazy and do not block the NOTAM list.
- Timeouts/errors leave raw text visible and expose a retry affordance.
- Completed translations are shown in a constrained, theme-aware row panel.
- OpenRouter model ID is configurable with `OPENROUTER_NOTAM_MODEL_ID`.
- Output is structured, quality-checked, and rendered by server code rather than trusting model-authored HTML.

## Constraints
- Do not alter FAA NOTAM fetching or cache fresh FAA responses.
- Do not modify procedural content in `app/content/oshkosh`.
- Do not log raw NOTAM text or AI output.
- Filesystem cache is not durable across Heroku dyno restarts or shared across multiple dynos.
