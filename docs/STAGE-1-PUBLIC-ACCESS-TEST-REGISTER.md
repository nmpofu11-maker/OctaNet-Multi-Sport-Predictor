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
