# Cricsheet Cricket Archive — Follow-up Coverage Check

**Checked:** 2026-11-06  
**Project:** OctaNet-Multi-Sport-Predictor  
**Branch:** docs/six-sport-data-collection-blueprint  
**Scope:** Public archive coverage and sample-ingestion feasibility; no application integration.

## 1. Updated public catalogue findings

The current Cricsheet Match Data page lists 23,241 ball-by-ball matches, spanning men's and women's international formats and selected domestic/franchise competitions. The page states that 386 matches are withheld, involving Afghanistan or the Afghanistan Premier League. The published archive data is JSON, YAML, XML and experimental CSV; JSON is identified as the main and most complete format.

South African competitions explicitly listed:

| Competition | Catalogue count | Assessment |
|---|---:|---|
| CSA T20 Challenge | 314 | Useful historical T20 sample pool |
| SA20 | 130 | Directly relevant to first-release scope; promising historical pool |
| Mzansi Super League | 56 | Historical predecessor competition; useful for team/player history only where identities reconcile |
| CSA Pro20 | 6 | Very small sample; insufficient as a standalone training corpus |

These are counts shown by Cricsheet's current public catalogue, not a claim that every match in a competition's history is present. Counts can change as records are added or corrected.

## 2. Licence and attribution

Cricsheet announced on 7 October 2026 that match data (other than XML) is made available under the Open Data Commons Attribution License (ODC-BY 1.0). Its licensing page summarises permission to share, create and adapt subject to attribution, preservation of licence notices and making the licence clear on redistribution.

Before product use, retain the exact licence file shipped with the downloaded archive, follow the full ODC-BY terms, attribute Cricsheet and identify modifications. The public summary is not a substitute for the licence text or legal review of OctaNet's intended deployment and redistribution model.

## 3. Payload sample test status

**Result: NOT EXECUTED — raw ZIP payload could not be retrieved in this run.**

The public Match Data and Downloads pages were inspected, but the download link did not expose a retrievable archive payload through the available session tools. Therefore no claim is made that a JSON file was downloaded, parsed, validated, or hash-verified. Do not mark this as a sample-payload PASS.

The next local test should retrieve the CSA T20 Challenge JSON archive and the SA20 JSON archive separately. For each, record:
- exact source URL, retrieval timestamp, archive byte size and SHA-256;
- archive file list and number of JSON match records;
- earliest/latest match dates and season distribution;
- stable Cricsheet match IDs, competition/season metadata, venue and team names;
- innings count, overs, deliveries, batter/bowler identities, runs, extras and dismissals;
- missing/null fields, duplicate IDs, malformed records and incomplete/abandoned/no-result matches;
- attribution/licence files included in the archive.

Do not add the downloaded raw archive or licensed dataset to the Git repository. Keep it in a local staging area unless the repository owner explicitly chooses a compliant storage strategy.

## 4. Data suitability boundaries

Cricsheet is a **historical completed-match ball-by-ball source**, not a live fixture discovery, live score, lineup announcement or official settlement API. New matches can appear after completion and correction. It cannot independently supply reliable pre-match odds, confirmed playing XIs, toss information before the event, or a future fixture schedule.

For a cricket feature pipeline, derive features only from matches completed before the prediction cutoff. Do not use the target match's deliveries, result, or post-match corrections as pre-match features. Preserve the match ID, source timestamp/retrieval time, original file hash and licence attribution through every transformation.

SA20 and CSA T20 Challenge should be modelled as distinct competitions/seasons and T20 format cohorts; do not pool them blindly with men's T20 internationals, one-day cricket or multi-day formats. Mzansi Super League may be historical context but needs careful participant/team mapping and competition-era handling.

## 5. Updated decision

- **SA20 historical coverage:** DOCUMENTED in public catalogue (130 matches); raw sample not yet parsed.
- **CSA T20 Challenge historical coverage:** DOCUMENTED in public catalogue (314 matches); raw sample not yet parsed.
- **Mzansi Super League:** DOCUMENTED in public catalogue (56 matches); legacy context only.
- **CSA Pro20:** DOCUMENTED (6 matches); too small to serve as a primary dataset.
- **Live SA20/CSA fixture and result feed:** NOT ESTABLISHED by Cricsheet.
- **Production ingestion approval:** NOT GRANTED pending archive parsing, data-quality review, attribution implementation, cutoff-safety tests and product-rights review.

This is still a documentation-only assessment. No OctaNet source code, browser storage, database, model, or training corpus has been modified.

## Sources
- Cricsheet Match Data: https://cricsheet.org/matches/
- Cricsheet Downloads: https://cricsheet.org/downloads/
- Cricsheet Format: https://cricsheet.org/format/
- Cricsheet Licensing: https://cricsheet.org/licensing/
- Cricsheet licensing announcement (7 October 2026): https://cricsheet.org/article/licensing-and-venues-registry/
