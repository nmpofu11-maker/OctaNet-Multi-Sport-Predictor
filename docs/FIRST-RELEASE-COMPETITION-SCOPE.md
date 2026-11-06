# OctaNet First-Release Competition Scope

**Status:** Proposed scope for Stage 0 provider proof-of-coverage  
**Decision basis:** South Africa-first, with a deliberately limited international set  
**Related PR:** #11 — Six-sport data collection strategy

This is a recommended launch scope, not a claim that the current application or any provider subscription covers these competitions. Every competition must pass the provider/rights/field-coverage gate before being enabled for ingestion or predictions.

## 1. Scope principles

- Start with South African competitions where an official organiser or usable licensed feed can be identified.
- Add a small set of internationally important competitions to test broader coverage.
- Separate sport code, competition, season, gender, age group, and format. Do not merge men's/women's, senior/junior, Union/Sevens, or cricket formats into one competition identity.
- A competition is **enabled** only when its source, identifiers, required fields, history, update frequency, and permitted use have been tested.
- If no suitable data source is approved, show the competition as **not yet supported**. Do not substitute scraped or synthetic fixtures.
- Start with fixtures, event identity, final results, standings/rankings and a modest set of pre-event features. Add detailed live statistics later.

## 2. Recommended first-release scope

| Sport | South African priority | International benchmark | Format boundary / initial exclusions |
|---|---|---|---|
| Soccer | Betway Premiership; Motsepe Foundation Championship; MTN8; Nedbank Cup; Carling Knockout | English Premier League; UEFA Champions League | Senior men's first. Add SA women's, youth, CAF club competitions and other European leagues only after separate source validation. |
| Tennis | South African players only when they appear in covered tour/draw data; no standalone local circuit commitment initially | ATP Tour singles; WTA Tour singles; Australian Open, Roland-Garros, Wimbledon, US Open | Singles first. Doubles, Challenger/ITF, juniors, wheelchair and exhibitions remain separate later phases. |
| Basketball | Basketball National League (BNL) men and women | NBA | Keep men's and women's leagues separate. WNBA, BAL, EuroLeague, college and youth competitions are later additions. |
| Golf | Sunshine Tour events | PGA Tour; DP World Tour; four men's major championships | Individual stroke-play tournaments first. Team formats, match play, amateur events, LPGA and other tours need separate feature/settlement handling. |
| Cricket | Proteas men's internationals; SA20; CSA men's Division 1 4-Day Series, One-Day Cup and T20 Challenge | ICC men's senior tournaments; IPL | Test/4-Day, ODI/One-Day, and T20 are distinct formats. Women's, Division 2, provincial and franchise women's competitions are later phases unless the chosen feed provides them with sufficient history. |
| Rugby | Springbok men's internationals; United Rugby Championship; Currie Cup Premier Division | Six Nations; Rugby Championship | Rugby Union 15s first. Women's, U20, Varsity, club lower divisions, Rugby Sevens and league-specific variations remain separate later phases. |

### Why these South African priorities

- The PSL identifies the Betway Premiership and its domestic cup competitions, plus the Motsepe Foundation Championship, as core South African club competitions; its published 2026/27 calendar confirms the season and cup schedule. <Cite refs={["turn537252search0","turn537252search1"]}/>
- Cricket South Africa lists its men's Division 1 formats (4-Day Series, One-Day Cup and T20 Challenge), alongside women's competitions. The first release prioritises men's formats to constrain the initial data model; this is a scope choice, not a statement that women's cricket is unimportant. <Cite refs={["turn537252search3","turn537252search4"]}/>
- SA Rugby identifies the URC, domestic competitions, Springbok internationals, women's and junior competitions as distinct coverage areas. SuperSport's broadcast rights are not a data API licence; obtain data access separately. <Cite refs={["turn537252search2","turn537252search5"]}/>
- The official BNL site publishes separate men's and women's league seasons, fixtures, standings and results, so OctaNet should model them as separate competitions. <Cite refs={["turn515076search0"]}/>
- The Sunshine Tour publishes its own tournament schedule and leaderboards, providing an official reference for South African golf event identity and results. <Cite refs={["turn515076search2","turn515076search3"]}/>
- The official SA20 site publishes fixtures, results and standings; treat it as a separate T20 franchise competition rather than combining it with international T20Is or other domestic T20 tournaments. <Cite refs={["turn515076search1"]}/>

## 3. Enablement matrix required before coding each adapter

For every row above, Stage 0 must record:

1. Official competition name and organiser.
2. Stable competition ID, season ID, and event ID from each proposed provider.
3. Provider and exact subscription/product tier (or documented public-data terms).
4. Coverage of fixtures, results, standings/rankings, participants, and sport-specific statistics.
5. Historical depth by season and whether corrected historical records are available.
6. Update cadence, latency, rate limits, pagination, and outage/correction policy.
7. Commercial use, caching, display, retention, and redistribution permissions.
8. Example raw payloads for upcoming, in-progress, completed, postponed/abandoned, and exceptional events where applicable.
9. Reconciliation source and settlement policy.
10. Pass/fail decision, test date, reviewer, and unresolved gaps.

A competition can be partially supported. For example, fixture discovery may be enabled while form, player availability, or advanced statistics remain unavailable. The UI and eligibility audit must show those missing evidence categories rather than imply full coverage.

## 4. Recommended implementation waves

### Wave A — prove South African coverage

1. Soccer: Betway Premiership and domestic cups.
2. Cricket: SA20 and Proteas men's internationals; add CSA domestic formats once sample payloads and history are verified.
3. Rugby: URC and Springbok men's internationals; add Currie Cup after coverage confirmation.
4. Basketball: BNL men and women.
5. Golf: Sunshine Tour.
6. Tennis: ATP/WTA draw coverage for South African players is not enough to train a local-only model; use the full tour draw/results if tennis predictions are in scope.

### Wave B — international breadth

- Soccer: English Premier League and UEFA Champions League.
- Tennis: ATP/WTA singles tours and four Grand Slams.
- Basketball: NBA.
- Golf: PGA Tour, DP World Tour and men's majors.
- Cricket: ICC men's senior events and IPL.
- Rugby: Six Nations and Rugby Championship.

### Wave C — extensions

Only after Wave A/B are stable: women's and junior competitions, Challenger/ITF tennis, WNBA, BAL, LPGA, Sevens, more rugby unions, additional football leagues and wider domestic cricket coverage.

## 5. Sport-specific minimum usable dataset

- **Soccer:** fixture/result identity, season/competition, home/away teams, kickoff, standings snapshot, last-five completed results per team, and verified final score. Lineups/injuries are optional evidence until a reliable feed exists.
- **Tennis:** player IDs, tournament/draw/round, surface, best-of format, match time, ranking snapshot, recent surface-specific results, and verified score including retirement/walkover status.
- **Basketball:** team IDs, game/season, period and final scores, standings, recent results, rest days, and roster availability only if reliably sourced. Player box scores are a later feature tier.
- **Golf:** event/course/round, full field, tee time, player IDs, round and total strokes, cut/withdrawal status, and verified final leaderboard. Do not model golf as a two-team match.
- **Cricket:** format, teams, venue, toss, playing XI when available, innings scorecards, overs, wickets, target/DLS details, and result. Test/4-Day, ODI/One-Day, and T20 must not share unqualified form aggregates.
- **Rugby:** Union 15s event identity, team/competition, kickoff, squad when available, score, tries, penalties/cards where sourced, and verified final result.

## 6. Explicit launch gate

A sport/competition must remain **discovery-only** until it has:

- A tested source for fixtures and final results.
- Stable IDs or a tested canonical identity/reconciliation method.
- Enough historical depth for the planned evaluation window.
- Required sport-specific fields with documented missingness.
- Timestamped pre-event evidence that passes the no-leakage rule.
- A documented settlement policy and independently checked outcomes.
- Data rights approved for the intended application use.

Only then may it be marked evidence-eligible. Model training remains a separate explicit action and must retain the repository's existing minimum-row, provenance, and chronological holdout controls.
