# NOTAM LLM Translations - Implementation Instructions

## Environment
- `OPENROUTER_API_KEY`: server-only OpenRouter key.
- `OPENROUTER_NOTAM_MODEL_ID`: exact OpenRouter model ID.
- `OPENROUTER_NOTAM_TIMEOUT_MS`: optional timeout override, default 10000.
- `NOTAM_TRANSLATION_CACHE_DIR`: optional filesystem cache directory.
- `NOTAM_TRANSLATION_CACHE_MAX_AGE_MS`: optional cache age cap.
- `NOTAM_TRANSLATION_CACHE_MAX_FILES`: optional cache file count cap.

## Local Validation Commands
```sh
npm run lint
npm run typecheck
npm run build
```

## Manual QA
- Load the NOTAM tab and confirm raw text is visible before translations finish.
- Confirm translated availability appears without table overflow.
- Toggle AI explanation and raw text with mouse and keyboard.
- Simulate timeout or missing env vars and verify raw text remains visible.
- Revisit the same NOTAM and confirm cache-hit behavior is fast.
