# Stage 0 — Global Coverage Execution Report

**Checked:** 2026-11-09  
**Repository branch:** `docs/six-sport-data-collection-blueprint`  
**Scope:** Worldwide event and bookmaker-market discovery across soccer, tennis, basketball, golf, cricket and rugby.  
**Execution type:** Public-documentation review plus limited unauthenticated metadata endpoint reads; no authenticated provider or bookmaker API calls were made.  
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

## 13. Zero-cost source and market-feed reassessment — 8 November 2026

**Review type:** fresh public documentation and public catalogue review. No API credentials were used, no account was created, and no API event/market sample was successfully retrieved in this review. Public product pages are not counted as authenticated coverage tests.

### 13.1 Free event/evidence candidates

| Source | Publicly documented free access and scope | Important limitations | Current status |
|---|---|---|---|
| SportScore | No-key public REST API for football, basketball, cricket and tennis; eight GET endpoints for matches, match detail, team fixtures, standings, top scorers, player statistics, brackets and tracker; approximately 10,000 requests/24h/IP; 60-second edge cache. | Requires a visible crawlable dofollow SportScore attribution link on every page/surface using the data. No SLA; data is provided as-is and is not guaranteed accurate. Terms permit early-stage commercial use with the badge, caching and combining data, but prohibit raw-feed/bulk redistribution and use as the sole source for financial decisions. No golf or rugby endpoint is documented. | **FREE DOCUMENTATION CHECKED / API SAMPLE NOT RUN** |
| rugbyAPI | Free key advertised at $0 forever, no payment card, Google sign-in, 50 lookups/day. Free tier includes yesterday/today/upcoming fixtures, current-season results/tables/teams/search; 11 of 31 endpoints. Public coverage page advertises 42 competitions across club, international and sevens and displays upcoming and completed records. | Free key is current-season depth; full archive/history, deeper matchday detail and live/webhook functionality are paid. Public coverage is a vendor page, not an account API export. Rugby League coverage is not established by the inspected public examples; Sevens examples are sparse and some are results-only. Terms allow use in own apps/products and user display but prohibit bulk resale; data is not guaranteed and must not be the sole source where betting errors could cause loss. | **FREE KEY DOCUMENTED / ACCOUNT AND API SAMPLE NOT RUN** |
| Football-Data.org | Anonymous access permits 100 requests/24h but only area and competition-list resources. Registered free tier advertises 12 competitions and 10 requests/minute, with delayed schedules/scores and tables. | Soccer only; fixed 12-competition free scope, delayed data and no bookmaker odds in the free tier. No token or response sample was used. | **FREE DOCUMENTATION CHECKED / SAMPLE NOT RUN** |
| tourdata.golf | No-key junior tournament schedules, tours and courses; 100 requests/day/IP; pagination via `meta.has_more` and `meta.next_offset`; permanent UUIDs and `updated_at` timestamps. Schedule use is commercially permitted with attribution. | Scope is junior golf schedules only. Player, results, leaderboard, field/roster and ranking data require a partner key. New events are added weekly and the full schedule is refreshed monthly; dates have no time or timezone. Not a professional-tour evidence or betting feed. | **LIMITED FREE SCHEDULE DOCUMENTATION CHECKED / SAMPLE NOT RUN** |
| Cricsheet | Public historical ball-by-ball archive; prior real archive audit is documented separately. | Historical completed cricket only, not live fixtures or markets. SA20 130/130 parsed (structural PASS); CSA T20 Challenge 314/314 parsed (REVIEW because 34 omit optional `player_of_match`). | **HISTORICAL STRUCTURAL TEST COMPLETED / RIGHTS AND SEMANTIC REVIEW STILL REQUIRED** |

### 13.2 Free bookmaker-market candidate

The Odds API's official public page currently advertises a **Starter FREE tier with 500 credits/month**, all sports, most bookmakers and all betting markets, with no historical odds. The public page says a key is issued after subscribing/registering but does not state whether a payment card is required; that requirement is therefore **NOT VERIFIED** and no account was created.

The same public page's sport examples list soccer, basketball, cricket, selected golf majors, selected tennis tournaments and Rugby League/NRL. It does not establish broad Rugby Union coverage. Its public bookmaker-region list includes US, UK, EU, AU, CA, FR, SE and FI; no South Africa-specific region is listed. Some bookmaker rows are explicitly marked paid-subscription-only. The free tier's actual sports, bookmakers and event markets must be read from an authorised key's `/sports` and event responses before any claim of usable coverage.

The provider's terms permit storage, user-facing display, derived values and model training, while prohibiting resale/redistribution as a standalone raw data feed. The terms also place independent verification responsibility on the user. This permission does not override OctaNet's separate rule: **odds are market context only and must never become sporting evidence or model features.** No odds will be imported into training.

References:
- The Odds API free Starter plan and sport examples: https://the-odds-api.com/
- The Odds API bookmaker regions/list: https://the-odds-api.com/sports-odds-data/bookmaker-apis.html
- The Odds API terms: https://the-odds-api.com/terms-and-conditions.html

### 13.3 Verification status by required evidence class

| Evidence class | Status | Reason |
|---|---|---|
| Package/account entitlements | **BLOCKED** | No authorised provider keys or account entitlement exports. No account was created during this review. |
| Global catalogue pagination | **NOT TESTED** | Public pages were reviewed, but no complete account-level API catalogue/cursor export was captured. |
| Country/competition coverage | **PARTIAL** | Public pages list selected countries/competitions and examples only. No complete six-sport country/competition export. |
| Upcoming/completed event API samples | **NOT TESTED** | No raw API event response was retrieved. Public website fixtures/results are not counted as API samples. |
| Historical samples | **PARTIAL** | Cricsheet archive structural audit completed; other providers' free-tier historical depth is either restricted or untested. |
| Sport-specific evidence fields | **PARTIAL** | Endpoint/field availability is described in public documentation, but no payloads/null rates/field quality were inspected. |
| Event identity and timestamp checks | **NOT TESTED** | No cross-source event reconciliation, alias/collision test or timestamp-cutoff test was run. Public claims of permanent IDs are not a validation. |
| Independent result verification | **NOT TESTED** | No completed event was reconciled to an independent official source in this run. |
| Bookmaker/event/market/selection IDs and observed timestamps | **NOT TESTED** | The Odds API has a documented free tier, but no authorised key or event-market payload was available. No actual bookmaker market is verified. |
| Data rights | **PARTIAL** | Public terms were reviewed for SportScore, rugbyAPI, tourdata.golf and The Odds API; no account-specific agreement, full product legal review or production licence approval. |
| Prediction eligibility | **BLOCKED** | No sport has passed independent event identity, market (where required), pre-event evidence, timestamp and rights gates. |

### 13.4 Six-sport free-source decision

- **Soccer:** SportScore and Football-Data.org are free event/evidence candidates; their actual samples and exact competition gaps remain untested. The Odds API is a free market candidate, not a verified source.
- **Tennis:** SportScore is a free event/evidence candidate; global tour/tier coverage and sport-specific field quality remain untested. No free bookmaker market sample.
- **Basketball:** SportScore is a free event/evidence candidate; competition coverage and player/team fields remain untested. No free bookmaker market sample.
- **Golf:** tourdata.golf is limited to junior schedules; professional tour evidence remains an open gap. The Odds API's public examples are majors/outrights, not broad round or matchup market proof.
- **Cricket:** SportScore is a current-data candidate and Cricsheet is historical research; neither establishes a complete global live evidence feed or bookmaker markets.
- **Rugby:** rugbyAPI is a promising no-card current-season fixture/results candidate, but its 50-lookups/day allowance, competition/code depth and actual API responses need testing. Rugby League coverage is not yet proven. The Odds API's public example is NRL/Rugby League, not broad Union/Sevens markets.

**Stage 0 remains PARTIAL / NOT APPROVED.** The no-cost shortlist is stronger, but no free event/evidence source has passed API sample validation and no bookmaker market has been verified for any sport. Fixture discovery, actual market availability, sporting evidence and prediction eligibility remain separate gates.

### 13.5 Current PR-head CI check

On PR #11 head `f70bc317d9b5771dd324c3c8738fe4d4dfd21cca`, GitHub Actions Quality Checks run **#91** (run ID `42342422806`) completed successfully. The `Test, typecheck, and production build` job passed dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build. This is software validation only; it does not validate any API sample, bookmaker market, global coverage or licence. The subsequent documentation-only update has not yet been checked by a new workflow run.

Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42342422806

### 13.6 Next practical step

Use read-only, no-charge tests only. First obtain permitted no-key API samples for SportScore and tourdata.golf, and an authorised no-card rugbyAPI free key if the owner chooses to create one. For The Odds API, do not register until its free-tier payment-method requirement is confirmed as no-card; if confirmed, use only the 500-credit free allowance and inspect the actual account sports/bookmaker catalogue before event-market queries. If no lawful free market response is available, keep market status NOT VERIFIED. Do not purchase, integrate, train or deploy.

## 14. Additional no-card odds feeds and rights gate — 8 November 2026

**Review type:** public documentation and terms review only. No accounts were created, no credentials were used, and no live API payload was retrieved.

### TheRundown Free — constrained private market evaluation

The official API documentation advertises $0/no-card access, 20,000 data points/day and 200,000/month, one request/second, and five-minute-delayed pre-match moneyline/spread/total prices from only DraftKings, FanDuel and BetMGM. Free excludes props, alternate markets, in-play, WebSocket and odds history. Its public sports catalogue shows soccer, tennis, basketball and cricket; rugby is not listed, and golf appears only as futures (not a Free feature).

**Licence boundary:** Free and Starter are internal/personal use only. Commercial end-user display begins at Pro ($149/month); Starter is $49/month and still internal/personal use. It can support a narrow private evaluation if an authorised no-card key is made available, but it is not a free production odds source for a customer-facing OctaNet app.

References: https://therundown.io/api · https://therundown.io/free-sports-data-api · https://therundown.io/docs/quickstart

### ParlayAPI Free — broad catalogue claims, strict non-commercial licence

Official docs advertise 1,000 credits/month at $0/no card, 30+ sources and 90+ sport keys. `/v1/sports` and `/v1/sports/{key}/events` are documented as zero-credit; odds calls consume credits according to markets and regions. The response contract documents canonical event IDs, `commence_time`, `commence_time_reported`, bookmaker `last_update_ms` and `stale_seconds`. Free historical lookback is only 48 hours.

**Licence boundary:** Terms last updated 14 October 2026 restrict Free to personal evaluation and non-commercial research. Public/customer-facing display, commercial derived products, redistribution, resale and sublicensing require a separate signed agreement. Terms also restrict model training intended to replicate/compete with the service and line-level retention beyond 90 days without written consent. The documented sandbox uses deterministic synthetic data and must never count as real evidence.

Decision: internal non-commercial evaluation only, and only after owner-authorised account access. Not approved for OctaNet production/public display under standard Free terms. No account was created and no API call was made.

References: https://www.parlay-api.com/docs · https://www.parlay-api.com/free-sports-odds-api · https://www.parlay-api.com/legal/terms · https://www.parlay-api.com/historical-coverage

### Odds-API.io and Unabated/Gambly

Odds-API.io advertises a 100-request/hour, 500/day free tier across 34 sports and two recreational books, but its current official pricing page says **new free keys are paused indefinitely**; existing keys only. Paid Solo starts at £49/month. It is not an obtainable free option for a new account.

Unabated/Gambly free publisher access is conditional on tracked sportsbook deeplinks and monthly partner traffic targets; its public examples focus on US operators. It is not a neutral global odds feed.

References: https://odds-api.io/pricing/free · https://unabated.com/odds-api/free · https://docs.unabated.com/guides/deep-links

### Revised market-provider decision

- TheRundown Free: clearest no-card private odds-evaluation option for selected soccer, tennis, basketball and cricket competitions; only three US books, five-minute delay, no customer-facing display rights, and no golf/rugby proof.
- ParlayAPI Free: broadest advertised sport-key catalogue and useful ID/freshness schema, but no customer-facing/commercial OctaNet use without a separate signed agreement; internal evaluation only after owner approval.
- The Odds API Starter: still advertises 500 credits/month at $0, but payment-card requirement remains unstated and public regions/sports have gaps; do not register until no-card status is confirmed.
- Odds-API.io: new free keys paused; remove from the obtainable-free shortlist.
- Sportradar OC Core: global candidate remains unverified; no free entitlement established.

**Evidence status remains unchanged:** no actual bookmaker/event/market/selection response has been captured for any provider. No provider has passed the global six-sport event-and-market protocol; no sport is prediction-eligible by this report.

## 15. Public no-auth market-health checks and new stats-evaluation route — 9 November 2026

**Execution type correction:** this Stage 0 review now includes a small number of public, unauthenticated metadata endpoint reads in addition to documentation review. No account was created, no key was used, no authenticated provider request was made, and no OctaNet event-market payload was captured.

### TheRundown — new-account statistics evaluation

The current official API pricing page now explicitly lists, for qualifying new accounts, a no-card seven-day current-season statistics evaluation. The Free plan exposes a catalogue and fixed complete-game sample for schema inspection; new accounts created on or after `2026-09-07T18:00:00Z` follow this new-access policy. The same Free plan provides 20,000 odds data points/day and 200,000/month, one request/second, five-minute-delayed pre-match main lines from three books (BetMGM, DraftKings and FanDuel), and internal/personal-use rights only. Commercial end-user display begins on Pro. The seven-day stats evaluation is a time-limited test route, not permanent free history or a production entitlement.

This creates a useful **event/evidence-field evaluation candidate** as well as a separate narrow odds-market candidate. The docs do not establish which of OctaNet's six sports/competitions are included in the new-account stats evaluation or which fields are populated. No account or stats sample was accessed, so this remains documentation-only.

References: https://therundown.io/pricing/api · https://therundown.io/free-sports-data-api · https://therundown.io/docs/quickstart

### ParlayAPI — public health metadata response actually retrieved

The public no-auth `GET /v1/status` endpoint returned a JSON payload with `as_of: 2026-11-08T16:15:24.554441Z`, a stated 15-minute window, and per-source fields including source name, rows, sports covered, latest age and SLA state. It named multiple odds/prop sources, including Superbet, FanDuel, Parx, BetRivers, RushBet, Unibet, Pinnacle, DraftKings and others. A separate `GET /v1/meta/source-quality` payload reported `source_count_total=24`, with 9 OK, 9 degraded, 5 breach and 1 stale; its separate price-write counts were 14 OK, 7 degraded, 3 breach, 0 stale and 0 missing. It was generated at `2026-11-08T08:30:16.462Z`.

At the review time (`2026-11-09T06:22:56Z`), those payloads were approximately 14h07m and 21h52m old respectively. They prove that public source-health metadata endpoints returned structured monitoring payloads at those timestamps; they do **not** prove current freshness, any specific upcoming event, an event/bookmaker/market/selection tuple, geographic completeness, or rights. Some sources were already classified degraded/breached in those stale snapshots. Treat this as **PARTIAL health-metadata evidence only**, not a bookmaker-market sample.

References: https://parlay-api.com/v1/status · https://parlay-api.com/v1/meta/source-quality · https://parlay-api.com/v1/meta/parser-coverage

### ParlayAPI — no-auth preview scope and free-tier gate

Earlier review notes described a no-auth `/v1/try/{sport_key}/odds` preview. The current official documentation retrieved on 11 November does not document that route. It documents `/v1/sandbox/...` as no-auth deterministic synthetic data, which is excluded from evidence. Regular event/odds calls are shown with API-key authentication. No current target-sport event-market sample was captured; event-market sampling remains **NOT TESTED**.

ParlayAPI's free tier is advertised as $0/no card, 1,000 monthly credits and real-time access, but its own FAQ elsewhere describes the allowance as 1,000 requests/month while its docs and pricing materials use credits. Record this unit discrepancy as unresolved; do not estimate capacity until clarified. Its Acceptable Use Policy/Terms last updated 14 October 2026 restrict Free to personal evaluation/non-commercial research. Customer-facing displays, commercial derived products, redistribution and sublicensing require a separate signed agreement; paid self-serve tiers do not automatically grant those rights either. Sandbox endpoints return synthetic data and are excluded from evidence.

References: https://parlay-api.com/try · https://parlay-api.com/docs · https://parlay-api.com/limits · https://www.parlay-api.com/legal/acceptable-use · https://www.parlay-api.com/terms

### Updated evidence ledger

| Required proof | Status | Reason |
|---|---|---|
| Package/account entitlements | **BLOCKED** | No authorised account/package export; no account was created. |
| Global catalogue pagination | **NOT TESTED** | No complete account-level sports/books/competition pagination export. |
| Country/competition coverage | **PARTIAL** | Public catalogue claims/examples only; no exhaustive six-sport country/competition export. |
| Upcoming/completed event API samples | **NOT TESTED** | One provider-labelled no-auth MLB demo payload was captured, but it is stale and outside OctaNet's six sports; no current six-sport event-market payload was captured. |
| Historical samples | **PARTIAL** | Cricsheet archive structural audit remains the only completed historical parser test; provider histories not queried. |
| Sport-specific evidence fields | **PARTIAL** | TheRundown documents a new-account stats sample/evaluation, but no account sample or field/null-rate inspection. |
| Identity and timestamp reconciliation | **NOT TESTED** | No event identity or cutoff reconciliation run. |
| Independent result verification | **NOT TESTED** | No completed API event was independently reconciled during this review. |
| Bookmaker/event/market/selection IDs and timestamps | **NOT TESTED** | ParlayAPI health metadata is not an event-market record; no event-market tuple captured. |
| Data rights | **PARTIAL** | Public terms reveal internal/non-commercial restrictions; no OctaNet-specific licence approval. |
| Prediction eligibility | **BLOCKED** | No sport has passed the separate event, market, identity, sporting-evidence, timing and rights gates. |

**Decision remains PARTIAL / NOT APPROVED.** The next zero-subscription test priority is a permitted, owner-authorised read-only stats evaluation on a qualifying TheRundown account if available, plus a fresh repeat of ParlayAPI's public metadata endpoints and an actual no-auth `/try` sample where the endpoint is accessible. Do not create accounts, accept new terms or use keys without owner authorisation. Do not treat odds as sporting evidence.


## 10. Public ParlayAPI endpoint observations — 10 November 2026

A public `GET /v1/meta/source-quality` response was retrieved with `generated_at_ms=1794293747963` (**2026-11-10T06:55:47.963Z**). It reported 31 sources (25 OK, 4 degraded, 2 breach, 0 stale/missing); price-write classifications were 28 OK, 3 degraded, 0 breach/stale/missing. This is timestamped provider-health metadata, not event-market coverage or sporting evidence. Reference: https://parlay-api.com/v1/meta/source-quality

The public `GET /v1/sports` active-key snapshot showed examples across the six OctaNet sports: broad soccer competitions across multiple countries; basketball NBA/WNBA/NCAAB/EuroLeague; tennis ATP/WTA/French Open; golf PGA Championship; cricket IPL and Test Matches; and rugby NRL (Rugby League). No Rugby Union or Sevens key was visible in this returned snapshot. The body had no generated-at timestamp and retrieval-cache age was not controlled, so this is not a guaranteed current or exhaustive inventory. No authenticated catalogue pagination/completeness test was performed. Reference: https://parlay-api.com/v1/sports

The public `GET /v1/bookmakers` registry included source, region and endpoint metadata. Its `betway_mz` entry identifies Betway Mozambique but explicitly limits the feed to TT Cup pre-match full-match point handicaps. A `global` region label therefore must not be interpreted as broad global coverage for OctaNet's six sports. Reference: https://parlay-api.com/v1/bookmakers

A provider-labelled no-auth `GET /v1/try/baseball_mlb/odds` demo response exposed event ID/canonical ID, commencement time, bookmaker, h2h market, outcomes/prices and last-update fields. The event commenced 2026-10-29 and displayed bookmaker observations were dated 2026-10-28; it was stale on 10 November and outside OctaNet's six sports. It is schema-only evidence, not a current market test. Reference: https://parlay-api.com/v1/try/baseball_mlb/odds

| Required proof | Status | Reason |
|---|---|---|
| Public sport catalogue retrieval | PARTIAL | Snapshot captured; generated-at/cache freshness not controlled |
| Package/account entitlements | BLOCKED | No authorised account export |
| Catalogue pagination/completeness | NOT TESTED | No authenticated complete export or pagination test |
| Country/competition coverage | PARTIAL | Public examples only; no exhaustive matrix |
| Timestamped provider-health metadata | PASS (metadata only) | Generated timestamp and source/price-write counts captured |
| Current upcoming events in six target sports | NOT TESTED | No current target-sport event response captured |
| Completed events / independent results | NOT TESTED | No completed target-sport result reconciled |
| Historical provider samples | NOT TESTED | Cricsheet parser audit remains separate; provider history not queried |
| Sport-specific sporting-evidence fields | PARTIAL | Documentation only; no evidence payload/null-rate test |
| Identity/timestamp reconciliation | NOT TESTED | No cross-provider matching/cutoff test |
| Bookmaker/event/market/selection tuple | PARTIAL | One stale MLB demo tuple exposes schema only; no current six-sport tuple |
| Data rights | PARTIAL | Public self-serve restrictions reviewed; no OctaNet-specific licence |
| Prediction eligibility | BLOCKED | No sport passed all event, market, identity, evidence, timing and rights gates |

**Stage 0 remains PARTIAL / NOT APPROVED.** Odds remain market context only and never sporting evidence.

## 11. Public ParlayAPI catalogue refresh and PR-head CI — 10 November 2026

**Review time:** approximately 2026-11-10 07:04 UTC (09:04 Africa/Johannesburg).  
**PR head reviewed:** `9aee2121d778039263683228373fad13b7bcb2f1`.

### GitHub software validation

GitHub Actions Quality Checks run **#101** (run ID `42772066003`) completed successfully on the reviewed PR head. Its `Test, typecheck, and production build` job passed dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build. This is software validation only; it does not prove provider coverage, event/market availability, evidence quality or rights.

### Fresh public endpoint reads

- **Source health:** `GET /v1/meta/source-quality` returned a timestamped response generated at `2026-11-10T06:55:47.963Z`, about eight minutes before this review. It reported 31 sources: 25 OK, 4 degraded, 2 breach, 0 stale/missing; price-write classifications were 28 OK, 3 degraded, 0 breach/stale/missing. The response also exposed per-source observation ages and `archive_fetch_status=ok`. This is a useful, recent provider-pipeline health snapshot, but its source set includes non-sportsbook/DFS/exchange/prediction-market sources and is **not** proof of six-sport bookmaker market coverage. Reference: https://parlay-api.com/v1/meta/source-quality
- **Active sport keys:** `GET /v1/sports` returned active-key entries for the six broad OctaNet sports. The visible catalogue includes many soccer competitions, NBA/WNBA/NCAAB/EuroLeague, ATP/WTA/French Open, PGA Championship, IPL/Test cricket and NRL Rugby League. No Rugby Union or Sevens key appeared in this returned snapshot. The response body has no generation timestamp, and pagination/account completeness were not established. Reference: https://parlay-api.com/v1/sports
- **Bookmaker registry:** `GET /v1/bookmakers` returned bookmaker identifiers, regions, endpoint/market capabilities and example paths. The entries demonstrate why a bookmaker registry is not event coverage: Betway Mozambique is explicitly limited to TT Cup point handicaps; Bookmaker.eu is described for NFL/MLB moneylines; BetOnline examples concern NFL/college football/MLB; and bet365 lists several regions but its examples are NFL. No target-sport event was reconciled to any bookmaker from this registry. Reference: https://parlay-api.com/v1/bookmakers
- **No-auth event preview:** the current official docs do not document `/v1/try/{sport_key}/odds`. They document `/v1/sandbox/...` as deterministic synthetic data, which is excluded from evidence. No current real-data no-auth event route or target-sport event-market response was verified. Documentation: https://parlay-api.com/docs

### Updated evidence ledger

| Required proof | Status | Reason |
|---|---|---|
| Public source-health metadata | **PASS — metadata only** | Timestamped response retrieved; 31-source health and price-write classifications inspected. |
| Package/account entitlements | **BLOCKED** | No authorised account/package export. |
| Global catalogue pagination/completeness | **NOT TESTED** | Public active-key list has no demonstrated pagination or account-completeness proof. |
| Country/competition coverage | **PARTIAL** | Public active-key examples show breadth, especially soccer, but are not an exhaustive country/competition matrix. |
| Upcoming/completed event API samples | **NOT TESTED** | No current target-sport event response captured. |
| Historical provider samples | **PARTIAL** | Cricsheet structural audit remains separate; ParlayAPI historical odds were not queried. |
| Sport-specific evidence fields/null rates | **PARTIAL** | No sporting-evidence payload or field-quality/null-rate audit. |
| Event identity and timestamp reconciliation | **NOT TESTED** | No cross-source matching or cutoff test. |
| Independent result verification | **NOT TESTED** | No completed target-sport event independently reconciled. |
| Bookmaker/event/market/selection IDs and observed timestamps | **NOT TESTED** | Registry examples and preview documentation do not constitute a current event-market tuple. |
| Data rights | **PARTIAL** | Public self-serve terms reviewed; no OctaNet-specific rights approval. |
| Prediction eligibility | **BLOCKED** | No sport has passed all separate event, market, identity, sporting-evidence, timestamp and rights gates. |

**Decision remains PARTIAL / NOT APPROVED.** The refreshed public catalogue and health reads improve discovery intelligence, but do not change the six-sport live event-market proof status. Odds remain market context only, never sporting evidence.

## Verification update — 11 November 2026 (GitHub Actions Quality Checks #103)

The latest PR-triggered Quality Checks run retrieved for the current PR head completed successfully:

- Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42772921684 (run #103)
- Checked-out PR head: `e7b5a9a46bb0090853d14f03045ab1e12b06871f`
- Workflow: `.github/workflows/quality-checks.yml`
- Job: `Test, typecheck, and production build` — **SUCCESS**
- Steps: setup, checkout, Node setup, dependency install, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build — all completed successfully.
- Run completed: `2026-11-10T07:06:50Z`.

This run is on the current PR head and supersedes the previously recorded #101 result for software-validation reporting. It does not test provider account entitlements, global catalogue pagination, live bookmaker markets, six-sport event samples, independent result verification or data rights. The Stage 0 decision therefore remains **PARTIAL / NOT APPROVED**; account-backed and event-market checks retain their existing statuses.

## 12. ParlayAPI source-health and access-semantics correction — 11 November 2026

A fresh unauthenticated read of `GET /v1/meta/source-quality` returned `generated_at_ms=1794357658452` (**2026-11-11T00:40:58.452Z**), `window_minutes=10`, `source_count_total=45`, `source_count_returned=40`, `archive_source_count=0`, `latest_state_source_count=0`, `latest_state_only_source_count=0`, and `pulse_only_source_count=45`. Top-level pulse classifications were 44 OK, 1 degraded, 0 breach and 0 stale/missing. Critically, `price_write_counts` were **0 OK, 0 degraded, 0 breach, 45 missing**. Thus the 44 OK figure is reachability/pulse metadata, not proof that those sources wrote current prices. No archive/latest-state price rows were reported in this ten-minute observation window. This is not proof that no odds exist anywhere; it means this health snapshot supplies no positive price-write evidence. Reference: https://parlay-api.com/v1/meta/source-quality

The same fresh public `/v1/sports` response showed active keys for soccer, tennis, basketball, golf, cricket and Rugby League (NRL), but no Rugby Union/Sevens key in the returned snapshot. The current official API documentation defines this endpoint as listing sport keys with at least one event in the last 24 hours; it is therefore an active-key window, not a complete global competition master. No catalogue pagination or exhaustive country/competition export was demonstrated. References: https://parlay-api.com/v1/sports ; https://parlay-api.com/docs

The current public bookmaker registry includes conventional sportsbooks alongside DFS, exchanges and prediction-market sources. Its rows are scope-specific: for example, Betway Mozambique is described as TT Cup full-match point handicaps only; Bookmaker.eu and BetOnline examples are NFL/MLB; bet365's example paths are NFL despite multiple listed regions. A registry row is not an event-market observation. Reference: https://parlay-api.com/v1/bookmakers

**Important access correction:** the current official documentation does not document the previously referenced `/v1/try/{sport_key}/odds` route. It documents `/v1/sandbox/...` as unauthenticated deterministic synthetic data. Sandbox output must be excluded from all provider, event, bookmaker, market and coverage evidence. The documented regular event/odds calls use API-key authentication. The previously captured provider-labelled MLB `/v1/try` response remains historical schema-only material: it is stale, outside OctaNet's six sports, and does not establish that the route is a supported current live-data path. No current target-sport event-market payload was captured. Reference: https://parlay-api.com/docs

### Corrected interpretation

- Public source-health reachability metadata: **PASS — metadata only**.
- Price-write/latest-state evidence in the 11 November ten-minute snapshot: **FAIL — 45/45 sources reported missing price writes**; do not interpret this as a global provider outage, but do not count it as market availability.
- Six-sport active-key visibility: **PARTIAL**; rugby visibility is NRL only in this snapshot.
- Complete global catalogue/pagination: **NOT TESTED**.
- Current target-sport event-market samples: **NOT TESTED**; documented synthetic sandbox is excluded.
- Account entitlement: **BLOCKED**; rights and prediction eligibility remain unchanged.

Quality Checks runs **#104–#107** all completed successfully on the successive documentation heads. Latest run **#107** (`42973819394`) passed on the PR head `a5fa01a15853c3727348b0033fd4d286bf8d6a0d`. Its single `Test, typecheck, and production build` job passed dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build. Runs #104, #105 and #106 also passed the same job/steps on their respective preceding documentation commits. This is software validation only; none of these runs tested provider entitlements, event/market availability, sporting evidence, identity/results or rights. Run #107: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42973819394

## Verification refresh — 12 November 2026 (public ParlayAPI snapshot and CI #108)

### Timestamped public source-health response

A fresh unauthenticated read of `https://parlay-api.com/v1/meta/source-quality` returned `generated_at_ms=1794454203532` (**2026-11-12 03:30:03.532 UTC**) for a ten-minute observation window. The response reported:

- `source_count_total=46`, `source_count_returned=40`;
- `pulse_only_source_count=46`, `archive_source_count=0`, `latest_state_source_count=0`;
- reachability classifications: 41 OK, 2 degraded, 2 breach, 1 stale, 0 missing;
- `price_write_counts`: 46 missing, 0 OK, 0 degraded, 0 breach and 0 stale.

The response's 40 returned count and 46 pulse-only count/list are not identical; preserve this as a response-level count discrepancy rather than assuming 46 detailed source records were returned. The health response is **PASS for timestamped reachability metadata only**. Price-write evidence is **FAIL for this ten-minute observation window (46 missing)**. This is not proof that every upstream bookmaker has no markets; it means this snapshot provides no recent price-write evidence for any listed source. It must not be counted as bookmaker availability.

Reference: https://parlay-api.com/v1/meta/source-quality

### Current active sport-key catalogue and bookmaker registry

The public `GET /v1/sports` response retrieved on 12 November lists active keys, while the current documentation defines this endpoint as keys with at least one event in the preceding 24 hours. Visible OctaNet examples remain uneven: soccer has many country/league keys; tennis includes ATP/WTA and French Open; basketball includes NBA/WNBA/NCAAB/EuroLeague; golf shows PGA Championship; cricket shows IPL and Test Matches; rugby shows NRL Rugby League only. No Rugby Union or Sevens key appeared in this snapshot. The response body carries no generation timestamp, and the endpoint documentation describes no pagination controls. It is an active-key snapshot, not a complete global competition master. Documentation advertises 90+ keys overall, but that does not prove all are active or available to an account today.

The current public bookmaker registry includes sportsbook, DFS, exchange and prediction-market integrations. Its `status: active` and `endpoints` describe configuration, not current data. Explicit `data_status: no_data` examples include Betway Mozambique and Bookmaker.eu; their registry presence is not a live offer. No registry row was reconciled to a current target-sport event and market.

References: https://parlay-api.com/v1/sports ; https://parlay-api.com/v1/bookmakers ; https://parlay-api.com/docs

### Event, market, pagination and identity contract review

The current documentation describes `/v1/sports/{sport_key}/events` as a zero-credit event-list endpoint deduped by `canonical_event_id`, with event ID, sport key, commencement time and home/away names. It does not document pagination parameters for `/v1/sports` or `/events`. The event endpoint was not successfully retrieved in this review; the web retrieval layer could not access the direct endpoint URL, and no HTTP status/body was obtained. Therefore actual upcoming-event samples remain **NOT TESTED**, not FAIL.

The regular odds endpoint is API-key authenticated and metered by markets and regions/bookmaker selection. No authorised key was available in this run, and no chargeable odds request was made. Documentation says `commence_time` can be null and carries `commence_time_reported`; bookmaker blocks expose `stale_seconds` and `last_update_ms` for the oldest price in that block, and a retained older price can be re-served for up to one hour with `topped_up=true`. These are useful parser/validation requirements, not verified observations from a live OctaNet market sample.

The props endpoint documents `limit`/`offset`, `x-next-offset`, `x-result-has-more`, `x-result-truncated` and `x-result-degraded`; none of those pagination paths or completeness headers was exercised. A completed page sequence would still not prove every upstream offer was captured. Global catalogue pagination remains **NOT TESTED**.

References: https://parlay-api.com/docs

### Verification status after this refresh

- Public source reachability metadata: **PASS — metadata only**.
- Price-write evidence in the 12 November ten-minute snapshot: **FAIL — 46 missing**; not a claim of universal upstream market absence.
- Active six-sport catalogue visibility: **PARTIAL**; rugby visible as NRL only; no exhaustive global catalogue.
- Bookmaker registry: **PARTIAL**; configured sources and explicit no-data rows visible, but no event-market reconciliation.
- Package/account entitlements: **BLOCKED**.
- Global catalogue pagination: **NOT TESTED**.
- Upcoming/completed event samples: **NOT TESTED**.
- Sport-specific evidence payloads, identity/timestamp reconciliation and independent results: **NOT TESTED**.
- Bookmaker/event/market/selection IDs and timestamps from a current target-sport offer: **NOT TESTED**.
- Data rights: **PARTIAL**; public documentation only, no OctaNet-specific written approval.
- Prediction eligibility: **BLOCKED**; odds remain market context only.

### GitHub software validation — 12 November 2026

Quality Checks **#108** (`42974026424`) completed successfully on the then-current PR head `023de00b8aca91b49736d035c6eb26852edd6193`. Its single `Test, typecheck, and production build` job passed setup, checkout, Node setup, dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build. This is software validation only. This report update is being committed after that run; CI for the resulting new documentation head must be checked separately.

Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42974026424
