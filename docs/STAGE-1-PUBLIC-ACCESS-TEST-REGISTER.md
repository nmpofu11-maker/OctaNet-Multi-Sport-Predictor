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
