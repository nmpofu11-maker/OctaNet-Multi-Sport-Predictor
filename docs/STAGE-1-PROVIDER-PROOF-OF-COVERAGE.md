# Stage 1 — Provider Proof-of-Coverage

**Assessment date:** 2026-11-06  
**Status:** Documentation-based screening; no authenticated provider payloads or account entitlements verified  
**Related PR:** #11 — Six-sport data collection strategy  
**Purpose:** Decide which provider/competition combinations are worth a controlled sample-data test before any production adapter or subscription is approved.

> **Important:** A provider's product documentation is evidence that an API capability exists, not proof that a particular South African competition, season, field, or data-rights use is included in a specific account. No row below is marked production-approved.

> **Scope correction (7 November 2026):** This assessment must be read as a worldwide coverage investigation, not a South Africa-first launch gate. For each of soccer, tennis, basketball, golf, cricket and rugby, test the actual countries/competitions exposed by the provider account and the events/markets listed by configured bookmakers. The global target is defined in [GLOBAL-BETTABLE-EVENT-DISCOVERY-STRATEGY.md](GLOBAL-BETTABLE-EVENT-DISCOVERY-STRATEGY.md). South African rows below remain useful test examples only; they are not the complete or preferred event universe.

> **Critical distinction:** provider fixture coverage does not prove bookmaker market availability. A market listing does not prove sporting-evidence sufficiency. Capture both independently and never use odds as sporting evidence.

## 1. Executive finding

There is not yet sufficient evidence to approve one provider for all six sports and the complete first-release competition scope.

- **Sportradar** is the strongest documented multi-sport candidate across soccer, tennis, golf, cricket, and rugby, with basketball also listed in its general/league-specific product catalogue. It is a paid, package-specific candidate; exact competition coverage, history, fields, price, and rights must be checked in the account coverage matrix and contract.
- **SportsDataIO** documents NBA, soccer, and golf products, plus a Global API for competition/season discovery. The documentation reviewed does not establish BNL, Sunshine Tour, or the required coverage for the other sports.
- **Football-Data.org** is a useful low-cost soccer candidate for supported competitions and basic match/standing data. Its authenticated competition catalogue and plan permissions must be checked for the PSL, MTN8, Nedbank Cup, Carling Knockout, and UEFA Champions League before it is selected.
- **Cricsheet** is a useful historical cricket bulk-data candidate, not a live fixture/results provider. Its current download catalogue lists 23,241 matches and explicitly withholds 386 matches.
- **TheSportsDB** is already integrated for fixture discovery only. Its free-key limits make it unsuitable as the sole operational source for worldwide discovery.
- Official competition websites are valuable independent references for schedule/result reconciliation, but public web pages are not automatically API licences or permission for automated scraping.

**Decision:** No new provider adapter, subscription, or production data flow is authorised by this assessment. Proceed to controlled sample tests only after the user confirms available provider accounts/entitlements and permitted use.

## 2. Evidence labels

| Label | Meaning |
|---|---|
| Documented | Provider documentation describes the API/product or data type. |
| Account check required | Exact competition, season, field depth, package, quota, or historical availability must be checked in an authenticated account. |
| Sample not tested | No authenticated raw response has been captured and validated by this project. |
| Rights not confirmed | Storage, display, commercial use, caching, and redistribution rights have not been reviewed/approved. |
| Not established | The reviewed evidence does not establish the claimed coverage. This is not proof that the provider has no such data. |

## 3. Provider screening

| Provider / source | Relevant documented capabilities | Limitations / unresolved points | Screening decision |
|---|---|---|---|
| Sportradar | Soccer historical seasons/statistics; tennis schedules, scores, rankings, stats and 4,000+ competitions; golf tournament schedules, leaderboards, scorecards and historical tour data; cricket schedules, results, lineups, match statistics and ball-by-ball feeds; rugby competitions, seasons, lineups, results and team/player statistics. Basketball products appear in its league/general sports catalogue. | Separate packages and coverage tiers; actual competition availability must be checked in the interactive coverage matrix. Some sports/competitions have limited historical seasons or optional statistics. No account access, sample payload, quote, or rights review is available in this assessment. | **Primary multi-sport candidate for account-level proof**, not approved. |
| SportsDataIO | Documented NBA and soccer/golf products; Global API exposes competition, phase and season discovery. | Documentation reviewed does not establish BNL, Sunshine Tour, tennis, cricket, rugby, or complete target competition/field coverage. Confirm package-specific terms and historical depth. | **Secondary candidate** for NBA and selected soccer/golf comparisons. |
| Football-Data.org | Competition, season, match, team, standings and player resources; former-season match queries are documented. | Competition access is plan-gated. Historical standings and advanced player/stat fields are limited relative to specialist feeds. South African PSL/cup coverage not confirmed. | **Soccer-only candidate** for EPL/UCL and any South African competition actually present in the account catalogue. |
| Cricsheet | Downloadable historical ball-by-ball data in JSON/YAML and other formats; files can be filtered by match type, country, team, year and gender. | Historical dataset only; not a live schedule/results API. 386 matches are withheld. Verify attribution/licence and suitability for commercial use before import. | **Historical research candidate** for cricket only. |
| TheSportsDB | Existing OctaNet integration; day/league/season schedule endpoints and broad sport/event catalogue. | Free API limits vary by endpoint; docs state day schedule free limit 3 versus premium 1,500, season schedule 15 versus premium 3,000, and team next/previous free access only shows home events. Not a reliable authoritative evidence feed. | **Keep as discovery fallback only**; never promote its candidate event directly to evidence-eligible. |
| Official league/governing-body sites | Useful independent schedule, standings, leaderboard and final-result references for PSL, BNL, Sunshine Tour, CSA/SA20, SA Rugby/URC and international bodies. | Public pages do not establish API availability, bulk access, automated polling permission, or redistribution rights. | **Reconciliation references**, unless an explicit data feed/licence is obtained. |

## 4. Illustrative competition coverage matrix (not a whitelist)

All competition-level statuses below are **not yet verified**. Provider documentation alone does not prove coverage for the exact competition and season. These South African and international examples are illustrative test cases retained from the earlier research; they are not the global event universe, a South Africa-first priority order, or a whitelist. Worldwide scope is defined in `GLOBAL-BETTABLE-EVENT-DISCOVERY-STRATEGY.md`.

| Sport / competition group | Candidate source(s) to test first | What must be proven | Current decision |
|---|---|---|---|
| Soccer — Betway Premiership, Motsepe Foundation Championship, MTN8, Nedbank Cup, Carling Knockout | Sportradar Soccer; Football-Data.org; SportsDataIO Global; official PSL reference | Competition/season IDs; full fixture and final-result coverage; standings; team IDs; historical seasons; match statistics; kickoff timezone; rights | Discovery-only pending account catalogue and sample payload |
| Soccer — EPL and UEFA Champions League | Football-Data.org; Sportradar Soccer; SportsDataIO Soccer | Exact plan permissions, season depth, match IDs, results, standings, and required stats | Strong candidate set; no provider approved |
| Tennis — ATP/WTA singles and four Grand Slams | Sportradar Tennis; official tour/tournament data | Draws, rounds, player IDs, surface, rankings snapshots, match stats, retirement/walkover states, corrections, historical depth by competition tier | Strong documented technical candidate; account check required |
| Basketball — BNL men and women | Sportradar Basketball products; official BNL reference | Separate men's/women's competition IDs; full schedules, results, standings, team/player stats and historical seasons | Not established by reviewed vendor evidence; official reference only until proven |
| Basketball — NBA | Sportradar Basketball; SportsDataIO NBA; official NBA stats reference | Game/season IDs; schedules, box scores, standings, historical depth, roster/availability fields and rights | Strong candidate set; account/sample check required |
| Golf — Sunshine Tour | Direct Sunshine Tour feed/licence; Sportradar Golf only if the tour appears in coverage matrix | Event/field IDs; tee times; round and hole scores; cut/withdrawal status; leaderboard; historical seasons; data rights | Not established by reviewed Sportradar tour list; do not assume inclusion |
| Golf — PGA Tour, DP World Tour and four men's majors | Sportradar Golf; SportsDataIO Golf; official tour references | Event IDs; fields; tee times; rounds/scorecards; player statistics; historical depth; major championship coverage and rights | Strong documented candidate for PGA/DP World Tour; majors need event-by-event check |
| Cricket — Proteas men's internationals, SA20, CSA men's Division 1 formats | Sportradar Cricket; Cricsheet for historical matches; CSA/SA20 official references | Format-specific event IDs; scorecards; innings/overs/wickets; toss/XI; DLS; results; tournament tables; historical depth by format | Sportradar is documented for cricket, but SA20/CSA competition coverage is not confirmed; Cricsheet is historical only |
| Cricket — ICC men's senior events and IPL | Sportradar Cricket; Cricsheet where applicable; official ICC/IPL references | Competition/season IDs; match coverage levels; ball-by-ball/scorecards; player stats; result corrections; format boundaries | Strong documented candidate; verify exact events and tier |
| Rugby — Springbok men's internationals, URC, Currie Cup Premier Division | Sportradar Rugby Union; SA Rugby/URC/competition references | Competition/season/event IDs; team/player IDs; fixtures/results; lineups; boxscore flags; match statistics; history; rights | Strong documented technical candidate; exact South African competitions remain account-check items |
| Rugby — Six Nations and Rugby Championship | Sportradar Rugby Union; official competition references | Same checks as above, including season history and event coverage flags | Strong documented candidate; sample and rights not verified |

## 5. Sport-by-sport evidence and caveats

### Soccer

Football-Data.org documents competition catalogues, seasons, matches, teams, standings and player resources. The API returns the competitions available to an authenticated client, and permissions/plan tiers affect access. This makes an authenticated catalogue export the first low-effort test; do not infer PSL coverage from its general football catalogue.

Sportradar's soccer historical-data guidance says coverage varies by competition tier and season, and recommends checking the Seasons feed, Coverage Matrix and Season Info before retrieval. It notes that some competition history may reach 2007, but this is not a universal guarantee.

### Tennis

Sportradar's Tennis API documentation describes schedules, live scores, point-by-point timelines, rankings, player profiles, historical results and match statistics across more than 4,000 competitions. Coverage is tiered: Grand Slams and top ATP events have stronger coverage than lower-tier competitions; qualification rounds may have reduced coverage. The exact target competition and match coverage object must be inspected before selecting features.

### Basketball

SportsDataIO lists NBA and basketball products and documents a Global API competition/season catalogue. Sportradar also lists NBA and other basketball products in its API catalogue. Neither source reviewed here proves BNL men/women coverage. BNL's own published fixtures, standings and results can be used as a manual reconciliation reference, but an authorised machine-readable feed remains unproven.

### Golf

Sportradar documents PGA Tour historical data from 2013, DP World Tour from 2016, LPGA and other tours from later start dates, plus tournament schedule, leaderboard, scorecard and player-stat feeds. Its documented tour enum includes PGA, DP World Tour, LPGA, LIV, Champions and Korn Ferry, but the reviewed list does not establish Sunshine Tour coverage. Sunshine Tour must therefore be checked directly or via a separately licensed source.

### Cricket

Sportradar documents schedules, results, tournament seasons, lineups, summaries, standings, historical results and ball-by-ball data. Its upgraded Cricket v2 documentation specifically identifies official data for ICC, ECB and Caribbean Premier League; that statement does not establish SA20 or CSA coverage. Cricsheet provides historical ball-by-ball downloads, but it is not a live feed and has explicit withheld-match exclusions.

### Rugby

Sportradar documents Rugby Union, Rugby League and Sevens packages, with competition/season discovery, results, lineups, timelines and team/player statistics. Its Rugby FAQ explains that statistics vary by event coverage flags; some boxscore data is available only when the relevant coverage property is true. The Seasons endpoint documentation describes a maximum of three seasons in its season list response, so the historical retrieval workflow and actual target-season availability must be tested rather than assuming deep history.

## 6. Controlled sample-test protocol

Run this protocol for each provider/competition combination before writing an adapter.

1. **Entitlement:** record account/product tier, package, quota, and provider support confirmation for the exact competition.
2. **Rights:** record permitted use for internal modelling, user display, storage, caching, derived statistics, retention, and redistribution. If unclear, mark blocked.
3. **Catalogue:** retrieve the provider's competition and season list. Save the raw response and retrieval timestamp.
4. **Upcoming sample:** capture at least one upcoming event with stable event ID, participants, scheduled time and competition/season identifiers.
5. **Completed sample:** capture at least one completed event with final status and result.
6. **Historical sample:** retrieve at least one prior season and record earliest available date, event count and missing seasons.
7. **Evidence sample:** capture the actual sport-specific fields needed by the feature plan. Record null/missing fields rather than filling them.
8. **Corrections and edge cases:** inspect postponed/cancelled events and sport-specific cases such as tennis retirement/walkover, golf cut/withdrawal, cricket DLS/no-result, and rugby abandoned/postponed events.
9. **Identity:** test provider IDs, canonical mapping, participant aliases, duplicate ingestion, and same-participant events on different dates.
10. **Timestamp safety:** verify that every feature used for a pre-event prediction was observed before the prediction cutoff.
11. **Independent check:** compare final results with the official organiser or another approved source.
12. **Decision:** mark PASS, PARTIAL, or FAIL with test date, reviewer, exact package, source URLs, raw payload hashes, known gaps and rights evidence.

A test response from a trial account may prove schema and event availability, but it does not prove production quota, service-level guarantees, commercial rights, or production package coverage.

## 7. Proposed provider test sequence (coverage-led, worldwide)

To reduce cost and avoid signing up for six vendors, begin with the provider accounts and market feeds already available. The order below is a test workflow, not a South Africa-first coverage priority. For every sport, enumerate the actual global catalogue and bookmaker markets before narrowing to samples:

1. **Export existing provider entitlements first.** If no paid provider account is available, stop before any purchase and continue with public documentation only. For each of the six sports, enumerate the full country/competition catalogue and available bookmaker market feed before selecting event samples.
2. **Soccer:** enumerate Football-Data.org's authenticated global competition catalogue; compare available competitions and seasons with Sportradar's Soccer Coverage Matrix. Include EPL/UCL and South African competitions where actually available, without restricting discovery to them.
3. **Tennis:** enumerate available tours, countries, tournament tiers and seasons in the Tennis Coverage Matrix; include ATP, WTA and Grand Slams where covered, and verify tier and historical depth.
4. **Cricket:** enumerate international and domestic competition coverage across countries and formats; inspect SA20, Proteas and CSA formats where available, and separately evaluate Cricsheet's historical files and terms.
5. **Rugby:** enumerate Rugby Union, Rugby League and Sevens coverage worldwide; include URC, Currie Cup, Springbok tests, Six Nations and Rugby Championship where available, and record event-level coverage flags.
6. **Golf:** enumerate available tours and tournaments worldwide; check Sunshine Tour explicitly where relevant and evaluate PGA/DP World Tour and other covered tours separately.
7. **Basketball:** enumerate available leagues and countries; test NBA and BNL where relevant, and treat any league as unsupported until a reliable feed is demonstrated.

Do not purchase a multi-sport bundle solely because a provider advertises these sports. Obtain a quote against the exact competition list and required data categories first.

## 8. Current OctaNet implementation boundary

The current server integration remains TheSportsDB schedule discovery only. The endpoint returns candidate events and explicitly does not generate odds, rule scores or prediction evidence. It uses the public/demo key and an in-memory 12-hour cache. It does not provide durable raw-payload storage, ingestion-run history, canonical cross-provider identity, or verified outcomes.

Therefore, this assessment does **not** change application code or model behaviour. Keep the existing safeguards:

- Discovery candidates remain separate from prediction inputs.
- Do not treat a provider-listed fixture as evidence-eligible.
- No generated or guessed statistics, scores, odds, or synthetic live data.
- No AI-generated settlement as authoritative verification.
- No provider key in browser code, client bundles, logs, or commits.
- Preserve UNTRAINED startup, explicit training, provenance, and chronological holdouts.

## 9. Exit criteria for Stage 1

Stage 1 is complete only when:

- Every first-release competition has a named source and exact product/package.
- At least one upcoming and one completed sample payload have been captured for every approved competition.
- Historical depth and sport-specific field coverage are measured, not assumed.
- Stable event/participant identity and edge-case handling are tested.
- Data rights and intended-use permissions are documented.
- A PASS/PARTIAL/FAIL decision is recorded for each provider/competition pair.

Until then, the competition remains discovery-only or unsupported. No production adapter or training import should be enabled from this document alone.

## 10. Source documentation reviewed

- Football-Data.org API reference: https://www.football-data.org/documentation/api
- Football-Data.org quickstart: https://www.football-data.org/documentation/quickstart
- Sportradar general API coverage guidance: https://developer.sportradar.com/getting-started/docs/get-started
- Sportradar soccer historical data: https://developer.sportradar.com/soccer/docs/soccer-ig-historical-data
- Sportradar tennis overview: https://developer.sportradar.com/tennis/reference/overview
- Sportradar tennis coverage tiers: https://developer.sportradar.com/tennis/docs/tennis-ig-data-coverage-tiers
- SportsDataIO developer catalogue: https://sportsdata.io/developers
- SportsDataIO Global API: https://sportsdata.io/developers/api-documentation/global
- Sportradar golf historical data: https://developer.sportradar.com/golf/docs/golf-ig-historical-data
- Sportradar cricket overview: https://developer.sportradar.com/cricket/reference/cricket-overview
- Cricsheet downloads: https://cricsheet.org/downloads/
- Sportradar rugby statistics summary: https://developer.sportradar.com/rugby/reference/rugby-statistics-summary
- Sportradar rugby FAQ: https://developer.sportradar.com/rugby/reference/rugby-faqs
- TheSportsDB API documentation: https://www.thesportsdb.com/docs/api
- Official competition references are linked in FIRST-RELEASE-COMPETITION-SCOPE.md.


## 11. Global coverage interpretation

The competition examples in Section 4 are a starting test register only. They must not be treated as a whitelist or as the boundaries of OctaNet. Stage 1 should report coverage by sport, country, competition, date window, provider and bookmaker, including discovered fixtures, market-listed events, identity-reconciled events, evidence-eligible events and blocked events. A global search result is not complete unless its source catalogue, bookmaker set, time window, pagination and last successful retrieval are disclosed. Unknown coverage must be reported as unknown rather than inferred from a provider's marketing page.

The existing TheSportsDB integration remains fixture discovery only. It does not establish a bookmaker market and cannot make an event bettable by itself. Any future market-data source requires its own entitlement, rights and sample validation. Odds remain isolated from sporting evidence and model features.


## 12. Worldwide discovery and bookmaker-market proof

The coverage exercise is worldwide across soccer, tennis, basketball, golf, cricket and rugby. The competition examples in Section 4 are retained as concrete test cases only. They do not constrain discovery to South Africa, a set of major leagues, or the listed tournaments. For each sport, record the actual countries, competitions, seasons and event types exposed by the provider account. Separately record bookmaker market availability and its event/market identifiers, status and observation time. A fixture-only source cannot establish that an event is bettable; market odds cannot establish sporting form or evidence. Report catalogue pagination, date windows, freshness, bookmaker set and known coverage gaps so a partial response is never described as worldwide completeness.


## 13. Public bookmaker-catalogue comparison — 7 November 2026

**Assessment type:** public documentation/catalogue review only. No authenticated API requests, account entitlements, live event payloads, bookmaker identities for a particular event, commercial rights, or current market prices were verified. This section does not change any provider approval or production status.

### The Odds API — market-feed candidate

The provider's published sports catalogue states that coverage applies when a sport is in season and lists the following relevant catalogue groups:

| OctaNet sport | Publicly listed examples | Important qualification |
|---|---|---|
| Soccer | Numerous domestic and international leagues across Europe, the Americas, Asia and international competitions | The published list is not exhaustive proof of country-wide coverage. South African PSL/cup competitions were not visible in the reviewed catalogue. |
| Tennis | Named ATP and WTA tournaments, including selected Grand Slams and tour events | Coverage is tournament-specific; do not infer all ATP/WTA/ITF events from the general Tennis label. |
| Basketball | NBA, WNBA, NCAAB, WNCAAB, EuroLeague and Australia's NBL | Broad named coverage, but other countries/leagues remain unestablished until they appear in the live account catalogue. |
| Cricket | Named international and domestic competitions including ICC events, IPL, Big Bash, PSL, The Hundred and international formats | The catalogue lists markets, but the Scores & Results column is not marked for the listed cricket rows. This must not be mistaken for a verified results/evidence feed. |
| Golf | Masters, PGA Championship, The Open and US Open winner markets | These are outright-winner market entries, not evidence of broad round-by-round or head-to-head event-market coverage. |
| Rugby | Six Nations (Rugby Union) and NRL (Rugby League) | The published catalogue is narrow; it does not establish URC, Currie Cup, Rugby Championship or worldwide rugby coverage. |

**Screening decision:** retain The Odds API as a potential bookmaker-market discovery source, not as a sporting-evidence provider. Its public catalogue suggests useful coverage for soccer, tennis, basketball and cricket, but golf and rugby are materially narrower in the reviewed list. Every sport and competition still requires a live authenticated catalogue and event/market sample. The provider's own page says coverage is in-season; a catalogue row alone does not prove a current event has an available market.

### Sportradar — sporting-data candidate and separate betting products

Sportradar's developer documentation lists soccer, tennis, golf, cricket and rugby as popular sports, and global basketball among its general/league-specific basketball offerings. It explicitly says coverage varies by league, competition and event, and directs customers to its interactive Coverage Matrix to inspect package, tier and data category. The matrix exposes competition/season identifiers and coverage dimensions such as schedules, results, statistics, lineups and play-by-play.

Sportradar also documents separate Odds APIs (including live odds, pre-match, player props and futures). Therefore, the existence of a Sportradar sporting-data API for a sport must not be treated as proof that the relevant Sportradar odds product includes the same sport, competition, bookmaker or market. Evaluate the relevant sporting-data and odds packages independently.

**Screening decision:** retain Sportradar as a strong multi-sport sporting-data candidate for account-level proof. Use the Coverage Matrix to test exact competition/season and field depth, then separately verify any odds package if it is proposed for market discovery. No account-specific entitlement or event sample has been checked.

### Evidence and next test

Public source pages reviewed:

- The Odds API sports catalogue: https://the-odds-api.com/sports-odds-data/sports-apis
- The Odds API documentation: https://the-odds-api.com/liveapi/guides/v4/
- Sportradar developer overview: https://developer.sportradar.com/getting-started/docs/get-started
- Sportradar interactive Coverage Matrix: https://coverage-matrix.sportradar.com/

The next controlled test, once an authorised account is available, is to export the complete sports/competition catalogue, retain pagination and retrieval timestamps, then query a small sample of upcoming events for each sport and verify bookmaker, event ID, market ID, selection, market status and observed time. For Sportradar, export the selected package's competition/season coverage and the exact required sporting fields. Capture raw response hashes and rights evidence. Until those tests are completed, all account-level coverage remains **NOT TESTED** and all production decisions remain **BLOCKED**.
