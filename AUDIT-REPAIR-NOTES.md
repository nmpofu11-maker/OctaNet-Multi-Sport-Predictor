# OctaNet rebuild — audit repair notes

## Changes in this package

- The neural-network holdout is now chronological (latest 20% of rows) rather than every fifth row.
- Competitor intelligence features used for training and evaluation are derived from training rows only; the evaluation outcomes are not used to derive those features.
- The corpus-evolution benchmark uses the same chronological split and does not derive validation features from the holdout labels.
- Deterministic simulated settlements are explicitly prefixed `SIMULATED:` and excluded from real performance metrics and adaptation.
- Gemini-generated settlement grades are prefixed `AI-UNVERIFIED:` and are not eligible for adaptation. Manual Won/Lost grading now asks for an official source URL; only records tagged `SOURCE-VERIFIED:` are eligible for real metrics and adaptation.
- Startup and newly created historical audit cards are no longer auto-settled with generated outcomes.
- When AI-search candidates are synced for a sport/date, that sport's generated demo fixtures are removed from the ranking pool rather than blended with them. Existing AI-search candidates are replaced per sport to avoid accumulating duplicates.
- The UI now warns that generated data, AI-grounded candidates, and estimated odds are not independently verified real-world evidence.
- AI API request bodies are size-limited and validated; a simple per-IP rate limit is included.

## Important remaining limitations

- The Gemini Google Search workflow is not a verified fixture/results provider. Grounding sources are surfaced, but this app does not independently confirm event IDs, scores, market settlement, or live executable bookmaker odds. Treat these results as unverified until checked against trusted sources.
- The rate limiter is only a basic abuse guard and is not authentication. Before exposing the server publicly, add real authentication/authorization (and ideally provider-side fixture/result APIs). Do not treat this package as production-secure.
- Existing seeded historical rows remain synthetic. They are useful for UI/demo testing only and must not be used to claim real predictive performance. Start evaluation with an independently sourced, dated historical dataset.
- The browser's training state is not yet a complete durable model checkpoint. Export/back up any genuine CSV corpus before changing versions; do not assume weights or the full uploaded corpus are restored from Firebase.
- Accuracy and Brier scores are only meaningful when calculated on untouched, independently verified outcomes. A chronological split improves leakage control but does not make synthetic data representative.

## Local checks

Run `npm install`, `npm run lint`, `npm test`, and `npm run build`. The `test` script uses Node's built-in test runner with TypeScript sources; if your Node/runtime cannot execute those imports directly, use the repository's TS runner (for example `npx tsx --test src/engine/engine.test.ts`).
