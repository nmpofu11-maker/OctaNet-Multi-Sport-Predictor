# OctaNet Multi-Sport Predictor

A React + TypeScript prototype for six-sport rule scoring, an MLP model, fixture review, and an audit workflow. This repository is an audit-repaired prototype, **not a validated betting product**.

## Quick start

Requirements: Node.js 22 or a compatible supported runtime.

```bash
npm install
cp .env.example .env
# Set GEMINI_API_KEY in .env only if you want to use Gemini-assisted search.
npm run dev
```

Open `http://localhost:3000`. If that port is already occupied, change `PORT` in `server.ts` to an unused port. Never commit `.env` or API keys.

## Available commands

```bash
npm run lint
npm test
npm run build
```

`npm test` runs the engine unit tests. Firestore rules still require separate validation with the Firebase Rules emulator and actual authenticated test identities.

## Data and model safeguards

- The seeded historical corpus and generated fixture pool are synthetic demo data. They must not be described as real historical performance or live fixtures.
- When AI-search candidates are loaded for a sport/date, generated demo fixtures for that sport/date are removed from that ranking pool. AI-generated candidates and odds remain unverified.
- Search-grounded result grades are labelled `AI-UNVERIFIED:` and do not count as real settled results or enter model adaptation.
- Simulated results are labelled `SIMULATED:` and do not count as real performance or enter model adaptation.
- Manual settlement asks for an official result source URL. Only entries labelled `SOURCE-VERIFIED:` are eligible for the audit metrics and training-adaptation path. Verify the event identity, market rules, final outcome, and source yourself.
- Model evaluation uses a chronological latest-20% holdout. Competitor coefficients used to build training/evaluation features are derived from training rows only. This improves leakage control but does not turn synthetic or biased source data into valid evidence.

## Security and deployment limitations

The API includes payload validation, a body-size limit, and a basic per-IP rate limiter. **The API does not yet implement full authentication/authorization. Do not expose this server publicly or assume the rate limiter is a security boundary.** Add proper authentication, authorization, provider quota controls, and production deployment checks before public use.

The Gemini Search workflow is not a sports data provider. It does not independently verify event IDs, live executable odds, competition coverage, or market-specific settlement. Use a trusted sports-data/results source for any serious evaluation.

The app does not yet persist a complete model checkpoint and full training corpus as a durable, versioned artifact. Back up any genuine CSV corpus before changing versions. Do not assume browser memory or Firebase audit records restore the entire model state.

See [`AUDIT-REPAIR-NOTES.md`](./AUDIT-REPAIR-NOTES.md) for a summary of the changes and remaining limitations.
