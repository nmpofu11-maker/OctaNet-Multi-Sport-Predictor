# Six-Sport Data Collection Blueprint

**Status:** Proposed implementation plan (documentation only)  
**Scope:** Soccer, tennis, basketball, golf, cricket, rugby  
**Branch:** `docs/six-sport-data-collection-blueprint`

This document assigns collection methods to the existing OctaNet prototype. It does not claim that any provider account, licence, API key, or integration is already available. Provider choice must be confirmed against the exact competitions, seasons, fields, update latency, redistribution rights, and cost required by the project.

## 1. Decisions and non-negotiable safeguards

1. Keep the existing six-sport product scope. Do not introduce additional sports or a new prediction architecture as part of data ingestion.
2. Treat fixture discovery, sporting evidence, bookmaker odds, and verified outcomes as four distinct data classes.
3. A provider-listed fixture is only a candidate event. It is not prediction-ready until event identity and required pre-event evidence pass validation.
4. Store source, provider event ID, retrieval time, event time, source URL, and verification state for every ingested record.
5. Never fill missing values with generated statistics, guessed scores, odds-derived team performance, or synthetic rows.
6. Keep Gemini/search summaries as research assistance only. They are not an authoritative result feed and cannot settle events or train the model.
7. Keep synthetic data confined to tests. Preserve the empty-corpus / UNTRAINED startup state and explicit training action.
8. Preserve chronological holdouts and prevent post-event information from entering pre-event features.
9. Keep bookmaker prices in a separate market-data stream. Odds may support market comparison, but must not be presented as sporting evidence.
10. Do not expose provider credentials in browser code, client bundles, logs, commits, or API responses.

## 2. Provider and collection assignment by sport

Use a provider adapter per source and sport. The preferred source is the official governing body, league, or a licensed data distributor with documented rights. A secondary source is for reconciliation and gap detection, not automatic truth by majority vote.

| Sport | Primary collection method | Secondary / historical method | Core collection fields |
|---|---|---|---|
| Soccer | Official competition feeds where available; otherwise a licensed provider. Football-Data.org is a practical initial source for supported competitions and core fixtures, results, standings, and team data. | Independent licensed provider for corroboration and broader league coverage; official league result pages for settlement checks. | Competition/season, fixture ID, home/away teams, kickoff with timezone, venue, status, score, standings, recent results, lineups, injuries/suspensions where licensed, match statistics. |
| Tennis | Licensed ATP/WTA and tournament data feeds, with separate men's, women's, doubles, and tour/event identities. | A documented tennis API for evaluation/testing; official tournament draws and result pages for reconciliation. | Tour, tournament, draw, round, player IDs, opponent, surface, scheduled start, best-of format, ranking snapshot, recent surface-specific results, H2H, serve/return statistics, retirement/walkover status. |
| Basketball | Official league/competition feeds for each target league. For NBA coverage, official NBA statistics are a primary reference; a licensed distributor can provide a normalized feed across leagues. | SportsDataIO or another licensed provider only after confirming league/season/stat coverage and terms; official box scores for reconciliation. | League/season, game ID, teams, venue, tip-off, status, score, roster availability, minutes, points, rebounds, assists, shooting splits, turnovers, pace, rest days, team offensive/defensive ratings. |
| Golf | Licensed tour data feed (for example, Sportradar Golf) or direct official tour data agreement. Confirm each tour separately. | Official PGA Tour / DP World Tour / LPGA tournament leaderboards and historical results where permitted. | Tour, event, course, round, field, player ID, tee time, withdrawal/cut status, hole-by-hole scores, total strokes, position, strokes-gained categories where licensed, course and weather context. |
| Cricket | Licensed cricket data API and official board/competition feeds for current schedules, toss, playing XI, live score, and final result. | Cricsheet for historical ball-by-ball research and model datasets, subject to its coverage and use terms; official scorecards for result verification. | Format (Test/ODI/T20), competition, match ID, venue, toss, innings, batting/bowling XI, overs, runs, wickets, extras, partnerships, fall of wickets, innings result, DLS/target details. |
| Rugby | World Rugby and official competition/union feeds where available; use a licensed provider for reliable live and historical match statistics. Confirm Union and Sevens separately. | Official competition result pages and a second licensed feed for reconciliation. | Code (Union/Sevens), competition, match ID, teams, kickoff, venue, score, squad, tries, conversions, penalties, cards, possession, territory, set-piece and breakdown statistics where supplied. |

### Provider evaluation shortlist (not an automatic purchase list)

- **Soccer:** Football-Data.org for supported competitions and core match/standings data; compare coverage against the actual target leagues before choosing it as the only source. For advanced metrics and broad coverage, evaluate licensed providers such as Opta/Stats Perform or Sportradar.
- **Tennis:** Official ATP/WTA or tournament licensing first; evaluate third-party tennis APIs only after checking draw, retirement, surface, and historical-stat completeness.
- **Basketball:** Official NBA statistics for NBA reference data; official feeds for other leagues; evaluate SportsDataIO and other licensed providers for the exact leagues required.
- **Golf:** Evaluate Sportradar Golf and direct tour feeds. Do not build production ingestion on unofficial reverse-engineered endpoints.
- **Cricket:** Cricsheet is a useful historical bulk-data source, not a substitute for a licensed current/live feed.
- **Rugby:** World Rugby official statistics/results and competition/union sources; evaluate a licensed provider for cross-competition coverage and event-level detail.

**Provider selection gate:** record a provider as approved only after testing (a) competition coverage, (b) historical depth, (c) stable event/player/team IDs, (d) update frequency and correction policy, (e) required fields, (f) uptime/rate limits, (g) price, and (h) storage, display, and redistribution rights. A provider's marketing list is not proof that every required field is included in the proposed subscription.

## 3. Collection methods and when to use them

### A. Scheduled REST/API ingestion — primary operational method

Use server-side provider adapters with typed requests and responses. Each adapter should expose a small common contract: list competitions, list events in a date window, fetch one event, fetch standings/rankings where supported, fetch event statistics, and fetch final results. Sport-specific response parsing remains inside the adapter.

### B. Historical bulk import — initial training corpus

Use provider exports or documented public datasets for historical seasons. Import to a staging area first. Preserve original files and row-level source metadata. Deduplicate on provider + provider event ID, then reconcile cross-provider event identity. Do not import a dataset directly into the active training corpus.

### C. Official-source result verification — settlement gate

After an event ends, obtain the final score/standing from an official competition, governing-body, or licensed results feed. Handle abandoned, postponed, suspended, walkover, retirement, DLS, tie, draw, void, and market-specific settlement rules explicitly. Keep AI-assisted research and user-entered URLs as unverified claims until the result is checked against a trusted source.

### D. Manual CSV import — controlled gap-filling

Retain CSV import for genuine historical datasets and provider exports. Require source/provider, competition, event date/time, stable event ID (or a documented reconciliation key), participants, market/format, outcome, and source reference. Reject malformed rows; quarantine ambiguous rows. CSV provenance is not automatically verified merely because a source URL or checkbox is supplied.

### E. Independent reconciliation — quality control

Compare candidate events and results across sources using sport, competition, participants, event date, round/format, and start-time tolerance. Never match on team/player names alone. If sources disagree, preserve both raw records and mark the canonical event as conflicted until resolved.

## 4. Canonical storage model

The current `HistoricalMatchRow` and `DailyFixture` types are selection/opponent oriented. That is adequate for a narrow two-sided market representation but does not express a golf field, tennis draw/retirement, cricket innings, or rugby code well enough for reliable ingestion.

Introduce a collection layer before changing prediction features:

- **ProviderRecord:** provider, provider event/entity ID, endpoint/resource, retrievedAt, sourceUpdatedAt, raw payload reference/hash, response status.
- **Competition:** sport, governing body, competition ID, season, gender/level, country/region, format/code.
- **SportEvent:** canonical ID, sport, competition/season, scheduled start (UTC plus original timezone), venue/surface/course, status, participant references, provider links.
- **Participant:** stable canonical ID, type (team/player), sport, display name, aliases, provider IDs.
- **EventParticipant:** event, participant, role/side/seed/position, roster or field status.
- **EvidenceSnapshot:** event, participant/team, metric, value, unit, valid-from/to, observed-at, source, pre-event eligibility.
- **MarketSnapshot:** event, market/selection, decimal price, bookmaker/source, observed-at. Kept separate from sporting evidence.
- **VerifiedOutcome:** event, final status, score/standing, market settlement, source, verifier, verified-at, correction history.
- **IngestionRun:** adapter, sport, provider, time window, start/end, counts, errors, quota usage, run status.

Use a sport-specific payload or typed extension for details that do not fit the shared event envelope:

- Tennis: draw, set scores, surface, best-of, retirement/walkover.
- Golf: tournament field, round/hole scores, cut and withdrawal status.
- Cricket: innings, overs, wickets, target, DLS, batting/bowling participants.
- Rugby: Union/Sevens code, periods, cards, tries and set-piece data.
- Basketball: period scores, player box scores, roster availability.
- Soccer: home/away structure, lineups, substitutions, cards and match events.

Do not force these into the existing eight-rule feature vector until sport-specific feature definitions and tests exist.

### Persistence decision

The current README describes browser-local corpus/model and fixture archive storage, not a durable server-side canonical sports-data store. Firebase is listed as a dependency, but this review did not find an established Firestore initialization path in the inspected main-branch files. Before choosing persistence, inspect the actual deployment secrets/configuration and Firestore rules. Prefer extending a confirmed existing backend rather than adding a second database by default. Provider raw payloads and ingestion logs must be durable and exportable before automated training is enabled.

## 5. Validation, provenance, and model eligibility

Every record must carry:

- Provider and provider record ID.
- Canonical event ID and sport/competition identity (when resolved).
- Source URL or documented source reference.
- Retrieved timestamp and provider update timestamp when supplied.
- Event time in UTC and source timezone where known.
- Validation state: `candidate`, `verified`, `conflicted`, `rejected`.
- Data class: `fixture`, `sporting_evidence`, `market`, or `outcome`.

Rules:

1. Reject wrong-sport, malformed, impossible, or out-of-window records.
2. Do not silently convert unknown timezone or missing time into a fabricated kickoff.
3. Preserve source corrections and ingestion history; do not overwrite the raw record.
4. Enforce date-aware feature snapshots: only information observed before the prediction cutoff may be used for that prediction.
5. Require adequate evidence for both sides (or all relevant participants/field) before marking an event eligible.
6. Keep odds and implied probabilities out of sporting-evidence features and team/player form.
7. A final outcome is training-eligible only after trusted-source verification and market-specific settlement checks.
8. AI-generated grades remain `AI-UNVERIFIED:`; simulated data remains `SIMULATED:`; neither enters real metrics or adaptation.
9. Manual source labels remain claims until a reviewer actually checks the source and records who verified it.
10. Missing evidence means `not eligible`, not a neutral score or a guessed value.

## 6. Initial collection cadence (configurable per provider)

These are proposed starting intervals, not provider guarantees. Enforce provider rate limits and cache headers.

| Data class | Initial cadence |
|---|---|
| Fixtures / event schedules | Every 6 hours; increase frequency near event start if quota permits |
| Team/player form and standings/rankings | Daily and after official updates |
| Squad, lineup, injury, withdrawal, and availability | Every 6 hours in the pre-event window; refresh near start |
| Live event statistics | Provider-specific polling or push feed; do not poll faster than the licence/limits allow |
| Final results | On completion, then retry with backoff until verified |
| Historical imports | One-time staged import; incremental updates thereafter |
| Provider health and quota | On each run; alert on repeated errors, quota exhaustion, or stale feeds |

## 7. Delivery sequence

### Stage 0 — prerequisites and provider coverage (no production ingestion yet)

- List target competitions and seasons for each sport, including the actual leagues/tours the app is expected to cover.
- Confirm provider account, licence, key availability, quota, historical depth, and data rights.
- Create a field-coverage matrix and sample-response fixtures from each approved provider.
- Document event identity and settlement edge cases per sport.

**Exit:** at least one approved source and a tested sample payload for each sport/competition in the first release scope. A sport without a provider remains explicitly unsupported for live ingestion.

### Stage 1 — ingestion foundation

- Add provider adapter interfaces and one adapter at a time.
- Add raw-record provenance, schema validation, retry/backoff, request timeouts, idempotency, and ingestion-run reporting.
- Keep discovery candidates separate from prediction inputs.
- Keep provider keys server-only and add authentication/authorization before public exposure.

**Exit:** repeated ingestion is idempotent; invalid records are rejected/quarantined; provider failures are visible; no synthetic data is introduced.

### Stage 2 — canonical sport event and evidence storage

- Add shared event/participant identities with sport-specific extensions.
- Persist raw source records and normalized records durably.
- Add cross-provider reconciliation and conflict review.
- Add export/backup and retention controls.

**Exit:** every canonical event can be traced back to its provider records and corrections.

### Stage 3 — historical data and verified outcomes

- Import historical data into staging, deduplicate, reconcile, and validate it.
- Build official-source settlement checks per sport and market.
- Create verified chronological train/holdout datasets.
- Keep the active corpus empty until the user explicitly approves a verified dataset and training action.

**Exit:** no row enters training without traceable provenance, event identity, cutoff-safe features, and verified outcome.

### Stage 4 — sport-specific evidence features

- Implement feature adapters for each sport and competition format.
- Map only real, timestamped metrics to model features.
- Retire or gate universal rules where a metric is not meaningful for that sport.
- Add leakage, missing-data, conflict, and settlement tests for each sport.

**Exit:** each sport has a documented feature dictionary, minimum evidence requirements, and independent tests.

## 8. Acceptance tests

A release is not ready unless automated tests demonstrate:

- Wrong-sport and wrong-competition payloads are rejected.
- Duplicate ingestion creates no duplicate canonical events.
- Same participants on different dates are not conflated.
- Provider event IDs that collide across providers do not collide canonically.
- Timezone conversion and daylight-saving edge cases are covered.
- Post-event statistics cannot enter pre-event features.
- Conflicting scores/results are quarantined, not silently selected.
- Missing fields never become invented defaults.
- Odds never populate sporting evidence.
- Retirements, walkovers, voids, abandoned events, ties/draws, DLS, and golf withdrawals are handled according to explicit rules.
- AI-unverified and simulated outcomes cannot affect real metrics or training.
- A provider outage or quota error is visible and does not masquerade as an empty successful feed.
- Secrets are absent from client bundles, logs, fixtures, and Git history.
- The untrained startup state and explicit training gate remain intact.

## 9. Initial recommendation

Do not subscribe to six providers immediately. First identify the target competitions and required depth, then run a small provider proof-of-coverage for one sport at a time. Prefer official/licensed data for current fixtures and results; use bulk historical sources only where their provenance, coverage, and terms are clear. Keep TheSportsDB as a low-confidence discovery fallback only, not the authoritative schedule or evidence source.

### Documentation references

- Football-Data.org API v4: https://www.football-data.org/documentation/quickstart
- SportsDataIO developer documentation and global API: https://sportsdata.io/developers
- SportsDataIO competition coverage: https://sportsdata.io/developers/competition-coverage
- Sportradar developer portal (Golf product coverage and access are contract-dependent): https://developer.sportradar.com/
- Cricsheet downloads and data formats: https://cricsheet.org/downloads/
- World Rugby rankings and statistics: https://www.world.rugby/rankings
- NBA official statistics: https://www.nba.com/stats
- ATP Tour: https://www.atptour.com/
- WTA: https://www.wtatennis.com/
- PGA Tour: https://www.pgatour.com/
