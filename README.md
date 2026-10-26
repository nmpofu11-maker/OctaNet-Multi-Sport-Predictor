# OctaNet Multi-Sport Predictor

A React + TypeScript prototype for six-sport rule scoring, an MLP model, fixture review, and an audit workflow. This repository is an audit-repaired prototype, **not a validated betting product**.

## Quick start

Requirements: Node.js 22 or a compatible supported runtime.

```bash
npm install
cp .env.example .env
# Set GEMINI_API_KEY in .env only for Gemini-assisted result research and calibration notes.
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

- The application starts with an empty corpus and an explicitly untrained model. Synthetic generators remain in the engine test suite only; they are not imported by the application or training UI.
- The live schedule discovery button uses TheSportsDB's date endpoint and displays provider-listed event records separately from predictions. It does not generate fixtures, odds, or eight-rule scores. Coverage is incomplete, and schedule records alone are not enough to make a fixture prediction-ready.
- Search-grounded result grades are labelled `AI-UNVERIFIED:` and do not count as real settled results or enter model adaptation.
- Simulated results are labelled `SIMULATED:` and do not count as real performance or enter model adaptation.
- Manual settlement asks for an official result source URL. Only entries labelled `SOURCE-VERIFIED:` are eligible for the audit metrics and training-adaptation path. Verify the event identity, market rules, final outcome, and source yourself.
- Training starts only after an explicit user action with at least eight imported rows. CSV authenticity is not automatically verified; the user must check event identity, source, result and market rules. Holdout metrics are only descriptive of the supplied corpus and do not establish real-world predictive performance.

## Security and deployment limitations

The API includes payload validation, a body-size limit, and a basic per-IP rate limiter. **The API does not yet implement full authentication/authorization. Do not expose this server publicly or assume the rate limiter is a security boundary.** Add proper authentication, authorization, provider quota controls, and production deployment checks before public use.

Gemini-assisted research is not a sports data provider. TheSportsDB is a community-maintained schedule source with incomplete coverage, not an official league feed. The free schedule-day endpoint returns only a small number of records per request (documented free limit: 3), so it cannot guarantee a complete slate. The server caches by date and sport. Source-listed fixtures still need independent identity checks and real form, standings, head-to-head, lineup/availability, and other rule evidence before forecasts are allowed.

The fixture discovery archive is stored in a separate versioned browser-local-storage key, apart from the training corpus/model. It survives refreshes on the same browser/device but is not a durable server backup or cross-device sync. The app also does not yet persist a complete model checkpoint and full training corpus as a durable server-side artifact. Back up any genuine CSV corpus before changing versions.

See [`AUDIT-REPAIR-NOTES.md`](./AUDIT-REPAIR-NOTES.md) for a summary of the changes and remaining limitations.
