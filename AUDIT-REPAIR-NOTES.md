# OctaNet rebuild — audit repair notes

## Changes in this package

- The neural-network holdout is now chronological (latest 20% of rows) rather than every fifth row.
- Competitor intelligence features used for training and evaluation are derived from training rows only; the evaluation outcomes are not used to derive those features.
- The corpus-evolution benchmark uses the same chronological split and does not derive validation features from the holdout labels.
- Deterministic simulated settlements are explicitly prefixed `SIMULATED:` and excluded from real performance metrics and adaptation.
- Gemini-generated settlement grades are prefixed `AI-UNVERIFIED:` and are not eligible for adaptation. Manual Won/Lost grading now asks for an official source URL; only records tagged `SOURCE-VERIFIED:` are eligible for real metrics and adaptation.
- Startup and newly created historical audit cards are no longer auto-settled with generated outcomes.
- The application no longer imports or generates demo fixtures at runtime. Schedule discovery now normalizes TheSportsDB event records only and keeps them separate from prediction inputs; no odds or rule scores are invented.
- Startup now uses an empty corpus and an explicitly UNTRAINED engine. Performance metrics and daily predictions are blocked until the active corpus is explicitly trained. CSV uploads are user-supplied and not automatically source-verified.
- AI API request bodies are size-limited and validated; a simple per-IP rate limit is included.

## Important remaining limitations

- TheSportsDB is a community-maintained schedule source, not an official league feed, and coverage is incomplete. The schedule endpoint provides event records only; the app still needs independently sourced form, standings, head-to-head, lineup/availability and other rule evidence before an event can be forecast. Gemini-assisted result research is not a verified results provider.
- The rate limiter is only a basic abuse guard and is not authentication. Before exposing the server publicly, add real authentication/authorization (and ideally provider-side fixture/result APIs). Do not treat this package as production-secure.
- The free TheSportsDB schedule-day endpoint returns only a small number of records per request (documented free limit: 3), so coverage is incomplete. Responses are cached by date and sport, but the in-memory cache resets if the server restarts.
- Synthetic row/fixture generators remain referenced by engine unit tests only; the app and training UI no longer import them. Do not use test fixtures to claim real predictive performance. Start evaluation with an independently sourced, dated historical dataset.
- The active corpus, hyperparameters and trained engine are stored in versioned browser local storage to survive refreshes on the same browser/device. This is not a durable server backup or cross-device sync. Export and separately back up genuine CSV data; storage errors are surfaced rather than silently reseeding the corpus.
- Cloud training rows are accepted only when marked source-verified, include a source URL, and pass strict field validation; missing/invalid fields are rejected rather than filled with invented defaults. This flag records a manual verification claim, not automated proof that the linked source is authentic.
- Accuracy and Brier scores are only meaningful when calculated on untouched, independently verified outcomes. A chronological split improves leakage control but does not make user-supplied data representative.

## Local checks

Run `npm install`, `npm run lint`, `npm test`, and `npm run build`. The `test` script uses Node's built-in test runner with TypeScript sources; if your Node/runtime cannot execute those imports directly, use the repository's TS runner (for example `npx tsx --test src/engine/engine.test.ts`).
