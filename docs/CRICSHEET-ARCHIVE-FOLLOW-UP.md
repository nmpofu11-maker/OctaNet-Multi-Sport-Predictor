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

**Result: EXECUTED through GitHub Actions on 6 November 2026.**

The workflow downloaded both competition ZIPs, parsed all 444 JSON match records, calculated archive hashes and produced an aggregate report. The raw ZIPs were removed after the run and were not committed. Detailed counts and hashes are recorded in Section 7.

The first audit report did not identify which metadata fields were declared missing in the 34 CSA records. The follow-up script now aggregates the declared missing-field names and records up to ten representative Cricsheet match IDs per field. This is a targeted diagnostic only; it does not persist raw match payloads.

Do not add the downloaded raw archive or licensed dataset to the Git repository. Keep any future sample staging isolated unless the repository owner explicitly chooses a compliant storage strategy.

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

## 6. Isolated archive audit utility

A standard-library-only audit utility is available at `scripts/cricsheet-archive-audit.py`, with instructions in `docs/CRICSHEET-LOCAL-AUDIT-RUNBOOK.md`.

The utility downloads the SA20 and CSA T20 Challenge JSON ZIPs to a temporary directory, calculates SHA-256 hashes, parses the match records, checks structural fields and reports dates, seasons, teams, venues, innings, overs, deliveries, wickets, missing fields, duplicate IDs and malformed records. It removes the downloaded archives at the end and writes an aggregate JSON report under `cricsheet-audit-output/`.

The utility has been executed successfully in GitHub Actions against the real archives. Its latest revision also groups declared missing-metadata fields and provides up to ten representative public match IDs per field. The revised field-level output has not yet been run against the archives. A structural PASS would still not approve production ingestion.

## 7. Actual GitHub Actions archive audit — 6 November 2026

The manually dispatched GitHub Actions run completed successfully (run ID `42297220314`). Both archives were downloaded and all JSON records parsed. The aggregate report was retrieved and inspected; the raw archives were not retained.

| Measure | SA20 | CSA T20 Challenge |
|---|---:|---:|
| Archive size | 533,101 bytes | 1,255,675 bytes |
| SHA-256 | `6db3a8654554be05d3da5a28e687385c1a494636a741a926abf03cc90383fb55` | `f3144a7b39d05c0803a57d46d855e7436a362dc0bffc09e8a050dee3c27e2817` |
| JSON files / valid matches | 130 / 130 | 314 / 314 |
| Invalid JSON | 0 | 0 |
| Duplicate filename-based IDs | 0 | 0 |
| Format version | 1.3.0 (130) | 1.3.0 (314) |
| Date range | 2023-01-10 to 2026-01-25 | 2012-02-15 to 2024-10-27 |
| Innings | 255 | 620 |
| Overs | 4,698 | 11,547 |
| Deliveries | 29,020 | 71,230 |
| Wickets | 1,596 | 3,645 |
| Matches with declared missing metadata | 0 | 34 |
| No-result matches | 7 | 14 |
| Draw/tie results | 1 | 5 |
| Structural field anomalies | 0 | 0 |

SA20 has 33 matches in each of the first three seasons (2022/23, 2023/24, 2024/25) and 31 in 2025/26. The six franchises appear across 130 records. The archive ends on 25 January 2026; it is not a live 2026/27 feed.

CSA T20 Challenge has 13 represented seasons from 2011/12 through 2024/25, with a gap in the listed season sequence. Its 34 records declaring missing metadata need a second-stage field-level review before feature use. The archive ends on 27 October 2024, so it is historical rather than current coverage. Its team labels span changing provincial/franchise identities; canonical team mapping is a separate required task.

**Interpretation:** the run proves that both downloaded ZIPs are readable JSON archives with no parse failures, duplicate filename IDs or detected structural anomalies under this audit's checks. It does not prove that every match in the real-world competitions is present, that all metadata is complete, or that match outcomes/ball-by-ball events are semantically correct. No-result and draw/tie records are legitimate edge cases that downstream settlement logic must handle explicitly.

### Audit status semantics tightened

The first run labelled both archives `PASS` because it only treated parse failures, duplicate IDs and explicit structural anomalies as blockers. That label was too permissive for CSA's 34 metadata-gap records. The audit script has therefore been tightened: any declared missing metadata or counted missing field now produces `REVIEW`, not `PASS`. This does not invalidate the successful parsing result; it separates syntactic integrity from completeness.

The script has now also been extended to aggregate the names of fields declared in each match's `info.missing` metadata and include up to ten representative match IDs per field. This will show whether the CSA gap concerns optional officials/awards or fields material to a future feature pipeline, without retaining raw match records. The revised diagnostic has not yet been executed; a new workflow run is required.

### Next validation gate

1. Re-run the workflow using the updated script; expected status is SA20 `PASS` and CSA T20 Challenge `REVIEW` unless the newer archive differs.
2. Inspect representative CSA records with declared missing metadata and document exactly which fields are absent.
3. Verify competition/season coverage and team aliases against independent official records.
4. Add chronology/cutoff tests and explicit no-result/tie handling before considering any training use.
5. Complete attribution/licence review. Do not ingest either archive into the production training corpus yet.

Artifact from run `42297220314` was retained by GitHub for 14 days and has since been retrieved for this assessment. No raw match archive was committed to the repository.
