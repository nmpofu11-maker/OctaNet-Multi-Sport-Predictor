# Global Bettable-Event Discovery Strategy

**Status:** Proposed product/data-collection direction; documentation only  
**Applies to:** Soccer, tennis, basketball, golf, cricket and rugby  
**Related PR:** #11 — Six-sport data collection strategy

## 1. Product direction

OctaNet is **worldwide-first across all six supported sports**. It should discover events globally wherever configured bookmakers offer betting markets. South African competitions remain included, but are not the default boundary, priority filter, or limit on discovery.

The event universe must be driven by actual event and market coverage, not a fixed shortlist of countries or competitions. The system should be able to discover major and minor leagues, tours, cups, tournaments, international fixtures and other eligible competitions as provider coverage permits.

This is a target strategy, not a claim that current OctaNet integrations or provider subscriptions already cover every country, competition or bookmaker.

## 2. Four separate questions

For every candidate event, answer these independently:

1. **Does the sporting event exist?** Establish the event from a sports schedule/event source with stable identifiers, participants, competition and scheduled time.
2. **Is it being offered for betting?** Verify a current market listing from a configured bookmaker or a licensed odds/market aggregator. Record bookmaker, market/event ID, market type, observed time and market status. A fixture feed alone does not prove a betting market exists.
3. **Is there enough sporting evidence?** Independently validate participant identity and timestamped, pre-event form/statistics relevant to that sport. Odds and implied probabilities are market data, never team/player evidence.
4. **Can OctaNet safely predict it?** Apply the existing sport-specific evidence, identity, provenance, cutoff, conflict and eligibility gates. A listed market is not automatically prediction-eligible.

## 3. Event lifecycle and statuses

Keep these states distinct and auditable:

- `fixture_discovered`: an event candidate was found in a sports schedule or event feed.
- `market_listed`: at least one configured bookmaker/market source has a current, identifiable market for the event.
- `identity_verified`: participants, sport, competition/format and event time have been reconciled sufficiently to identify the event.
- `evidence_eligible`: required pre-event sporting evidence passes the relevant sport-specific checks.
- `prediction_eligible`: all event, market (where the product requires a bettable event), evidence, timing and safety gates pass.
- `blocked`, `conflicted`, `stale`, or `unsupported`: retain explicit reasons; never silently promote or discard a candidate.

An event may be market-listed but evidence-ineligible. It may also be a valid sporting fixture with no verified bookmaker market; retain it as a fixture candidate, but do not label it bettable.

## 4. Global discovery and market coverage

- Query the available event and market catalogues across all supported sports and configured bookmakers, without a South Africa-only filter.
- Use provider sport/competition catalogues and date-window discovery to identify coverage dynamically. Refresh catalogues and market listings according to provider limits and event proximity.
- Preserve bookmaker-specific event IDs and market IDs; reconcile them to a canonical sporting event using sport, competition, participants, round/format and event time. Names alone are not sufficient.
- Record which bookmakers list each event, which markets are available, when each market was observed, and when it became stale or closed.
- Support multiple bookmakers where entitled. Do not assume one odds provider represents every bookmaker or every bettable event worldwide.
- Treat provider coverage gaps honestly. A country, competition or bookmaker absent from a tested catalogue is `not established`, not proof that no betting markets exist anywhere.
- Do not scrape sites or bypass access controls. Automated access, retention, display and redistribution require documented permission and provider terms.

## 5. Six-sport event discovery

| Sport | Global event universe to discover | Identity and format boundaries |
|---|---|---|
| Soccer | Domestic leagues and cups, continental club competitions, international fixtures and eligible lower divisions worldwide | Country, competition, season, gender, age group, home/away teams, round and kickoff |
| Tennis | ATP, WTA, Challenger, ITF, Grand Slams and other covered professional events worldwide | Tour, singles/doubles, gender, tournament, draw, round, surface, player IDs, retirement/walkover |
| Basketball | Professional and other covered leagues, cups and international competitions worldwide | League, season, gender, age group, game ID, teams, periods and overtime |
| Golf | Covered professional tours, majors and eligible tournaments worldwide | Tour, event, course, round, full field, tee times, cut, withdrawal and leaderboard |
| Cricket | International and domestic competitions worldwide across Test, ODI, T20 and other covered formats | Competition, season, gender, teams, format, innings, DLS, no-result and tie |
| Rugby | Rugby Union, Rugby League and Sevens competitions worldwide where supported | Code, competition, union/league, gender, age group, match periods and scoring rules |

These are discovery categories, not assertions that every competition is covered by a particular provider or bookmaker. Each source must pass its own coverage, field, rights and sample tests.

## 6. Data separation and prediction safety

Maintain distinct records/streams for:

- **Sport event data:** schedules, participants, competition identity, status and venue.
- **Bookmaker market data:** bookmaker, market, selection, price, observed time, suspension/closure and source identifiers.
- **Sporting evidence:** timestamped historical form, statistics, rankings, availability and other sport-specific inputs.
- **Verified outcomes:** final sporting result and market-specific settlement status from trusted sources.

Bookmaker odds may be displayed as market context and used to establish market availability. They must not be converted into fabricated team/player statistics, form, evidence scores or model features. A market's implied probability is not independent sporting evidence.

Require adequate evidence for both sides in two-sided contests and for the relevant participants/field in tennis and golf. Missing, stale, disputed or post-event information blocks eligibility as appropriate. Preserve chronological cutoffs and prohibit target-event or post-event data leakage.

## 7. Coverage and quality reporting

Report discovery and eligibility by sport, country, competition, date window and bookmaker:

- events discovered;
- events with a verified bookmaker market;
- events with reconciled identity;
- events with sufficient pre-event evidence;
- prediction-eligible events;
- blocked/stale/conflicted events and reason;
- bookmaker and provider coverage gaps;
- last successful retrieval and data freshness.

Do not represent an incomplete provider response as a complete worldwide list. Show the sources and time window behind every coverage report.

## 8. Historical data is supplementary

Historical archives such as Cricsheet's SA20 and CSA T20 Challenge collections are useful for format-specific research, parsing, feature development and chronological evaluation. They do not define OctaNet's event universe, prove current bookmaker availability, provide a live fixture feed, or grant permission to train or deploy. Evaluate historical sources globally and sport by sport; do not privilege one country's archive simply because it is easy to download.

## 9. Rollout and approval gates

1. Inventory existing event, market and evidence providers and their actual account entitlements.
2. Test worldwide sport/competition catalogue discovery and bookmaker market coverage using permitted sample responses.
3. Measure event identity match rates, geographic/competition gaps, market freshness and provider limitations.
4. Validate sport-specific evidence and outcome sources independently.
5. Document licensing for internal use, display, storage, caching, derived data and redistribution.
6. Only after review, propose production integrations. Keep each sport/provider capability independently enabled or disabled.

No provider, bookmaker, country, competition, data licence, production adapter, model change, training import or settlement authority is approved by this strategy alone.

## 10. Existing safeguards remain mandatory

- No fabricated statistics, scores, odds or evidence.
- No bookmaker-odds-derived sporting evidence.
- No synthetic production records or demo fallbacks.
- No AI-generated result treated as authoritative settlement.
- No provider credentials in client bundles, logs or Git.
- No automatic training; preserve the empty-corpus / UNTRAINED state and explicit training approval.
- Preserve provenance, event reconciliation, timestamp cutoffs, chronological holdouts and explicit eligibility blocks.

## 11. Zero-subscription operating policy — 7 November 2026

**Budget constraint: OctaNet's provider and bookmaker discovery work must operate at zero subscription cost unless the owner explicitly changes this policy.** Do not purchase Sportradar, The Odds API, SportsDataIO or any other paid plan. Do not start a paid trial, accept a minimum commitment, enter payment details, enable auto-renewal or incur usage charges. A no-cost trial may only be considered later if it is genuinely free, requires no payment method or commitment, and cannot convert into a charge without fresh explicit approval. No such trial is currently requested.

### Source-selection order

1. Existing no-cost access already available to the project, subject to checking actual quota and terms.
2. Official governing-body, league, tournament and team public schedules/results, where automated access and intended use are permitted.
3. Free API tiers and public datasets with explicit limits and compatible licences/terms.
4. Historical open archives for research only, with provenance, completeness and rights documented.
5. Manual/public-page spot checks only where site terms permit; these do not become an assumed scalable feed.

### Evidence and market rules

- Maintain separate inventories for event discovery, sporting evidence, bookmaker market availability, verified outcomes and prediction eligibility.
- A public schedule or free fixture API does not prove that an event has a bookmaker market.
- A bookmaker page or permitted free market endpoint must identify the actual event and market at an observed time before market availability can be marked VERIFIED.
- If no lawful, free market source is available for an event, record market availability as NOT VERIFIED; do not label it bettable.
- Odds remain market context only and never become sporting evidence or model features.
- Respect source terms, robots/access controls, rate limits, attribution, retention and licensing. No scraping behind logins, CAPTCHA bypass, paywall circumvention or redistribution without rights.
- Free-tier limits, missing competitions, geographic restrictions and stale feeds must be reported rather than hidden. Global scope is the discovery objective, not a claim of complete coverage.

### Commercial gate

Any paid product or chargeable overage is out of scope. Reconsidering a paid service requires a separate, explicit owner decision after documenting the free-source coverage gap and the exact cost. No provider, bookmaker, integration, model or training approval is granted by this policy.
