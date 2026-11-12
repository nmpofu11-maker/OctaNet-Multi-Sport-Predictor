# Stage 1 — Public-Access Checks and Test Register

**Checked:** 2026-11-06  
**Branch:** docs/six-sport-data-collection-blueprint  
**Status:** Public documentation/catalogue checks only; no authenticated paid-provider samples tested.  
**Product scope:** Worldwide bettable-event discovery across all six supported sports; South Africa is included but is not the boundary or default priority.

This is an execution addendum to `STAGE-1-PROVIDER-PROOF-OF-COVERAGE.md`. It records what could actually be observed without assuming API credentials or purchasing a package. The checks below are limited public samples, not a complete global catalogue or bookmaker-market survey. See `GLOBAL-BETTABLE-EVENT-DISCOVERY-STRATEGY.md` for the governing worldwide scope.

## 1. Results from public-access checks

| Source | Public check performed | Observed result | What it proves | What it does not prove |
|---|---|---|---|---|
| Football-Data.org | Opened unauthenticated `GET /v4/competitions` catalogue | Response returned 192 competitions. The South Africa entry is **ABSA Premiership**, competition ID `2083`, with four available seasons; listed season is 2020-10-24 to 2021-05-30 and last updated 2021-04-17. | The public catalogue endpoint is reachable and the provider has a historical South African top-flight competition record. | It does not prove current Betway Premiership, current PSL cups, current season coverage, fixture/stat access without a token, or production rights. The historical entry is stale for current South African competition coverage. |
| Cricsheet | Opened the current public downloads index and inspected match-type and club-competition rows | The index lists 23,241 matches, with 386 matches withheld. It lists 314 CSA T20 Challenge matches, 1,243 IPL matches and 56 Mzansi Super League matches. | There is substantial public historical cricket data, including the listed South African T20 competitions. The data can be selected by match type, country, team, year and gender. | It does not prove live fixtures/results, CSA 4-Day or One-Day coverage, full Proteas coverage, current SA20 coverage, or that every file has the desired fields/quality. A downloaded archive and parsed sample still need testing. |
| Sportradar | Opened public developer documentation and interactive coverage matrix | Documentation identifies sport packages and says exact coverage varies by competition, season, tier and data category. The matrix requires selecting a package/tier and searching competitions; its public page did not expose a populated coverage result in the inspected view. | The matrix is the right source for account/package-specific competition and field checks. | No competition-level coverage is verified. No account entitlement, raw sample, quote or licence has been checked. |
| TheSportsDB | Opened current API documentation and terms | General rate limit is 30 requests/minute for free users; schedule endpoint result caps are much smaller (for example, 3 events for Schedule Day and 15 for Schedule Season). The current terms say app-store publication requires paid subscription. | The existing integration can remain a low-cost discovery/test source, subject to the applicable terms and attribution/licensing requirements. | It does not establish reliable complete coverage for the launch competitions or prediction-grade evidence. |

## 2. Updated findings and priority

### Soccer — Football-Data.org public catalogue is a limited historical sample

The public catalogue currently shows a South African **ABSA Premiership** record with only four available seasons and a last-updated date in April 2021. This is not sufficient evidence for current South African competitions. It also does not establish worldwide coverage. Keep Football-Data.org as a candidate only for the exact competitions returned by an authenticated catalogue/plan check; compare its global coverage with other permitted sources before any provider decision.

### Cricket — Cricsheet is a useful historical archive lead

The public index explicitly lists CSA T20 Challenge, IPL and Mzansi Super League archive groups. This makes Cricsheet worth a controlled download/parse test before paying for historical cricket data. It remains a historical dataset, not a live schedule or official settlement API. Before importing anything into OctaNet, check the current licensing page, preserve original file metadata, parse a small sample, and keep it in a staging corpus.

### Multi-sport — Sportradar remains a candidate, not a decision

Do not infer that a sport package covers the desired league. The exact competition, season, schedules, results, standings, player/team stats and live coverage flags must be read from the Coverage Matrix under the proposed package and tier. Ask for a written quote and data-rights terms against the worldwide competition coverage actually required, with coverage gaps stated explicitly.

### TheSportsDB — correct the operating assumptions

The current documentation shows both a general request rate and endpoint-specific free result limits. These are separate constraints. The endpoint limits make bulk season coverage unsuitable as the only source. The current terms also distinguish development use from app-store publication; OctaNet's intended deployment model must be checked against the paid-subscription and attribution requirements before public release.

## 3. Live test register

| Test ID | Source / scope | Status | Evidence captured | Next action |
|---|---|---|---|---|
| PUB-SOC-01 | Football-Data.org public competition catalogue | **PARTIAL** | 192 competition records; ABSA Premiership ID 2083, four seasons, last updated 2021-04-17 | Obtain token/account catalogue; check EPL/UCL and whether current South African competitions are available. |
| PUB-CRI-01 | Cricsheet public archive index | **PARTIAL** | 23,241 total; CSA T20 Challenge 314; IPL 1,243; Mzansi Super League 56; 386 withheld | Check licence, download one small CSA T20 archive, parse schema, date span, IDs, innings/ball fields and duplicates. |
| PUB-SPR-01 | Sportradar package and Coverage Matrix | **BLOCKED: account/package** | Public docs and matrix entry point only | Obtain package access or written provider coverage export and quote. |
| PUB-TSDB-01 | TheSportsDB public API docs/terms | **DOCUMENTATION CHECKED** | Rate limit and endpoint limits; app-store paid-subscription clause | Confirm OctaNet deployment/attribution requirements; do not use as evidence source. |
| LIVE-SAMPLES | Worldwide event and bookmaker-market coverage across all six sports | **NOT RUN** | No authorised provider account credentials or raw provider/market sample payloads supplied/available in this session | Run the controlled global catalogue and market-sample protocol when account access is confirmed. |

## 4. Required next local tests

These require downloading and inspecting actual archives or making authenticated API requests in the project environment. They are intentionally not represented as completed.

1. Download one Cricsheet CSA T20 Challenge JSON archive; record URL, retrieval time, file hash, archive contents, match count, earliest/latest date, competition labels, player/team IDs, innings/ball fields and withheld/duplicate handling.
2. Test a second historical format (one-day or Test) separately; never mix format-specific feature aggregates.
3. With an authorised Football-Data.org token, save the competition catalogue and check exact competition codes, plan tier, seasons, matches, standings and rate-limit headers.
4. With an authorised Sportradar account or written coverage export, check the worldwide competition catalogue and the exact competitions/markets required by the intended coverage, each required data category, historical seasons, event-level coverage flags, quotas and contract terms.
5. Do not commit API keys, raw secrets, personal account details or licensed raw datasets to Git. Store credentials in server-side environment configuration and retain only permitted test metadata/hashes in the repository.

## 5. Gate decision after public checks

- **No production event or bookmaker-market provider is approved.**
- **Cricsheet may proceed to a limited historical archive parsing test** after its current licence is reviewed. This does not authorise production training imports.
- **Football-Data.org cannot currently be relied upon for modern South African league/cup coverage** based on its public catalogue.
- **Sportradar requires account-level proof** before any purchase or implementation decision.
- **TheSportsDB remains fixture discovery only** and must not promote a candidate into prediction evidence.
- The app remains unchanged: no provider adapter, live polling, database, training corpus, model, or prediction logic has been modified.

## 6. Public references checked

- Football-Data.org public competitions endpoint: https://api.football-data.org/v4/competitions
- Football-Data.org API reference: https://www.football-data.org/documentation/api
- Cricsheet downloads and match counts: https://cricsheet.org/downloads/
- Cricsheet licensing: https://cricsheet.org/licensing/
- Sportradar developer getting started and coverage guidance: https://developer.sportradar.com/getting-started/docs/get-started
- Sportradar interactive Coverage Matrix: https://coverage-matrix.sportradar.com/
- TheSportsDB API documentation: https://www.thesportsdb.com/docs/api
- TheSportsDB terms: https://api.thesportsdb.com/docs_terms_of_use.php


## 7. Worldwide-scope interpretation

This register contains a small set of public checks and South African examples because those were the sources inspected in this audit. It is not a worldwide event list, a bookmaker-market catalogue, a ranking of target countries, or a first-release competition whitelist. The next coverage exercise must enumerate all available countries and competitions for each supported sport from the actual permitted provider accounts, then independently inspect configured bookmaker market listings. Report results and gaps by sport, country, competition, provider, bookmaker and date window. A source that exposes fixtures only (including the current TheSportsDB use) does not prove that those fixtures are offered for betting. No bookmaker odds may be used as sporting evidence.

## 8. Public bookmaker-catalogue findings — 7 November 2026

**Assessment type:** public documentation review only. These findings do not represent authenticated account calls, current event-market samples, verified account entitlements, commercial rights approval, or production coverage.

### The Odds API — market-feed candidate

The provider's public sports catalogue and homepage describe bookmaker odds across a broad range of sports, including soccer, tennis, basketball and cricket, with selected golf-major and rugby-league examples. The published examples do not establish complete worldwide competition coverage, broad golf matchup markets, or Rugby Union coverage. The provider's authenticated sports catalogue and actual event responses remain the required account-level test.

- Documentation/catalogue: https://the-odds-api.com/sports-odds-data/sports-apis
- API guide: https://the-odds-api.com/liveapi/guides/v4/

### Sportradar Odds Comparison — separate market-feed candidate

The Odds Comparison **Sport Competitions** endpoint is a more direct public-documented route to enumerate competitions for a sport that have available odds. Its competition records include country/category, competition ID/name and indicators for pre-match markets, futures and player props. The documented catalogue is dynamic and has a five-minute cache TTL.

This is a competition-level market-catalogue signal only. It does not prove that a specific upcoming event currently has an open market, that a desired market or selection is offered, or that a particular account is entitled to every listed competition. Sportradar Odds Comparison must be tested separately from its sport-specific data APIs and Coverage Matrix.

- Sport Competitions endpoint: https://developer.sportradar.com/odds/reference/oc-live-odds-sport-competitions
- Sportradar Coverage Matrix: https://coverage-matrix.sportradar.com/

### Register updates

| Test ID | Source / scope | Status | Evidence captured | Next action |
|---|---|---|---|---|
| PUB-ODDS-01 | The Odds API public sports catalogue and API guide | **DOCUMENTATION CHECKED** | Publicly documented broad sport catalogue and selected competition examples; no authenticated response or event/market payload | With authorised access, export the complete account-visible sports catalogue and query upcoming events by sport/region; record bookmaker, event, market, selection and update timestamps. |
| PUB-SPR-ODDS-01 | Sportradar Odds Comparison Sport Competitions endpoint | **DOCUMENTATION CHECKED** | Endpoint documents odds-bearing competition discovery and pre-match/futures/player-props flags; no account response or entitlement verified | With authorised access, enumerate sports and competitions; preserve country, IDs, flags, retrieval time, package and pagination; then query event-level markets. |

### Gate interpretation

- These public findings improve the test plan; they do **not** change the existing **LIVE-SAMPLES: NOT RUN** status.
- Keep Sportradar sport-data coverage and Sportradar Odds Comparison market coverage as separate verification tracks.
- Keep The Odds API as a market-feed candidate only; it is not a sporting-evidence source.
- A competition catalogue entry is not an event-level market, and an event-level market is not verified sporting evidence.
- No provider, bookmaker, subscription, production adapter, model, or training flow is approved by these documentation checks.

## 9. Sportradar OC Core global odds tier — 7 November 2026

A further public-documentation check found that Sportradar Odds Comparison has two materially different access tiers. **OC Core** is configured on the API key and uses a global bookmaker pipeline; the public documentation describes 140+ global bookmakers and lists soccer, basketball, golf, cricket, rugby and tennis among supported sports. OC US is a curated US-focused tier and should not be used as a proxy for OC Core coverage.

- OC Core overview: https://developer.sportradar.com/odds/reference/oc-core-overview
- Odds Comparison v2 overview: https://developer.sportradar.com/odds/docs/oc-ig-overview

This is stronger public evidence for a six-sport global market-feed candidate, but not proof of account entitlement, actual competition availability, event-level markets, or rights. The existing PUB-SPR-ODDS-01 test must explicitly request and record the access tier (OC Core vs OC US), configured bookmaker set, all six sport catalogues, competition flags and event-level market samples. Keep sporting-data API/Coverage Matrix checks independent.

| Test ID | Source / scope | Status | Evidence captured | Next action |
|---|---|---|---|---|
| PUB-SPR-CORE-01 | Sportradar Odds Comparison OC Core public documentation | **DOCUMENTATION CHECKED** | OC Core described as global pipeline with 140+ bookmakers and support listing across all six target sports; no account entitlement or raw response | Ask whether OC Core can be enabled on the authorised account; export Books, Sports and Sport Competitions feeds, then verify upcoming event markets for each sport. |

## 10. Zero-cost source shortlist — 7 November 2026

**Review type:** public documentation review only. No authenticated provider calls, live bookmaker-market requests, production ingestion or licence approval were performed. A source being advertised as free does not automatically make it suitable for OctaNet's intended deployment.

| Sport / data class | Free candidate | Publicly documented access | Limits and assessment | Register status |
|---|---|---|---|---|
| Soccer — fixtures/results | Football-Data.org | Free plan listed at €0; 12 competitions, delayed scores/schedules, fixtures and tables; 10 calls/minute. | Competition scope is restricted; public coverage page lists selected leagues and international competitions. No worldwide completeness and no bookmaker market feed. | FREE CANDIDATE / SAMPLE NOT RUN |
| Soccer, basketball, cricket, tennis — fixtures/results/stats | SportScore | Public docs describe free REST JSON, no key, ~10,000 requests/24h/IP, including live scores, historical fixtures, standings, scorers and player stats. | Attribution/backlink required. Independently test sport/competition catalogue, identifiers, freshness, pagination, reliability and exact terms before use. It does not establish bookmaker markets. | FREE CANDIDATE / SAMPLE NOT RUN |
| Multi-sport metadata / events | TheSportsDB | Free API; 30 requests/minute. | Endpoint-level free limits can be very restrictive (e.g. one result for some search endpoints); current terms prohibit app-store publication unless paid subscriber. Do not treat as a free production-app solution without confirming intended distribution and rights. | FREE RESEARCH CANDIDATE / DEPLOYMENT RIGHTS RESTRICTED |
| Cricket — historical ball-by-ball | Cricsheet | Public JSON/YAML/CSV/XML downloads; current download page lists 23,241 matches. | Historical archive only, not live schedules or bookmaker markets. Preserve ODC-BY/format-specific licensing, withheld-match and completeness caveats. Existing OctaNet archive audits remain separate evidence. | HISTORICAL RESEARCH CANDIDATE |
| Cricket — fixtures/results | Play-Cricket Match Summary API | Official documentation describes fixture and result-summary endpoints using a site ID and API token. | Token/account access and permitted scope/cost not yet established; coverage is site/competition scoped, not a global cricket feed. | ACCESS / TERMS NOT VERIFIED |
| Golf — tournament schedules | tourdata.golf | Open schedule/tour/course endpoints, no key; 100 requests/day/IP; attribution required. | Public scope is junior golf tournament schedules, tours and courses. Player, results, leaderboard and roster/field data require partner API key; not a free professional-tour evidence feed. Refresh is weekly for new events and monthly for full schedule refresh. | LIMITED FREE SCHEDULE CANDIDATE |
| Golf — pro tour data | DataGolf | Public API access page documents schedule and player/stat endpoints. | API key required; no zero-cost entitlement established in this review. Do not activate a paid plan. | FREE ACCESS NOT VERIFIED |
| Rugby Union/League/Sevens — fixtures/results | rugbyAPI | Free key advertised at $0 forever, no card; current/upcoming fixtures, results, tables and competition catalogue; 50 lookups/day. Competition catalogue distinguishes Union, League and Sevens. | Historical archive, extended lineups/timelines and analytics require paid plans. Verify each competition's current free coverage and terms; no bookmaker markets. | FREE CANDIDATE / SAMPLE NOT RUN |
| Tennis — schedules/results | Official ATP/WTA/ITF public pages; third-party APIs require separate review | Public schedule/results pages can be used for manual spot verification where terms permit. | No official, unrestricted, free global API entitlement was verified in this review. Avoid unofficial scraping or assuming third-party API free tiers are stable/licensed. | FREE AUTOMATED FEED NOT VERIFIED |
| Golf/rugby/tennis — bookmaker markets | No suitable source approved | None verified in this review. | No event-level bookmaker market feed across all six sports has passed a free-access and rights test. | NOT VERIFIED |

### Official/public references checked

- Football-Data.org free coverage: https://www.football-data.org/coverage
- Football-Data.org pricing and free limits: https://www.football-data.org/pricing
- SportScore developer access and terms: https://sportscore.com/developers/
- TheSportsDB API docs: https://www.thesportsdb.com/docs_api
- TheSportsDB terms: https://api.thesportsdb.com/docs_terms_of_use.php
- Cricsheet downloads: https://cricsheet.org/downloads/
- Play-Cricket Match Summary API: https://play-cricket.ecb.co.uk/hc/en-us/articles/360000130385-Match-Summary-API
- tourdata.golf API, access and usage terms: https://www.tourdata.golf/docs
- DataGolf API access: https://datagolf.com/api-access
- rugbyAPI free pricing: https://rugbyapi.com/pricing
- rugbyAPI competition catalogue: https://rugbyapi.com/documentation/competitions/list
- ATP/WTA/ITF official public schedules should be checked competition-by-competition; no unrestricted official API is claimed here.

### Immediate test priority

1. Test SportScore's public catalogue and one upcoming plus one completed event for soccer, basketball, cricket and tennis; verify IDs, timestamps, scores, pagination, attribution and terms.
2. Test Football-Data.org's free competition catalogue independently and record the exact 12-completion limit and delayed-data fields.
3. Test rugbyAPI's no-card free key only if account creation is genuinely free; inspect Union, League and Sevens catalogue rows and one upcoming/completed sample within the 50-lookups/day limit.
4. Test tourdata.golf schedules as a junior-golf-only discovery source; do not represent it as professional tour coverage or sporting evidence.
5. Keep Cricsheet as historical cricket research; do not re-run archive downloads unless a specific audit gap requires it.
6. Continue searching for lawful, genuinely free tennis and professional golf event/evidence sources.
7. Search for a free bookmaker-market source separately. Do not infer market availability from any event provider.

**No source in this section is approved for production or prediction eligibility.** These are research candidates only; actual samples, quality and rights remain to be verified.

## 11. Free-source documentation findings and test register — 8 November 2026

**Review type:** public documentation/terms review only. No API keys were created or used and no raw API event or bookmaker-market response was captured.

| Test ID | Source / scope | Status | Public evidence checked | Remaining test |
|---|---|---|---|---|
| PUB-SPORTSCORE-01 | SportScore public REST API, football/basketball/cricket/tennis | **DOCUMENTATION CHECKED** | No key; approx. 10,000 requests/24h/IP; eight GET endpoints; 60-second edge cache; visible dofollow attribution required. Terms allow qualifying commercial use with badge, caching and derived products; no bulk raw-feed redistribution; no SLA/accuracy guarantee. | Obtain actual match, team, standings and player-stat payloads for each sport; record IDs, timestamps, null rates, pagination/coverage and independent result checks. |
| PUB-RUGBYAPI-01 | rugbyAPI free key and public coverage | **DOCUMENTATION CHECKED** | $0 forever/no card, Google sign-in, 50 lookups/day, 11/31 endpoints, current-season results/tables and upcoming fixtures; public page advertises 42 competitions across club/international/sevens. | Owner-authorised free key required; then export competitions, Union/League/Sevens types, countries, pagination and upcoming/completed match samples. Do not assume Rugby League coverage from the product label. |
| PUB-ODDS-FREE-01 | The Odds API Starter free bookmaker-market tier | **DOCUMENTATION CHECKED** | Official page advertises $0, 500 credits/month, all sports, most bookmakers, all betting markets, no historical odds. Terms allow app display/storage/derived data but prohibit standalone raw-feed resale. | Payment-card requirement is not stated; do not register until no-card status is confirmed. If confirmed, export `/sports`, bookmakers and region codes, then sample event/market/selection IDs and `last_update`. |
| PUB-TOURDATA-01 | tourdata.golf open junior schedules | **DOCUMENTATION CHECKED** | No-key schedules/tours/courses; 100 requests/day/IP; offset pagination and permanent UUIDs; commercial schedule use with attribution; weekly new-event and monthly full refresh. | Capture permitted paginated schedule response and validate dates, `updated_at`, UUIDs and country/tour scope. Player/results/fields require partner access and remain out of free scope. |
| PUB-FDO-FREE-01 | Football-Data.org anonymous/free soccer catalogue | **DOCUMENTATION CHECKED** | Anonymous access: 100 requests/24h, area/competition lists only. Registered free tier: 12 competitions, 10 requests/minute, delayed scores/schedules and tables. | If a no-card token is available, export free competition codes and sample fixtures/results. No free odds entitlement is established. |

### Cross-source status ledger

| Required proof | Status | Reason |
|---|---|---|
| Account/package entitlements | **BLOCKED** | No authorised account keys or package exports. |
| Global catalogue pagination | **NOT TESTED** | Public pages do not replace complete API catalogue pagination/cursor evidence. |
| Country/competition coverage | **PARTIAL** | Public examples and catalogues only; no full account-level six-sport export. |
| Upcoming/completed API event samples | **NOT TESTED** | No raw API responses captured. |
| Historical samples | **PARTIAL** | Cricsheet structural audit only; other free-tier history is limited or untested. |
| Sport-specific field quality/null rates | **PARTIAL** | Documentation describes endpoints/fields, but no payload-level inspection. |
| Event identity/timezone/timestamp checks | **NOT TESTED** | No cross-source reconciliation or cutoff tests. |
| Independent completed-result verification | **NOT TESTED** | No independent official-source reconciliation in this run. |
| Bookmaker/event/market/selection IDs and timestamps | **NOT TESTED** | No actual event-market response or configured bookmaker list. |
| Rights and permitted use | **PARTIAL** | Public terms reviewed; no complete legal/account-specific approval. |
| Prediction eligibility | **BLOCKED** | No sport has passed all required gates. |

### Important market-feed interpretation

The Odds API free plan is now a concrete zero-price market-feed candidate, but its public region list does not include a South Africa-specific region, and its public sport examples do not establish broad Rugby Union or professional golf matchup markets. The free tier's actual book set and sport catalogue are not known until an authorised key is used. A fixture source such as SportScore, rugbyAPI, Football-Data.org or tourdata.golf never proves that a bookmaker has a market on that event.

No provider/bookmaker is approved. All rows remain documentation-only until the specified samples are captured and independently checked.

## 12. Additional no-card bookmaker API screening — 8 November 2026

**Documentation only; no keys or API samples used.**

| Test ID | Provider / plan | Publicly documented free access | Licence / coverage boundary | Status and next action |
|---|---|---|---|---|
| PUB-RUNDOWN-FREE-01 | TheRundown Free odds API | $0/no card; 20,000 data points/day and 200,000/month; one request/sec; five-minute-delayed pre-match moneyline/spread/total from DraftKings, FanDuel and BetMGM. | Internal/personal use only. Commercial end-user display starts at Pro ($149/month). Public catalogue lists soccer, tennis, basketball and cricket; rugby is not listed; golf futures are not a Free feature. No props, alternate markets, in-play or historical odds. | **DOCUMENTATION CHECKED / NO ACCOUNT OR SAMPLE**. Private evaluation only; not production/public display. |
| PUB-PARLAY-FREE-01 | ParlayAPI Free odds API | $0/no card; 1,000 credits/month; 30+ sources and 90+ sport keys advertised. Sport/event catalogue endpoints are zero-credit; odds calls consume credits. Free historical lookback is 48 hours. | Free terms permit personal evaluation/non-commercial research only. Public/customer-facing use, commercial derived products, resale and redistribution require a separate signed agreement. Sandbox data is synthetic and excluded from evidence. | **DOCUMENTATION CHECKED / ACCOUNT AND SAMPLE NOT RUN**. Internal evaluation only after owner authorisation; not approved for OctaNet production. |
| PUB-ODDSIO-PAUSE-01 | Odds-API.io free tier | Public plan advertises 100 requests/hour, 500/day, two recreational books and 34 sports, no card. | Official current pricing page says new free keys are paused indefinitely; existing keys only. Paid entry plan is £49/month. | **NOT AVAILABLE TO NEW ACCOUNTS**. Do not use as a zero-cost path. |
| PUB-UNABATED-FREE-01 | Unabated/Gambly publisher API | Free publisher route advertises no-card access and US operator odds. | Requires tracked deeplinks and monthly partner traffic targets; not a neutral worldwide bookmaker feed. | **CONDITIONAL / NOT A GLOBAL CANDIDATE**. No partner arrangement or sample. |

### Required-proof status after this review

- Account/package entitlements: **BLOCKED** — no authorised keys/account exports.
- Global catalogue pagination: **NOT TESTED** — no complete account-level catalogue export.
- Country/competition coverage: **PARTIAL** — public sport/league examples only, not an exhaustive country/competition map.
- Upcoming/completed API samples: **NOT TESTED** — no raw event response.
- Historical samples: **PARTIAL** — Cricsheet structural audit only; ParlayAPI Free history is capped at 48 hours and was not queried.
- Sport-specific fields: **PARTIAL** — schemas documented, but no payload/null-rate inspection.
- Identity/timestamp reconciliation: **NOT TESTED** — documented ParlayAPI canonical IDs and event/book timestamps are not validation until sampled.
- Independent result verification: **NOT TESTED**.
- Bookmaker/event/market/selection IDs and observed timestamps: **NOT TESTED** — no actual market response.
- Data rights: **PARTIAL** — public terms reveal material limits; no complete legal review or production licence.
- Prediction eligibility: **BLOCKED**.

Keep odds exclusively in the market-data layer. They are not evidence of form, strength, player/team statistics or prediction features.

## 13. New public endpoint and statistics-evaluation checks — 9 November 2026

**Review type:** official documentation review plus two public unauthenticated ParlayAPI monitoring endpoint reads. No account was created, no API key was used, and no event-market payload was captured.

| Test ID | Source / scope | Status | Evidence captured | Remaining test |
|---|---|---|---|---|
| PUB-RUNDOWN-STATS-01 | TheRundown Free stats catalogue/sample and new-account evaluation | **DOCUMENTATION CHECKED** | Current pricing page documents a fixed complete-game schema sample and a no-card seven-day current-season stats evaluation for qualifying accounts created on/after 2026-09-07T18:00:00Z. | With owner-authorised qualifying account access, capture actual sport/competition catalogue, stats fields, IDs, event timestamps, null rates and one completed-game sample; verify rights and expiry. |
| PUB-PARLAY-HEALTH-01 | ParlayAPI public `GET /v1/status` and `/v1/meta/source-quality` | **PARTIAL — PUBLIC METADATA RESPONSE RETRIEVED** | `/v1/status` returned source-level rows, sports-covered, age and SLA fields, as of 2026-11-08T16:15:24.554441Z. `/v1/meta/source-quality` returned `source_count_total=24` (9 OK, 9 degraded, 5 breach, 1 stale; price-write counts 14 OK, 7 degraded, 3 breach, 0 stale/missing), generated 2026-11-08T08:30:16.462Z. Both snapshots were stale at the 9 Nov review time. | Repeat at a fresh time; compare source-health and parser-coverage endpoints; do not infer event-market availability from health metadata. |
| PUB-PARLAY-TRY-01 | Alleged ParlayAPI no-auth `/v1/try/{sport_key}/odds` preview | **NOT TESTED** | Current official docs do not document this route; no current target-sport response was captured. A previous stale MLB provider-labelled payload is schema-only. | Do not rely on this route as a supported live preview. Obtain an authorised API-key response or fresh official documentation for a real-data public endpoint. |

### Updated cross-source status ledger

| Required proof | Status | Reason |
|---|---|---|
| Package/account entitlements | **BLOCKED** | No authorised account keys, account export or package entitlement evidence. |
| Global catalogue pagination | **NOT TESTED** | No complete account-level sports/bookmakers/competitions pagination capture. |
| Country/competition coverage | **PARTIAL** | Public documentation and examples only; no exhaustive account-level six-sport catalogue. |
| Upcoming/completed event API samples | **NOT TESTED** | One provider-labelled MLB no-auth demo response was captured, but it is stale and outside OctaNet's six sports; no current target-sport event/market response was captured. |
| Historical samples | **PARTIAL** | Cricsheet structural audit only; provider historical endpoints not queried. |
| Sport-specific evidence fields/null rates | **PARTIAL** | TheRundown stats evaluation documented, but no account payload/field inspection. |
| Event identity/timezone/timestamp checks | **NOT TESTED** | No cross-source reconciliation or cutoff validation. |
| Independent completed-result verification | **NOT TESTED** | No event result independently reconciled. |
| Bookmaker/event/market/selection IDs and observed timestamps | **NOT TESTED** | Only the stale MLB demo supplied a bookmaker/event/market/outcome tuple; no current six-sport event-market tuple was captured. |
| Rights and permitted use | **PARTIAL** | Public terms reviewed; no complete legal/account-specific approval. ParlayAPI Free is non-commercial; TheRundown Free is internal/personal use. |
| Prediction eligibility | **BLOCKED** | No sport has passed all required event, market, identity, evidence, timestamp and rights gates. |

### Important separation

- TheRundown's new-account stats evaluation is a sporting-data/evidence-field test path; its three-book delayed odds feed is a separate market-context path.
- ParlayAPI's public health metadata is a provider-monitoring signal, not proof that any specific fixture has a currently open market.
- ParlayAPI's no-auth try preview is documented for only two of OctaNet's six target sports; the other four remain uncovered by that public preview route.
- Odds and implied probabilities remain market context only and never substitute for form, statistics, strength evidence or prediction features.
- The global six-sport scope remains the objective; the documented free routes do not establish complete global coverage.


## 10. Public ParlayAPI endpoint test register — 10 November 2026

| Test ID | Endpoint / scope | Status | Evidence captured | Limitation / next action |
|---|---|---|---|---|
| PUB-PARLAY-HEALTH-01 | Public `GET /v1/meta/source-quality` | **PASS — metadata retrieval only** | JSON generated 2026-11-10T06:55:47.963Z; 31 sources; SLA 25 OK / 4 degraded / 2 breach; price-write 28 OK / 3 degraded | Operational telemetry only; not an event or bookmaker-market sample |
| PUB-PARLAY-SPORTS-01 | Public `GET /v1/sports` active sport-key catalogue | **PARTIAL** | Snapshot includes examples for all six broad sport categories; soccer broadest, rugby only NRL visible | Body has no generated-at timestamp; cache age not controlled; no pagination or account-completeness proof |
| PUB-PARLAY-BOOKS-01 | Public `GET /v1/bookmakers` registry | **PARTIAL** | Registry includes bookmaker/source keys, regions and supported endpoint/market metadata; Betway Mozambique entry is explicitly TT Cup-only | Registry status is not a current event offer; no complete book-to-event market reconciliation |
| PUB-PARLAY-DEMO-01 | Public `GET /v1/try/baseball_mlb/odds` | **PARTIAL — schema only** | One provider-labelled demo event includes event ID, canonical ID, commence time, bookmaker, h2h market, outcomes/prices and last-update fields | MLB is outside OctaNet's six sports; event/observations dated 28–29 Oct and stale on 10 Nov; not a live market test |
| PUB-PARLAY-EVENTS-6S-01 | Current upcoming events and market payloads for soccer, tennis, basketball, golf, cricket and rugby | **NOT TESTED** | No target-sport event-market response captured | Requires authorised access or a working permitted no-auth target-sport sample |
| PUB-PARLAY-IDENTITY-01 | Event/bookmaker/market/selection identity and timestamp reconciliation | **NOT TESTED** | Demo schema shows fields but no independent identity match was run | Reconcile against an independent sports event source and preserve exact observation times |
| PUB-PARLAY-RIGHTS-01 | Permitted use / commercial rights | **PARTIAL** | Public self-serve terms and tier limits reviewed | Obtain written scope for OctaNet before storage, display, redistribution or production use |

### Status correction

The prior register stated that no actual odds payload had been captured. That is corrected: a provider-labelled MLB demo payload was captured, but it is stale and outside OctaNet's six sports. It is not counted as a live or current event-market test. No current six-sport bookmaker/event/market/selection tuple has been captured.

### Six-sport interpretation

- **Soccer:** broadest active-key catalogue examples; no current event/market payload or exhaustive country matrix.
- **Tennis:** ATP/WTA and French Open keys visible; no draw/player event sample.
- **Basketball:** NBA, WNBA, NCAAB and EuroLeague keys visible; no game sample.
- **Golf:** PGA Championship key visible; no round/matchup/field market sample.
- **Cricket:** IPL and Test Match keys visible; no match/innings/market sample.
- **Rugby:** NRL Rugby League key visible; no Rugby Union/Sevens key or sample.

No sport has passed the event, bookmaker-market, independent sporting-evidence, identity, timestamp, rights and prediction-eligibility gates. Odds remain market context only.


## 10. Public ParlayAPI endpoint test register — 10 November 2026

| Test ID | Endpoint / scope | Status | Evidence captured | Limitation / next action |
|---|---|---|---|---|
| PUB-PARLAY-HEALTH-01 | Public `GET /v1/meta/source-quality` | **PASS — metadata retrieval only** | Generated 2026-11-10T06:55:47.963Z; 31 sources; SLA 25 OK / 4 degraded / 2 breach; price-write 28 OK / 3 degraded | Health telemetry only; not event or market coverage |
| PUB-PARLAY-SPORTS-01 | Public `GET /v1/sports` active-key catalogue | **PARTIAL** | Visible examples for all six broad categories; soccer broadest, rugby only NRL visible | No generated-at timestamp; cache freshness, pagination and account completeness unverified |
| PUB-PARLAY-BOOKS-01 | Public `GET /v1/bookmakers` registry | **PARTIAL** | Source/region/endpoint metadata; Betway Mozambique entry explicitly TT Cup-only | Registry is not a current event offer; no bookmaker-to-event reconciliation |
| PUB-PARLAY-DEMO-01 | Public `GET /v1/try/baseball_mlb/odds` | **PARTIAL — schema only** | One provider-labelled demo event includes event ID/canonical ID, commence time, bookmaker, h2h market, outcomes/prices and last-update fields | MLB outside OctaNet's six; event 2026-10-29 and observations 2026-10-28, stale on 10 Nov |
| PUB-PARLAY-EVENTS-6S-01 | Current upcoming event-market payloads for soccer, tennis, basketball, golf, cricket and rugby | **NOT TESTED** | No current target-sport event-market response captured | Requires authorised access or permitted current target-sport sample |
| PUB-PARLAY-IDENTITY-01 | Event/bookmaker/market/selection identity and timestamp reconciliation | **NOT TESTED** | Demo schema shows fields, but no independent matching run | Reconcile to an independent sports-event source and validate cutoff times |
| PUB-PARLAY-RIGHTS-01 | Permitted use / commercial rights | **PARTIAL** | Public self-serve restrictions reviewed | Written OctaNet-specific scope still required |

### Six-sport snapshot interpretation

- **Soccer:** broadest visible active-key examples across multiple countries; no exhaustive country matrix or current event market.
- **Tennis:** ATP/WTA and French Open keys visible; no draw/player event sample.
- **Basketball:** NBA, WNBA, NCAAB and EuroLeague keys visible; no game sample.
- **Golf:** PGA Championship key visible; no round/matchup/field sample.
- **Cricket:** IPL and Test Match keys visible; no match/innings sample.
- **Rugby:** NRL Rugby League key visible; no Rugby Union/Sevens key or sample.

No sport has passed event, market, independent sporting-evidence, identity, timestamp, rights and prediction-eligibility gates. Odds remain market context only.

## 14. ParlayAPI public catalogue refresh — 10 November 2026

| Test ID | Endpoint / scope | Status | Evidence captured | Limitation / next action |
|---|---|---|---|---|
| PUB-PARLAY-HEALTH-02 | Public `GET /v1/meta/source-quality` | **PASS — metadata only** | Generated 2026-11-10T06:55:47.963Z; 31 sources (25 OK, 4 degraded, 2 breach); price-write 28 OK, 3 degraded | Health telemetry includes non-bookmaker sources; not event-market coverage |
| PUB-PARLAY-SPORTS-02 | Public `GET /v1/sports` | **PARTIAL** | Active keys returned for six broad sports; visible scope includes soccer, tennis, basketball, golf, cricket and NRL | No generated timestamp, pagination or exhaustive country/competition proof; no Rugby Union/Sevens key visible |
| PUB-PARLAY-BOOKS-02 | Public `GET /v1/bookmakers` | **PARTIAL** | Registry returned book IDs, regions and endpoint/market metadata | Registry entries are scope-limited; no current target-sport bookmaker/event reconciliation |
| PUB-PARLAY-TRY-02 | Current official-doc verification of alleged no-auth `GET /v1/try/{sport_key}/odds` | **NOT TESTED** | Current docs do not document this route; no current target-sport response captured | Do not treat the route as supported until freshly documented and a real-data response is verified |

### Interpretation

The active-key catalogue is a useful public discovery signal, not an authenticated complete global catalogue. Soccer has the broadest visible competition list; basketball and tennis have several keys; golf shows PGA Championship; cricket shows IPL/Test; rugby shows NRL only. The bookmaker registry describes supported regions and endpoints but does not show that any bookmaker currently offers a particular OctaNet event. The source-quality response is a health snapshot, not sporting evidence.

Package/account entitlements remain **BLOCKED**; catalogue pagination **NOT TESTED**; country/competition coverage **PARTIAL**; upcoming/completed target-sport event samples **NOT TESTED**; historical provider samples **NOT TESTED**; sport-specific evidence fields **PARTIAL** (documentation only); identity/timestamp reconciliation **NOT TESTED**; independent results **NOT TESTED**; actual bookmaker/event/market/selection tuple **NOT TESTED**; rights **PARTIAL**; prediction eligibility **BLOCKED**.

Reference endpoints:
- https://parlay-api.com/v1/meta/source-quality
- https://parlay-api.com/v1/sports
- https://parlay-api.com/v1/bookmakers
- https://parlay-api.com/redoc

## 15. GitHub Actions verification update — 11 November 2026

| Test ID | Scope | Status | Evidence | Limitation |
|---|---|---|---|---|
| CI-PR11-103 | GitHub Actions Quality Checks on PR #11 head `e7b5a9a46bb0090853d14f03045ab1e12b06871f` | **PASS — software only** | Run `42772921684` / #103 completed 2026-11-10T07:06:50Z; its single job passed dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build | Does not test provider entitlements, global catalogues, event-market payloads, sporting evidence, identity/results or rights |

Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42772921684

The latest PR-head CI result supersedes the earlier #101 reference for software validation. It does not alter any provider or bookmaker verification status. Stage 0 remains **PARTIAL / NOT APPROVED**; account-level checks remain BLOCKED without authorised access.

## 16. ParlayAPI source-health and access-semantics correction — 11 November 2026

| Test ID | Endpoint / scope | Status | Evidence captured | Limitation / next action |
|---|---|---|---|---|
| PUB-PARLAY-HEALTH-03 | Public `GET /v1/meta/source-quality` | **PARTIAL — reachability metadata only; price-write evidence FAIL for this window** | Generated `2026-11-11T00:40:58.452Z`; 45 total / 40 returned; 45 pulse-only; 44 OK pulses, 1 degraded; archive/latest-state source counts 0; price writes 0 OK and 45 missing | Ten-minute health snapshot has no positive current price-write evidence; do not equate pulse OK with bookmaker prices |
| PUB-PARLAY-SPORTS-03 | Public `GET /v1/sports` plus current API docs | **PARTIAL** | Active keys visible for soccer, tennis, basketball, golf, cricket and NRL Rugby League; docs say keys require at least one event in the last 24 hours | Not a global competition master; no pagination/exhaustive country matrix; no Rugby Union/Sevens key visible in this snapshot |
| PUB-PARLAY-BOOKS-03 | Public `GET /v1/bookmakers` | **PARTIAL** | Registry exposes bookmaker/source IDs, regions, endpoint/market capabilities and examples | Mixes sportsbooks, DFS, exchanges and prediction markets; examples are sport/market-limited; no target-sport event reconciliation |
| PUB-PARLAY-TRY-CORRECTION-01 | Current official docs for alleged no-auth `/v1/try/{sport_key}/odds` | **NOT TESTED** | Current docs do not document this route; a previous stale MLB provider-labelled payload remains schema-only | Do not rely on the route as a supported current real-data preview without fresh documentation and a verifiable response |
| PUB-PARLAY-SANDBOX-01 | Documented no-auth `/v1/sandbox/...` endpoints | **NOT TESTED — EXCLUDED FROM EVIDENCE** | Official docs explicitly describe deterministic synthetic data | Never use sandbox responses as live fixture, bookmaker, market, selection, coverage or sporting evidence |

The current API docs show the regular `/v1/sports/{key}/events` and `/odds` examples using an API key. A no-auth synthetic sandbox is not a substitute for an authorised live sample. No current target-sport event-market response was captured. References: https://parlay-api.com/docs ; https://parlay-api.com/v1/meta/source-quality ; https://parlay-api.com/v1/sports ; https://parlay-api.com/v1/bookmakers

The 11 November source-health response is **not** evidence of a 44-bookmaker live feed: all 45 listed sources were pulse-only and all 45 had missing price-write classifications in that observation window. Keep actual bookmaker/event/market/selection IDs and observed timestamps **NOT TESTED** until a real event-market payload is obtained.

Quality Checks runs **#104–#107** all completed successfully on the successive documentation heads. Latest run **#107** (`42973819394`) passed on the PR head `a5fa01a15853c3727348b0033fd4d286bf8d6a0d`. Its single `Test, typecheck, and production build` job passed dependency installation, patched gRPC lock verification, production dependency audit, unit tests, TypeScript check and production build. Runs #104, #105 and #106 also passed the same job/steps on their respective preceding documentation commits. This is software validation only; none of these runs tested provider entitlements, event/market availability, sporting evidence, identity/results or rights. Run #107: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42973819394

## 17. ParlayAPI public snapshot and endpoint-contract register — 12 November 2026

| Test ID | Source / scope | Status | Actual evidence / limitation |
|---|---|---|---|
| PUB-PARLAY-HEALTH-2026-11-12 | Public `/v1/meta/source-quality` | **PARTIAL** | Timestamped 10-minute snapshot at 2026-11-12 03:30:03.532 UTC: 46 total, 40 returned, 46 pulse-only; reachability 41 OK / 2 degraded / 2 breach / 1 stale; price writes 46 missing. Count discrepancy retained. Metadata only; no market proof. |
| PUB-PARLAY-SIXSPORT-CATALOGUE-2026-11-12 | Public `/v1/sports` | **PARTIAL** | Active-key response retrieved. Six broad sport categories visible, but rugby is NRL only; no Rugby Union/Sevens. Docs define active as at least one event in prior 24 hours; no catalogue pagination or response timestamp documented. |
| PUB-PARLAY-BOOKMAKER-REGISTRY-2026-11-12 | Public `/v1/bookmakers` | **PARTIAL** | Registry exposes configured source keys, regions and endpoint examples; includes DFS/exchanges/prediction markets and explicit `no_data` examples. `status=active` is not current market availability; no target event reconciled. |
| PUB-PARLAY-EVENT-API-2026-11-12 | Documented `/v1/sports/{key}/events` | **NOT TESTED** | Docs describe a zero-credit canonical-event-deduplicated event list. Direct endpoint retrieval was inaccessible through the review web layer and yielded no HTTP status/body; no event sample claimed. |
| PUB-PARLAY-ODDS-API-2026-11-12 | Regular `/v1/sports/{key}/odds` | **BLOCKED** | Requires API key and metered market/region request. No authorised key available; no chargeable request made. |
| PUB-PARLAY-CATALOGUE-PAGINATION-2026-11-12 | `/v1/sports`, `/events`, and `/props` pagination/completeness | **NOT TESTED** | No pagination documented for `/sports` or `/events`; `/props` documents offset and completeness headers, but no page sequence or headers were retrieved. |
| PUB-PARLAY-IDENTITY-TIMING-CONTRACT-2026-11-12 | Event and odds schema documentation | **PARTIAL** | Docs describe `canonical_event_id`, nullable `commence_time`, `commence_time_reported`, `last_update_ms`, `stale_seconds` and `topped_up`; no actual event/market payload was reconciled or independently checked. |
| PUB-PARLAY-RIGHTS-2026-11-12 | Public terms/documentation | **PARTIAL** | Public documentation reviewed only; no written OctaNet-specific permission for display, redistribution, retention or commercial use. |

### Interpretation

- Do not count pulse/reachability health as price delivery or a bookmaker market.
- Do not count registry status, region allowlists or example paths as current event-level offers.
- Do not count synthetic sandbox data as production evidence.
- No current bookmaker/event/market/selection tuple with observed timestamps was captured for any of the six target sports.
- Fixture discovery, market availability, verified sporting evidence and prediction eligibility remain separate gates. Odds are market context only.

Quality Checks **#108** (`42974026424`) passed on the previous PR head `023de00b8aca91b49736d035c6eb26852edd6193`; the single job passed dependency install, gRPC lock verification, dependency audit, unit tests, TypeScript and production build. This documentation update is newer; verify CI separately. Run: https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/actions/runs/42974026424
