# Stage 0 — Global Coverage Execution Report

**Checked:** 2026-11-07  
**Repository branch:** `docs/six-sport-data-collection-blueprint`  
**Scope:** Worldwide event and bookmaker-market discovery across soccer, tennis, basketball, golf, cricket and rugby.  
**Execution type:** Independent public-documentation review; no authenticated provider or bookmaker API calls were made.  
**Decision:** **PARTIAL — research shortlist established; account-level and live-sample proof remains blocked.**

## 1. Executive result

The public documentation review identifies two useful but distinct candidate layers:

1. **Sportradar** is a candidate multi-sport sporting-data provider. Its developer portal explicitly lists soccer, tennis, golf, cricket, rugby and global basketball. It also states that competition/event coverage and data depth vary by package, tier and competition. The public Coverage Matrix did not expose a populated competition result in this review, so no competition, season, field, or package entitlement is approved.
2. **The Odds API** is a candidate bookmaker-market aggregator. Its public sport catalogue lists markets/competitions across all six OctaNet sports, but depth is uneven: golf is shown as major-tournament winner markets; rugby includes selected Rugby League competitions and Six Nations; tennis is tournament-specific; cricket lists selected competitions. A public catalogue entry is not proof that a particular bookmaker currently offers a market on an event, nor proof of the user's account tier, region, quota, or commercial rights.

These candidates should not be treated as a preselected vendor pair or as approved integrations. They are the best next sources to test against actual account access and exact requirements. The Odds API is market-context data only; its prices and implied probabilities must never become sporting evidence, team/player form, evidence scores, or model features.

No provider has yet passed the controlled sample protocol. No bookmaker has been verified as actively listing an OctaNet event in a timestamped API response. No purchase, production integration, or training import is recommended by this report.

## 2. Candidate source review

| Source | Intended data class | Public documentation finding | Current decision |
|---|---|---|---|
| Sportradar | Sporting events, results and sport-specific evidence | Public developer portal lists Soccer, Tennis, Golf, Cricket, Rugby and Global Basketball. Coverage varies by package, tier, competition and event; the Coverage Matrix is the required competition-level reference. | **CANDIDATE / ACCOUNT TEST BLOCKED** |
| The Odds API | Bookmaker market availability and odds snapshots | Public sports catalogue lists all six product sports, but with uneven competition/market depth. | **CANDIDATE / LIVE MARKET TEST NOT RUN** |
| SportsDataIO Global API | Sporting events and data | Public documentation exposes competition, phase and season catalogue endpoints and advertises broad global coverage. The publicly accessible product/API catalogue reviewed here does not establish the required six-sport coverage, particularly cricket and rugby, at account level. | **SECONDARY CANDIDATE / COVERAGE UNKNOWN** |
| Football-Data.org | Soccer fixtures, results, standings and related data | Existing public catalogue check is limited and stale for some South African records; it is not a six-sport source or bookmaker market feed. | **SOCCER-ONLY CANDIDATE / TOKEN TEST REQUIRED** |
| TheSportsDB | Fixture discovery | Existing OctaNet use is schedule discovery only. It does not prove a bookmaker market or prediction-grade evidence. | **DISCOVERY ONLY** |
| Cricsheet | Historical cricket archive | Historical ball-by-ball archive; prior structural audits are recorded in the Cricsheet follow-up. Not a live event or bookmaker-market feed. | **HISTORICAL RESEARCH ONLY** |

### Public references

- Sportradar developer portal: https://developer.sportradar.com/getting-started/docs/get-started
- Sportradar Coverage Matrix: https://coverage-matrix.sportradar.com/
- The Odds API sports catalogue: https://the-odds-api.com/sports-odds-data/sports-apis
- The Odds API documentation: https://the-odds-api.com/liveapi/guides/v4/
- SportsDataIO Global API documentation: https://sportsdata.io/developers/api-documentation/global
- SportsDataIO developer catalogue: https://sportsdata.io/developers
- Football-Data.org API documentation: https://www.football-data.org/documentation/api
- TheSportsDB API documentation: https://www.thesportsdb.com/docs/api
- Cricsheet downloads: https://cricsheet.org/downloads/
- Cricsheet licensing: https://cricsheet.org/licensing/

## 3. Six-sport status matrix

The following statuses describe the current proof state, not whether the sport exists or is globally bettable.

| Sport | Event/evidence provider proof | Bookmaker-market proof | Current blocker |
|---|---|---|---|
| Soccer | **PARTIAL (documentation only)** — Sportradar and Football-Data.org candidates identified; no authenticated event/evidence sample. | **PARTIAL (catalogue only)** — The Odds API lists many global competitions; no authenticated current event/bookmaker/market sample. | Account entitlements, competition catalogue export, event samples, actual market snapshots and rights. |
| Tennis | **PARTIAL (documentation only)** — Sportradar candidate; no tour/draw/player-stat sample. | **PARTIAL (catalogue only)** — The Odds API lists selected ATP/WTA tournaments; catalogue does not prove every tour/tier or current books. | Tour/tournament catalogue, draw/retirement fields, event and market samples, rights. |
| Basketball | **PARTIAL (documentation only)** — Sportradar Global Basketball and league-specific options; no competition-level account proof. | **PARTIAL (catalogue only)** — The Odds API lists NBA, WNBA, EuroLeague, NCAAB and other selected competitions. | Country/league coverage, event-level statistics, current market samples and rights. |
| Golf | **PARTIAL (documentation only)** — Sportradar Golf candidate; no tour/round/field sample. | **LIMITED (catalogue only)** — The Odds API public catalogue shows outright/winner markets for four major tournaments; this does not prove regular round, matchup or player markets. | Tour coverage, tournament/round markets, field/withdrawal data, actual event snapshots and rights. |
| Cricket | **PARTIAL (documentation only)** — Sportradar Cricket candidate; Cricsheet is historical only; no live schedule/stat sample. | **PARTIAL (catalogue only)** — The Odds API lists selected international and domestic competitions; no live bookmaker sample. | Format/competition coverage, playing XI/scorecard fields, current market sample and rights. |
| Rugby | **PARTIAL (documentation only)** — Sportradar Rugby candidate; no Union/League/Sevens event/stat sample. | **LIMITED (catalogue only)** — The Odds API lists selected Rugby League competitions and Six Nations Rugby Union; no proof of broad global Union/League/Sevens coverage. | Code-specific catalogue, event/stat samples, bookmaker availability and rights. |

**Important:** There are currently zero authenticated event/evidence sample tests and zero authenticated bookmaker market sample tests recorded for all six sports. The public catalogue reviews above are not counted as completed live tests.

## 4. Required controlled tests

Run the following against each provider/account and each sport/competition the account actually exposes. Do not choose a fixed country whitelist; export the complete permitted catalogue first and report every country/competition returned, pagination, missing pages, date window and freshness.

### A. Sporting event and evidence provider

1. Record provider, account product/tier, entitlement, quota and retrieval timestamp.
2. Export all available sports, countries, competitions and seasons; preserve pagination/cursors and raw-response hashes.
3. Capture at least one upcoming event and one completed event for every competition proposed for approval.
4. Capture required sport-specific evidence fields and explicit null/missing values.
5. Capture historical depth, season gaps and event counts.
6. Test participant/event IDs, aliases, duplicate events and same participants on different dates.
7. Test timezone conversion, daylight-saving boundaries, postponements, cancellations and sport-specific edge cases.
8. Verify that all pre-event evidence timestamps precede the prediction cutoff.
9. Independently reconcile completed results against an official organiser/governing-body source or another approved independent source.
10. Record retention, caching, display, internal modelling, derived-data and redistribution rights.
11. Assign PASS/PARTIAL/FAIL/NOT TESTED/BLOCKED with evidence and named reviewer.

### B. Bookmaker-market provider

1. Export all available bookmakers, bookmaker country/region codes, sports, leagues, markets and supported market types.
2. Record account tier, quota, request costs, rate limits, update cadence and historical snapshot availability.
3. Capture current market samples for events across all six sports, where the provider reports them.
4. For each sample preserve provider event ID, bookmaker key, market ID/type, selection ID/name, price, market status, observed timestamp, commence time and source response hash.
5. Verify event identity independently against a sporting schedule source; do not match by names alone.
6. Repeat samples after a short interval to assess market freshness, suspension and closure behaviour.
7. Record country-specific bookmaker availability and distinguish an empty response from a failed or incomplete request.
8. Check provider rights for internal use, user display, storage, caching, derived data and redistribution.
9. Keep all odds in the market-data class only. Do not expose them as sporting evidence or feed them into prediction features.
10. Assign PASS/PARTIAL/FAIL/NOT TESTED/BLOCKED with evidence and named reviewer.

## 5. Mandatory evidence record

Every test result must include:

- Unique test ID and status.
- Test date/time in UTC and reviewer.
- Provider, product, package/tier and account entitlement.
- Sport, country, competition, season and event date window.
- Endpoint/resource, request parameters and pagination/cursor coverage.
- Sample size and expected versus actual outcome.
- Raw response location or permitted response hash; never store API keys or secrets.
- Provider event IDs and canonical identity outcome.
- Data fields present, missing, stale or conflicted.
- Market/bookmaker IDs and observation timestamp where applicable.
- Independent result/identity verification reference.
- Rights evidence and explicit permitted-use scope.
- Failure reason, remediation owner and retest requirement.

A documentation page or marketing claim cannot satisfy a sample test. A successful API response cannot establish commercial rights. A trial key cannot prove production quotas or SLA.

## 6. Current gate decision

**Stage 0 remains PARTIAL and is not approved for production.**

- No provider or bookmaker is approved.
- Sportradar is the leading multi-sport sporting-data candidate to test, subject to account-level coverage and written rights.
- The Odds API is a promising market-data candidate to test, subject to live bookmaker/event coverage, account tier, region, quota and rights.
- The Odds API's public catalogue appears materially thinner for golf and rugby than for soccer, tennis, basketball and cricket; those gaps must remain visible rather than being papered over.
- SportsDataIO remains a possible secondary research candidate, but its actual coverage for all six OctaNet sports must be proven.
- Existing TheSportsDB remains fixture discovery only.
- Cricsheet remains historical cricket research only.
- No app, provider integration, database, prediction, model or training code is changed by this report.

## 7. Repository quality checks

At the time of review, PR #11 remained open, draft and unmerged. On the current PR head `a056768713afdc6f7b3ecaf7c138f141f7fabab2`, GitHub Actions Quality Checks run **42338457774** (run #83) completed successfully. The `Test, typecheck, and production build` job passed dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build. This validates the repository's software build/test path for this PR head; it does not validate any provider account, global competition catalogue, bookmaker market or data licence. Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42338457774

## 8. Next execution step

The next meaningful proof step is to run the provider and market sample protocol using authorised account access. Do not paste API keys into chat or commit them. If credentials are later made available through an approved private secret store, use read-only catalogue/sample requests first and retain only permitted metadata and hashes in this repository. If access is not available, keep the relevant rows BLOCKED rather than simulating success.

## 9. Additional market-provider finding — Sportradar OC Core (7 November 2026)

The current Sportradar Odds Comparison documentation distinguishes **OC Core** from its US-focused tier. OC Core is described as a global pipeline with 140+ global bookmakers and documented support for soccer, basketball, golf, cricket, rugby and tennis. This is a material improvement over the earlier general-product screening: it identifies a specific global market-data tier that covers all six OctaNet sport categories at the product-documentation level.

References:
- OC Core overview: https://developer.sportradar.com/odds/reference/oc-core-overview
- Odds Comparison v2 overview: https://developer.sportradar.com/odds/docs/oc-ig-overview

### Revised Stage 0 interpretation

- Sportradar **OC Core** is now the leading public-documentation candidate for a single global six-sport bookmaker-market feed, subject to actual account entitlement, bookmaker configuration, competition/event markets and rights.
- Sportradar sport-specific data APIs remain a separate sporting-event/evidence-provider assessment. OC Core market coverage does not prove schedules, results, statistics or prediction-grade evidence.
- The Odds API remains a useful independent market-feed candidate, but its public catalogue shows narrower golf and rugby examples in the reviewed material.
- The 140+ bookmaker and six-sport statements are vendor documentation, not OctaNet coverage measurements. No event-level market sample has yet been tested.

**Decision remains PARTIAL / BLOCKED:** no authenticated account, catalogue export, event-market payload, entitlement, quote or licence has been verified. No purchase, integration, model or training action is authorised by this research.

## 10. Latest PR-head quality check — 7 November 2026

After the OC Core access-gate update, GitHub Actions **Quality Checks run #85** (run ID `42338583323`) completed successfully against PR #11 head `fb69bf7ca71a1523486ebe8aac22359d2f828ddc`. The `Test, typecheck, and production build` job passed all steps: dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build.

Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42338583323

This is software quality evidence only. It does not change the Stage 0 decision: account-level OC Core access, worldwide competition/bookmaker catalogues, live event-market samples and data-use rights remain NOT TESTED or BLOCKED. PR #11 remains open, draft and unmerged.

## 11. Zero-budget decision and revised next step — 7 November 2026

**Owner budget constraint: no money is available for subscriptions.** This supersedes the earlier recommendation to request an OC Core trial/quote as the next execution priority. OctaNet's provider and bookmaker research must now follow a zero-subscription policy.

- Do not purchase Sportradar OC Core, The Odds API, SportsDataIO or another paid package.
- Do not initiate a paid trial, provide payment details, accept a minimum term, enable auto-renewal or incur chargeable overages.
- A genuinely no-cost trial with no payment method, commitment or automatic conversion may be reconsidered only after explicit owner approval. No trial request is currently authorised.
- Reclassify Sportradar OC Core as **PAID-CANDIDATE / DEFERRED — NOT AN EXECUTION DEPENDENCY**. Its public six-sport/bookmaker claims remain vendor documentation, not verified OctaNet coverage.
- Prioritise official public schedules/results, existing free access, free API tiers and openly licensed historical datasets. Verify each source's actual free quota, geographic/competition coverage, permitted automated access and licence before use.
- Do not treat a fixture feed as proof of a bookmaker market. If a real market cannot be verified through a lawful free source, record market status as **NOT VERIFIED** and do not label the event bettable.
- Keep the six-sport worldwide objective, while publishing actual sport/country/competition gaps. Do not substitute South Africa-only coverage or fabricate completeness to make the matrix look full.
- Odds remain market context only; all sporting evidence, identity, timestamps, outcomes and eligibility checks remain independent.
- No production integration, paid service, model change, training import or deployment is authorised.

### Revised next execution step

Build a source-by-source **free-access feasibility register** for soccer, tennis, basketball, golf, cricket and rugby. For each candidate record the public endpoint/page, access method, authentication requirement, free quota/cost, sport/country/competition coverage, pagination, freshness, historical depth, rights/terms, sample-test status and known gaps. Test only sources with no charge and permitted use. Keep all untested fields NOT TESTED or BLOCKED.

**Stage 0 remains PARTIAL.** No sport has yet passed complete event/evidence plus actual bookmaker-market verification. The zero-budget policy changes vendor selection priority; it does not weaken the evidence threshold.

## 12. Initial zero-cost source feasibility review — 7 November 2026

A public-documentation scan identified a small set of genuinely no-subscription candidates. This is a **research shortlist, not completed API verification**. No authenticated calls, event-market samples, production integrations or rights approvals were made.

| Sport | Free candidate(s) | What appears feasible at zero subscription | Important gap |
|---|---|---|---|
| Soccer | Football-Data.org; SportScore | Football-Data.org advertises a €0 tier with 12 competitions, delayed scores/schedules and 10 calls/minute. SportScore advertises free no-key schedules/results/statistics. | Neither proves worldwide coverage or bookmaker markets; SportScore needs independent sample/terms verification. |
| Tennis | SportScore; official public tournament pages | SportScore advertises free fixtures/results/stats. Official ATP/WTA/ITF pages can support manual spot checks where permitted. | No unrestricted official worldwide tennis API entitlement verified; no market feed verified. |
| Basketball | SportScore; public league sources | SportScore advertises free fixtures/results/stats; official league sources can be used for independent checks. | Competition coverage and statistical depth need sample verification; no market feed verified. |
| Golf | tourdata.golf; official tour pages | tourdata.golf documents free no-key tournament schedules for junior golf, 100 requests/day/IP and attribution. | Its public scope is junior golf; player/results/leaderboard/field data require partner access. No free professional-tour evidence feed verified. |
| Cricket | Cricsheet; SportScore; Play-Cricket API | Cricsheet provides free historical ball-by-ball archives; SportScore advertises free fixtures/results/stats; Play-Cricket documents token-based fixture/result endpoints. | Cricsheet is not live; Play-Cricket token scope/cost and global reach are unverified. |
| Rugby | rugbyAPI | A free no-card key is advertised at $0, with current/upcoming fixtures, results, tables and competition catalogue; 50 lookups/day. | Historical archive, deeper lineups/timelines and analytics are paid. Actual competition coverage still needs sample verification. |

### Cross-sport and rights observations

- TheSportsDB advertises a free API and 30 requests/minute, but its endpoint documentation imposes very low result limits on some methods and its current terms prohibit app-store publication unless the user is a paid subscriber. Treat it as a development/research candidate only until OctaNet's intended distribution and licence fit are resolved.
- No free bookmaker-market source has passed verification across all six sports. No event source is to be used as a substitute for market proof.
- Free access does not automatically confer rights to store, display, redistribute or train on data. Terms and attribution must be recorded per source.
- No source in this review is approved for production or prediction eligibility.

### References

- Football-Data.org free coverage and pricing: https://www.football-data.org/coverage ; https://www.football-data.org/pricing
- SportScore free access: https://sportscore.com/developers/
- TheSportsDB free API and terms: https://www.thesportsdb.com/docs_api ; https://api.thesportsdb.com/docs_terms_of_use.php
- Cricsheet: https://cricsheet.org/downloads/
- Play-Cricket Match Summary API: https://play-cricket.ecb.co.uk/hc/en-us/articles/360000130385-Match-Summary-API
- tourdata.golf access and terms: https://www.tourdata.golf/docs
- rugbyAPI free pricing and competition catalogue: https://rugbyapi.com/pricing ; https://rugbyapi.com/documentation/competitions/list

**Decision remains PARTIAL / NOT APPROVED.** The next low-risk tests are read-only, no-charge samples from SportScore, Football-Data.org and rugbyAPI, plus a limited junior-golf schedule check. Tennis and professional golf evidence remain open research gaps. Bookmaker markets remain NOT VERIFIED until a free, lawful, timestamped event-market source is demonstrated.
