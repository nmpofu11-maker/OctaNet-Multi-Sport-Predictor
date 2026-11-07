# OctaNet Global Event and Betting-Market Scope

**Status:** Proposed product scope and Stage 0 proof-of-coverage target  
**Decision basis:** Worldwide discovery across all six supported sports  
**Related PR:** #11 — Six-sport data collection strategy

## 1. Governing scope

OctaNet should discover sporting events worldwide in soccer, tennis, basketball, golf, cricket and rugby, then identify which events have actual betting markets at configured bookmakers. South Africa is included as one market, not the default boundary or a restriction.

There is no fixed first-release country or competition whitelist. The event universe should follow verified provider and bookmaker coverage, with competition and geographic coverage reported transparently. This is a product direction; it does not claim that current integrations or subscriptions provide complete global coverage.

## 2. What qualifies as a bettable event

A candidate is labelled **bettable** only when a configured bookmaker or licensed market-data source returns a current, identifiable market for the event. Store source, bookmaker, bookmaker event/market IDs, market type, observed timestamp and status.

A sports fixture feed by itself only establishes a fixture candidate. It does not establish bookmaker availability. Conversely, a bookmaker listing must be reconciled to a real sporting event before it is treated as a valid event.

Market availability and sporting prediction eligibility are separate:
- Market listed + insufficient sporting evidence = visible as market-listed, but prediction blocked.
- Fixture discovered + no verified market = fixture candidate, not labelled bettable.
- Market listed + identity and evidence gates passed = may become prediction-eligible under the existing safety rules.

## 3. Global discovery categories by sport

| Sport | Worldwide discovery categories | Required identity boundaries |
|---|---|---|
| Soccer | Domestic leagues/cups, continental competitions, international fixtures and covered lower divisions | Country, competition, season, gender/age group, teams, round, kickoff |
| Tennis | ATP, WTA, Challenger, ITF, Grand Slams and other covered events | Tour, singles/doubles, gender, tournament, draw, round, surface, player IDs |
| Basketball | Professional leagues, cups and international competitions with verified source coverage | League, season, gender/age group, teams, game, periods/overtime |
| Golf | Professional tours, majors and other covered tournaments | Tour, event, course, round, field, player IDs, cut/withdrawal |
| Cricket | International and domestic competitions across Test, ODI, T20 and other covered formats | Competition, season, gender, teams, format, innings, DLS/tie/no-result |
| Rugby | Rugby Union, Rugby League and Sevens where event/market coverage exists | Code, competition, union/league, gender/age group, teams, match periods |

These are categories to search, not claims of coverage. Every provider/bookmaker combination must be tested for exact competitions, seasons, event types, markets, fields, update latency, quotas and rights.

## 4. Geographic and competition policy

- No South Africa-only filter or fixed national launch list.
- Include South African events whenever discoverable and market-listed; do not give them automatic preference over other countries.
- Do not exclude smaller leagues or competitions merely because they were absent from the earlier South Africa-first proposal.
- Use provider catalogues and market listings to discover coverage dynamically.
- Record country/competition/provider/bookmaker gaps and the last time each catalogue was checked.
- If coverage is not proven, mark it `not established` or `unsupported`; do not claim worldwide completeness.
- Do not scrape or bypass access controls. Respect source terms and rights for API access, storage, display, caching and redistribution.

## 5. Historical sources do not define live scope

Historical datasets (including Cricsheet's SA20 and CSA T20 Challenge archives) are optional research inputs. They can support carefully validated historical feature work within their coverage and licence boundaries. They do not determine which events OctaNet discovers, do not prove bookmaker market availability, and are not live fixture or settlement feeds.

## 6. Stage 0 global proof-of-coverage matrix

For each sport, provider and configured bookmaker, record:

1. Available countries, competitions, tours/leagues and seasons from the actual catalogue/account.
2. Upcoming and completed event samples with stable IDs and participant identities.
3. Bookmaker market/event IDs, market types, market status and observed timestamps.
4. Market refresh, suspension/closure behaviour, latency, quotas and pagination.
5. Sport-specific evidence fields, historical depth, null rates and correction policy.
6. Event identity reconciliation and duplicate/collision behaviour across sources.
7. Official/independent result verification and sport/market-specific settlement rules.
8. Storage, display, caching, derived-data and redistribution rights.
9. Geographic and competition gaps, sample hashes, test date, reviewer and PASS/PARTIAL/FAIL decision.

A provider's general marketing claim is not proof of account-level coverage. A successful event sample does not establish full competition coverage or production entitlement.

## 7. Prediction and data-safety gates

Keep these data classes separate: sporting events, bookmaker markets, sporting evidence and verified outcomes. Odds may establish market availability and be shown as market context; they must never populate team/player form, statistics, evidence scores or prediction features.

Require independently verified event identity and timestamped pre-event evidence. Missing, stale, conflicted or post-event evidence blocks prediction eligibility. Apply sport-specific rules for all relevant participants/fields, not just two-team formats. Keep outcomes out of pre-event features and require trusted-source verification before settlement or training use.

## 8. Rollout principle

First measure what is genuinely available worldwide across the six sports and configured bookmakers. Then prioritise integration work based on verified coverage, evidence quality, rights, cost and user value—not on geography or which historical archive happens to be easiest to obtain.

No production provider integration, subscription, model change, training import or settlement approval is authorised by this scope document. Existing UNTRAINED, provenance, chronological holdout, no-fabrication and explicit-training safeguards remain unchanged.
