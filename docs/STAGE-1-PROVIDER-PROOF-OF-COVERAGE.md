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


## 14. Additional odds-catalogue endpoint finding — 7 November 2026

A closer review of Sportradar's Odds Comparison documentation identifies a useful, more direct market-coverage test than relying on its general sports list:

- The **Sport Competitions** endpoint returns competitions for a sport that have available odds.
- Competition records include country/category, competition ID and name, and flags for pre-match markets, futures and player props.
- The endpoint documentation says the catalogue changes as competitions gain or lose odds coverage, with a five-minute cache TTL.
- This makes it a candidate for discovering the competitions that actually carry odds in the configured Sportradar Odds Comparison feed. It still does not prove that a particular event has a currently open market, that a desired market/selection exists, or that the account is entitled to all competitions.

Reference: https://developer.sportradar.com/odds/reference/oc-live-odds-sport-competitions

**Important product separation:** Sportradar's Odds Comparison API and Sportradar's sport-specific data APIs are separate products and must be tested independently. A competition appearing in the odds catalogue does not establish the availability or depth of sporting evidence for that competition. Conversely, a sport-specific schedule/statistics package does not establish bookmaker odds coverage.

### Updated comparison and interpretation

The Odds API's current public homepage advertises 100+ sports and 100+ bookmakers and describes broad coverage across soccer, basketball, cricket, tennis and selected golf and rugby-league competitions. Its examples include golf majors and NRL, but do not establish broad Rugby Union coverage or all six OctaNet sports at competition level. The detailed sports catalogue and the authenticated `/sports` response must be treated as the authoritative discovery starting points for an account; public marketing claims are not event-level proof.

Reference: https://the-odds-api.com/

This refines, but does not reverse, the earlier screening: The Odds API remains a market-feed candidate; Sportradar remains a sporting-data candidate and may also be evaluated as a distinct market-feed candidate through Odds Comparison. Neither is approved without account-specific catalogue, event/market samples, entitlements and rights evidence.

### Revised controlled test order

1. If a Sportradar account is available, enumerate its Odds Comparison sports and Sport Competitions endpoints first. Record each competition's country, ID, market/futures/player-props flags, retrieval time and account/package.
2. Separately export the Sportradar sport-specific Coverage Matrix for the same competitions and record schedules, results, statistics, lineups and play-by-play depth.
3. If The Odds API account is available, export its authenticated sports catalogue, then query upcoming events by sport and region. Record the returned bookmaker, market, selection and last-update timestamps.
4. Reconcile both market feeds independently to sports-event identities. Never infer that an event is bettable from a sport/competition catalogue alone.
5. Keep all six sports in the report. Where no supported event-market endpoint is demonstrated (notably broad golf match markets or Rugby Union in a given account), report the gap instead of silently substituting a different sport/code or market type.

## 15. Sportradar Odds Comparison Core — global bookmaker tier clarified (7 November 2026)

A review of the current Odds Comparison v2 documentation identifies an important distinction that was not explicit in the earlier screening: **OC Core is a global access tier**, configured on the API key, rather than simply assuming the default US-focused Odds Comparison coverage.

The public documentation states that OC Core uses a global Core Crawlers pipeline and can return data from **140+ global bookmakers** across a broad range of sports and competitions. Its documented sports include all six OctaNet target sports: soccer, basketball, golf, cricket, rugby and tennis. Coverage depth still depends on bookmaker feed availability. The documentation also distinguishes OC US (curated US-focused coverage) from OC Core (global coverage).

References:
- OC Core overview: https://developer.sportradar.com/odds/reference/oc-core-overview
- Odds Comparison v2 overview: https://developer.sportradar.com/odds/docs/oc-ig-overview
- Sport Competitions endpoint: https://developer.sportradar.com/odds/reference/oc-live-odds-sport-competitions

**Interpretation:** this materially strengthens Sportradar Odds Comparison as a global market-feed candidate and gives us a concrete package/tier to ask about. It does not establish that any particular OctaNet account has OC Core enabled, that every sport has useful markets, or that all countries/competitions/bookmakers are covered. The Sport Competitions and Books feeds for the actual key, followed by event-level market responses, remain mandatory. Sporting-data Coverage Matrix entitlements remain a separate test.

### Revised market-provider screening

- **Sportradar OC Core:** elevate to first global market-feed candidate for an entitlement/catalogue/sample test, because its documented global pipeline explicitly lists all six target sports and 140+ bookmakers.
- **The Odds API:** retain as a second market-feed candidate; test its authenticated sports and event catalogue, with golf and Rugby Union coverage gaps explicitly measured.
- Do not infer price competitiveness or recommend a purchase from public documentation. Request a written quote and exact bookmaker/sport/competition schedule before any commercial decision.


## 16. OC Core access, trial and commercial gate — 7 November 2026

The public access documentation now clarifies the practical route to an account-backed test:

1. **Create/use a Sportradar developer account and application.** API keys are available in the account's application credentials. The general account guide says many products can be trialled through the Sportradar Marketplace; standard trials are described as 30 days, with lower request limits than production. Trial availability is product-specific and must not be assumed for every Odds Comparison package.
2. **Request OC Core enablement explicitly.** OC Core is not the default OC US pipeline. Sportradar Support or the account representative must configure Core on the API key. Ask for a trial of OC Core and confirmation of the enabled packages (Prematch, Player Props, Futures and Live Odds) rather than assuming one trial automatically enables all four.
3. **Verify the key's actual pipeline.** The OC API returns an `X-Origin-Id` response header. `MARKET_ORIGIN_CORE_CRAWLERS` identifies OC Core; `MARKET_ORIGIN_MAGIC_CRAWLERS` identifies OC US. Record this header for each test run.
4. **Run read-only discovery first.** The API uses the `x-api-key` request header. Keep the key server-side and never put it in source code, browser bundles, chat, issue comments or Actions logs. Begin with the Books and Sports feeds, then Sport Competitions, and only then retrieve a small set of event/market samples.
5. **Treat Live Odds separately.** Current Live Odds documentation says this product is not available as a self-issued trial and requires access through a sales representative. Do not assume Live Odds is included in an OC Core trial or quote.
6. **Request a written commercial proposal.** No public OC Core price was found in the official documentation reviewed. Request a quote that itemises the Core access tier, each package, sports/competitions, bookmaker list and regions, request quotas/rate limits, refresh cadence, historical snapshots, support/SLA, trial length, and permitted internal modelling, storage, display, caching and derived-data use.

Official access references:
- API authentication, package-specific base URLs and shared discovery feeds: https://developer.sportradar.com/odds/docs/oc-ig-api-basics
- OC Core enablement, response header and supported sports: https://developer.sportradar.com/odds/reference/oc-core-overview
- OC Core access FAQ and trial request route: https://developer.sportradar.com/odds/reference/oc-core-faqs
- Sportradar Marketplace, trial access and standard trial terms: https://developer.sportradar.com/getting-started/docs/your-account
- Live Odds trial requires sales access: https://developer.sportradar.com/odds/reference/oc-live-odds-overview

### Access and pricing status

| Item | Publicly verified position | OctaNet status |
|---|---|---|
| OC Core pipeline | Support enables it at API-key level | NOT REQUESTED / NOT VERIFIED |
| Trial route | Ask account representative or Support to trial OC Core | NOT REQUESTED |
| Standard trial duration | General account guide says 30 days for standard trials; product exceptions apply | OC Core-specific duration NOT CONFIRMED |
| Live Odds trial | Not self-issued; sales representative required | NOT REQUESTED |
| Public OC Core price | No official public price located | QUOTE REQUIRED |
| Exact configured bookmakers | Available from the authenticated Books feed | NOT TESTED |
| Exact sports/competitions | Available from authenticated Sports and Sport Competitions feeds | NOT TESTED |
| Production rights and SLA | Must be confirmed in contract/quote | NOT REVIEWED |

**Decision:** Do not purchase or integrate on the strength of the public 140+ bookmaker claim. The next low-risk action is a no-obligation request for an OC Core trial and written quote, followed by a read-only catalogue test. If trial access is declined or the commercial terms are unsuitable, retain The Odds API as the alternative candidate and do not treat either vendor as approved.

### Support contact and trial-limit clarification

Sportradar's current OC Core Overview identifies `support@sportradar.com` as the 24/7 Support contact for requesting OC Core enablement on an API key. The OC Core FAQ likewise directs customers to their account representative or Support to request a trial.

The general Sportradar account guide currently describes default trial limits of **30 days, 1,000 requests per rolling 30 days and 1 query per second**. These are general API-trial defaults, not a confirmed OC Core-specific entitlement. Ask Support to confirm the actual OC Core and package-specific trial limits in writing. Live Odds remains a separate sales-mediated access request.

The support request should explicitly ask for:
- OC Core enablement and the `MARKET_ORIGIN_CORE_CRAWLERS` response-header confirmation;
- configured bookmaker names and bookmaker-country/region coverage;
- sports and full competition catalogue for soccer, tennis, basketball, golf, cricket and rugby;
- separate entitlement and trial status for Prematch, Player Props, Futures and Live Odds;
- trial quota, QPS, duration, endpoint access, market refresh cadence and historical snapshots;
- itemised pricing, support/SLA and written permitted-use terms for internal modelling, storage, caching, user display and derived data.

References:
- OC Core Overview and support contact: https://developer.sportradar.com/odds/reference/oc-core-overview
- OC Core FAQ: https://developer.sportradar.com/odds/reference/oc-core-faqs
- General account and trial limits: https://developer.sportradar.com/getting-started/docs/your-account

**Status remains NOT REQUESTED / NOT VERIFIED.** This documentation update is not evidence that Support has been contacted, a trial has been granted, or an API key has been configured.

## 17. Zero-subscription provider-selection policy — 7 November 2026

The project owner has confirmed that subscription spending is not affordable. **No paid provider or bookmaker subscription is to be pursued.** This policy supersedes the earlier OC Core trial/quote as the next execution priority.

| Candidate/source | Revised disposition |
|---|---|
| Sportradar OC Core | PAID-CANDIDATE / DEFERRED. No trial request, purchase or integration. Reconsider only if a genuinely no-cost, no-card, no-commitment trial is explicitly approved by the owner. |
| The Odds API | FREE-TIER CANDIDATE ONLY. Verify current free allowance, eligible sports/markets, geographic coverage and terms before any test; no paid upgrade or overage. |
| SportsDataIO | FREE-ACCESS STATUS UNKNOWN. Do not request or activate a paid package; investigate only documented no-cost access. |
| Official governing-body, league and tournament sources | PRIORITY CANDIDATES for schedules/results and sport-specific evidence, subject to permitted automated access and use terms. |
| Existing public/open datasets and archives | RESEARCH CANDIDATES. Validate licence, provenance, completeness and sport/competition scope; historical data is not a live market feed. |

### Required zero-cost controls

1. Record the exact free-tier allowance and whether a payment card is required before enabling an account or making requests.
2. Do not allow paid overages, auto-upgrades, recurring billing or trial-to-paid conversion.
3. Keep request volumes within the confirmed free quota; stop before a quota boundary if charges could result.
4. Check terms for automated access, attribution, storage, caching, internal modelling, display and redistribution.
5. Do not bypass logins, CAPTCHAs, paywalls, rate limits or other access controls.
6. For each sport, test event schedules/results and sporting evidence independently from bookmaker markets.
7. Mark bookmaker availability VERIFIED only from a lawful, timestamped source showing the actual event and market. Otherwise use NOT VERIFIED.
8. Preserve the six-sport worldwide discovery objective and publish gaps; free-source limitations are not grounds to invent coverage.
9. Do not use bookmaker odds as sporting evidence, features or a substitute for missing player/team statistics.
10. No production integration, model/training change, purchase or deployment is authorised by this policy.

### Revised Stage 1 execution

The next work item is a **free-source feasibility and coverage register**, organised by sport and by data class (events, sporting evidence, outcomes, bookmaker markets). Each entry must record source, endpoint, access method, authentication, free quota/cost, supported countries/competitions, pagination, freshness, sample evidence, licence/terms and gaps. Start with sources that can be tested without payment and without violating their terms. Keep unknown coverage NOT TESTED.

**Status:** zero-cost strategy approved as project direction; no free provider or bookmaker is approved until its actual access, coverage, data quality and rights pass the documented tests.

## 18. Zero-cost source screening update — 8 November 2026

This update refines the Stage 1 free-source shortlist using current official public documentation and terms. It does not add any authenticated API sample or production approval.

| Data class / sport | Candidate | Free-access evidence | Coverage/quality boundary | Decision |
|---|---|---|---|---|
| Event/evidence — soccer, tennis, basketball, cricket | SportScore | No-key REST API; ~10,000 requests/24h/IP; 8 GET endpoints; 60-second cache. Terms last updated 23 April 2026. | Four sports only; attribution badge required on every data-bearing surface; no SLA; source disclaims guaranteed accuracy; no bulk raw-feed redistribution. | **FREE CANDIDATE / SAMPLE NOT RUN** |
| Event/evidence — rugby | rugbyAPI | $0 forever, no card, Google sign-in; 50 lookups/day; free key has 11/31 endpoints and current-season depth. | Public page lists 42 competitions across club/international/sevens; sample pages show uneven detail and sparse Sevens history. Rugby League coverage and full account catalogue remain unverified. | **FREE CANDIDATE / KEY AND SAMPLE NOT RUN** |
| Bookmaker markets — multiple sports | The Odds API Starter | Official public page lists FREE, 500 credits/month, all sports, most bookmakers, all betting markets, no historical odds. | Payment-card requirement not stated. Public bookmaker regions list US/UK/EU/AU/CA/FR/SE/FI, not ZA. Public sport examples include Rugby League/NRL, not broad Rugby Union; golf examples are majors. Actual free-key `/sports`, bookmaker and event-market responses are untested. | **FREE MARKET CANDIDATE / KEY NOT REQUESTED** |
| Event/evidence — soccer | Football-Data.org | Anonymous competition/area lists: 100 requests/24h; registered free tier: 12 competitions, 10 requests/minute, delayed schedules/scores. | Soccer only, narrow fixed free competition set, delayed data and no free bookmaker market. | **FREE CANDIDATE / SAMPLE NOT RUN** |
| Event discovery — golf | tourdata.golf | No-key junior schedules/tours/courses; 100 requests/day/IP; paginated; commercial schedule use with attribution. | Junior schedules only; players, results, leaderboards and fields require partner key; event dates have no time/timezone; refresh is weekly/monthly. | **LIMITED SCHEDULE CANDIDATE / SAMPLE NOT RUN** |
| Historical evidence — cricket | Cricsheet | Actual archive parser audit: SA20 130/130 structural PASS; CSA T20 Challenge 314/314 REVIEW due 34 missing optional player_of_match values. | Historical completed matches only; not a fixture or market source. Rights attribution and independent semantic/result checks remain. | **HISTORICAL STRUCTURAL TEST COMPLETED / NOT PRODUCTION-APPROVED** |

### Required proof status

- Account/package entitlement: **BLOCKED** — no authorised keys or account exports.
- Global catalogue pagination: **NOT TESTED** — no complete API catalogue/cursor capture.
- Country/competition coverage: **PARTIAL** — public examples only, not exhaustive account coverage.
- Upcoming/completed API samples: **NOT TESTED** — no raw API event payloads captured.
- Historical samples: **PARTIAL** — Cricsheet parser audit is the only completed archive test.
- Sport-specific fields/null rates: **PARTIAL** — documentation only, no payload inspection.
- Event IDs, identity reconciliation and timestamp cutoffs: **NOT TESTED**.
- Independent result verification: **NOT TESTED**.
- Bookmaker/event/market/selection IDs and observed timestamps: **NOT TESTED**.
- Data rights: **PARTIAL** — public terms reviewed; no full legal/account-specific sign-off.
- Prediction eligibility: **BLOCKED** — no sport has passed all event, market, identity, evidence and rights gates.

### Zero-cost controls

Do not register for The Odds API until the free plan's payment-method requirement is confirmed as no-card. Do not create a rugbyAPI account or use a key without owner-authorised access. SportScore and tourdata.golf are public no-key candidates, but actual API samples still need to be captured through a permitted read-only test. Keep bookmaker odds strictly in the market-data class and never as sporting evidence or training features.

## 19. Additional free bookmaker API findings and rights gate — 8 November 2026

### TheRundown Free

- $0/no card; 20,000 data points/day and 200,000/month; one request/second; five-minute-delayed pre-match main lines from DraftKings, FanDuel and BetMGM.
- Free excludes props, alternate lines, in-play, WebSocket and odds history. Public sports catalogue shows soccer, basketball, tennis and cricket; rugby is not listed; golf futures are not included in Free.
- Free and Starter are internal/personal use only. Commercial end-user display starts at Pro ($149/month). This is a private evaluation candidate, not a free production odds feed for a customer-facing app.
- No key or event/market response was used.

References: https://therundown.io/api · https://therundown.io/free-sports-data-api · https://therundown.io/docs/quickstart

### ParlayAPI Free

- $0/no card; 1,000 credits/month; 30+ sources and 90+ sport keys advertised. Sport/event catalogue endpoints are documented as zero-credit; odds calls consume credits by markets/regions. Free historical lookback is 48 hours.
- Documented response fields include `canonical_event_id`, `commence_time`, `commence_time_reported`, `last_update_ms` and `stale_seconds`; these are validation targets, not sampled values.
- Terms last updated 14 October 2026 restrict Free to personal evaluation/non-commercial research. Customer-facing display, commercial derived products, resale, redistribution and sublicensing require a separate signed agreement. No customer-facing OctaNet use is approved under standard Free terms. Sandbox data is synthetic and excluded.
- No key/account or API response was used.

References: https://www.parlay-api.com/docs · https://www.parlay-api.com/free-sports-odds-api · https://www.parlay-api.com/legal/terms

### Odds-API.io and Unabated/Gambly

- Odds-API.io's current official pricing page says new free keys are paused indefinitely; it is not an obtainable free option.
- Unabated/Gambly free publisher access requires tracked deeplinks and monthly partner traffic targets and focuses on US operators; it is not a neutral global feed.

References: https://odds-api.io/pricing/free · https://unabated.com/odds-api/free · https://docs.unabated.com/guides/deep-links

### Decision

TheRundown is the clearest no-card private odds-evaluation option, but only three US books and selected sports, and the free licence does not permit customer-facing commercial display. ParlayAPI offers broader advertised sport keys and useful event/freshness fields, but its Free licence also excludes customer-facing/commercial use without a separate signed agreement. Neither proves worldwide six-sport bookmaker coverage. No account was created, no key was requested, and no live API sample was captured.

## 20. Public no-auth checks and TheRundown new-account stats evaluation — 9 November 2026

### TheRundown Free: a separate statistics test path

The current official pricing page documents a Free-plan statistics catalogue and fixed complete-game sample for schema inspection, plus a **no-card seven-day current-season statistics evaluation** for qualifying new accounts. The stated policy applies to accounts created on or after `2026-09-07T18:00:00Z`. This is separate from the Free odds entitlement: 20,000 odds data points/day, 200,000/month, one request/second, five-minute-delayed pre-match main lines from BetMGM, DraftKings and FanDuel. Free display rights are internal/personal only; commercial end-user display starts on Pro.

This makes TheRundown a potentially useful limited **sporting-data field-evaluation** source as well as a separate market-context feed. However, the public page does not establish which of the six OctaNet sports and competitions are included in the seven-day stats evaluation, and no account/sample was accessed. Keep stats and odds tests separate; no stats payload is currently verified.

Reference: https://therundown.io/pricing/api

### ParlayAPI: unauthenticated monitoring evidence and limits

A public `GET /v1/status` JSON response was retrieved with `as_of=2026-11-08T16:15:24.554441Z`, a 15-minute reporting window, and source-level rows/sports-covered/latest-age/SLA fields. A separate public `GET /v1/meta/source-quality` response reported 24 sources and source-quality classifications, generated at `2026-11-08T08:30:16.462Z`. Both were already stale at the 9 November review time (approximately 14h07m and 21h52m old respectively). They are actual public monitoring responses, but **not** current bookmaker event-market samples and not proof of geographic or competition coverage.

The no-auth `/v1/try/{sport_key}/odds` route is documented for only six keys: MLB, NBA, NFL, NHL, EPL and MMA. For OctaNet, that gives a possible public-preview route for basketball and soccer only; tennis, golf, cricket and rugby are absent from the documented try list. A direct provider-labelled MLB demo JSON payload was captured, but its event commencement (2026-10-29) and bookmaker observations (2026-10-28) are stale as of this review and outside OctaNet's six sports; it is schema-only evidence, not a current market test. No target-sport try payload was captured. Sandbox responses are synthetic and must never count as evidence.

The ParlayAPI Free tier is advertised at 1,000 credits/month, no card and real-time access. Its FAQ also uses the unit "requests/month" while the docs/pricing use "credits/month"; resolve this discrepancy before capacity planning. Free is personal evaluation/non-commercial research only. Customer-facing display, commercial derived products and redistribution require a separate signed agreement, and a paid self-serve tier alone does not grant those rights.

References:
- https://parlay-api.com/v1/status
- https://parlay-api.com/v1/meta/source-quality
- https://parlay-api.com/try
- https://parlay-api.com/docs
- https://parlay-api.com/limits
- https://www.parlay-api.com/legal/acceptable-use
- https://www.parlay-api.com/terms

**Evidence status:** public health metadata response = PARTIAL; event-market sample = NOT TESTED; account entitlement = BLOCKED; rights = PARTIAL; prediction eligibility = BLOCKED.


## 16. ParlayAPI public endpoint observations — 10 November 2026

Direct public endpoint retrieval adds limited, auditable evidence beyond documentation:

1. `GET /v1/meta/source-quality` returned a timestamped JSON snapshot generated at **2026-11-10T06:55:47.963Z**. It reported 31 sources (25 OK, 4 degraded, 2 breach, 0 stale/missing) and price-write classifications of 28 OK, 3 degraded, 0 breach/stale/missing. This is provider health telemetry only, not event-market coverage or sporting evidence.
2. `GET /v1/sports` returned an active-key catalogue snapshot. Visible target-sport entries included multiple soccer competitions across several countries, NBA/WNBA/NCAAB/EuroLeague, ATP/WTA/French Open, PGA Championship, IPL/Test cricket and NRL Rugby League. No Rugby Union or Sevens key was visible in this snapshot. The body did not include a generation timestamp, and pagination/account completeness were not established.
3. `GET /v1/bookmakers` returned a public registry with source/region/endpoint metadata. The `betway_mz` record was specifically scoped to Mozambique and TT Cup point-handicap markets; its `global` region label must not be interpreted as broad global coverage for OctaNet sports.
4. `GET /v1/try/baseball_mlb/odds` returned a provider-labelled demo payload with one MLB event, bookmaker, market, outcome and timestamp fields. The event commenced 2026-10-29 and its displayed bookmaker observations were 2026-10-28, so this was stale on 10 November and outside OctaNet's six sports. It is schema-only, not a current event-market test.

References:
- https://parlay-api.com/v1/meta/source-quality
- https://parlay-api.com/v1/sports
- https://parlay-api.com/v1/bookmakers
- https://parlay-api.com/v1/try/baseball_mlb/odds

### Assessment

The public catalogue provides a concrete, but uneven, six-sport screening signal. Soccer has the broadest visible competition list; basketball and tennis show several keys; golf is limited to PGA Championship; cricket shows IPL and Test Matches; rugby shows NRL only, with no Union/Sevens key visible. This is a snapshot of active provider keys, not proof of worldwide bookmaker coverage. No country/competition completeness or bookmaker/event matching test has passed.

The timestamped source-quality endpoint is **PASS for public metadata retrieval only**. The demo MLB tuple is **PARTIAL for response-schema inspection only**. All six target-sport current event-market tests remain **NOT TESTED**; account entitlements remain **BLOCKED**; prediction eligibility remains **BLOCKED**.


## 16. ParlayAPI public endpoint observations — 10 November 2026

Direct public retrieval added limited evidence beyond documentation:

- `GET /v1/meta/source-quality` returned a JSON snapshot generated at **2026-11-10T06:55:47.963Z** (`generated_at_ms=1794293747963`). It reported 31 sources: 25 OK, 4 degraded, 2 breach, 0 stale/missing. Price-write counts were 28 OK, 3 degraded, 0 breach/stale/missing. This is provider-health telemetry only.
- `GET /v1/sports` returned an active-key snapshot with broad soccer examples; basketball NBA/WNBA/NCAAB/EuroLeague; tennis ATP/WTA/French Open; golf PGA Championship; cricket IPL/Test Matches; and rugby NRL Rugby League. No Rugby Union or Sevens key was visible in this snapshot. The body had no generated-at timestamp; cache freshness and catalogue completeness are unverified.
- `GET /v1/bookmakers` returned a public source registry. The `betway_mz` record is specifically scoped to Mozambique and TT Cup point handicaps; its `global` region label is not evidence of six-sport global coverage.
- `GET /v1/try/baseball_mlb/odds` returned a provider-labelled demo payload containing an event ID/canonical ID, commence time, bookmaker, h2h market, outcomes/prices and last-update fields. Its event date was 2026-10-29 and bookmaker observations 2026-10-28, so it was stale on 10 November and outside OctaNet's six sports. Treat as schema-only, not current market evidence.

References: https://parlay-api.com/v1/meta/source-quality ; https://parlay-api.com/v1/sports ; https://parlay-api.com/v1/bookmakers ; https://parlay-api.com/v1/try/baseball_mlb/odds

**Assessment:** public health metadata retrieval = PASS (metadata only); public sport/bookmaker catalogue = PARTIAL; target-sport event-market samples = NOT TESTED; account entitlement = BLOCKED; identity and independent result verification = NOT TESTED; rights = PARTIAL; prediction eligibility = BLOCKED. Odds remain market context, never sporting evidence.

## 17. ParlayAPI public catalogue refresh — 10 November 2026

A direct public retrieval on 10 November refreshed three metadata surfaces:

1. `GET /v1/meta/source-quality` returned `generated_at=2026-11-10T06:55:47.963Z`: 31 sources (25 OK, 4 degraded, 2 breach, 0 stale/missing) and price-write classifications 28 OK, 3 degraded, 0 breach/stale/missing. This is a recent provider-health snapshot only. The source set includes DFS, exchanges and prediction-market sources, so its counts are not bookmaker coverage counts. Reference: https://parlay-api.com/v1/meta/source-quality
2. `GET /v1/sports` returned active-key examples for soccer, tennis, basketball, golf, cricket and rugby. Soccer has the broadest visible competition set; basketball includes NBA/WNBA/NCAAB/EuroLeague; tennis includes ATP/WTA/French Open; golf shows PGA Championship; cricket shows IPL/Test; rugby shows NRL. No Rugby Union or Sevens key was visible. The response has no generated-at timestamp and no pagination/completeness evidence. Reference: https://parlay-api.com/v1/sports
3. `GET /v1/bookmakers` returned a bookmaker registry with regions and endpoint/market metadata. Examples are tightly scoped: Betway Mozambique is TT Cup point-handicap only; Bookmaker.eu is NFL/MLB moneylines; BetOnline examples are NFL/college football/MLB; bet365 lists multiple regions but its sample paths are NFL. This registry is not proof of a current target-sport event offer. Reference: https://parlay-api.com/v1/bookmakers

The public docs describe no-auth `GET /v1/try/{sport_key}/odds` for EPL and NBA among six demo keys, but no actual EPL or NBA response was captured in this review. Current target-sport event-market sampling remains **NOT TESTED**.

GitHub Actions Quality Checks run **#101** (run ID `42772066003`) passed on PR head `9aee2121d778039263683228373fad13b7bcb2f1`: dependency installation, patched gRPC lock verification, dependency audit, unit tests, TypeScript and production build. This validates software only, not provider coverage.

**Assessment:** public health metadata = PASS (metadata only); public sports/bookmaker catalogues = PARTIAL; account entitlements = BLOCKED; catalogue pagination/completeness = NOT TESTED; six-sport event-market samples = NOT TESTED; identity/result verification = NOT TESTED; rights = PARTIAL; prediction eligibility = BLOCKED. Odds remain market context, never sporting evidence.

## 18. GitHub Actions verification update — 11 November 2026

Quality Checks run **#103** (run ID `42772921684`) completed successfully on the current PR head `e7b5a9a46bb0090853d14f03045ab1e12b06871f` on 10 November 2026 at 07:06:50 UTC. Its single job, `Test, typecheck, and production build`, passed all steps: setup, checkout, Node setup, dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build.

This supersedes the earlier #101 software-validation reference for the current PR head. It is repository CI evidence only. It does not prove provider/package entitlement, global event or bookmaker coverage, six-sport event-market samples, identity/timestamp reconciliation, independent results, sporting-evidence quality or data rights. All such statuses remain as separately recorded; no production or training gate is changed.

Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42772921684
