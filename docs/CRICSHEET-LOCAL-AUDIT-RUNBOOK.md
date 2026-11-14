# Running the isolated Cricsheet archive audit

The repository includes `scripts/cricsheet-archive-audit.py`. It is a standalone research utility, not an application provider or training-data importer. **You do not need a local clone or local repository.** The preferred route is GitHub Actions.

## Run it in GitHub (no local setup)

The workflow is `.github/workflows/cricsheet-archive-audit.yml`.

1. Open the [OctaNet pull request #11](https://github.com/nmpofu11-maker/OctaNet-Multi-Sport-Predictor/pull/11).
2. Open the **Checks** tab and look for **Cricsheet archive audit**. The pull-request workflow should start automatically after the workflow file is present on the PR branch and GitHub Actions is enabled for the repository.
3. Open the audit run when it appears. The workflow downloads the SA20 and CSA T20 Challenge JSON archives, inspects them, and uploads an artifact named **cricsheet-archive-audit-report**.
4. In the workflow run's **Artifacts** section, download that report ZIP and open `cricsheet-audit-report.json`.

If the workflow does not appear, open the repository's **Actions** tab and check whether Actions are enabled and whether the workflow is listed. A manual `workflow_dispatch` run is also defined, once GitHub exposes the workflow in that repository.

The workflow uses a GitHub-hosted runner; no provider credentials or repository write permissions are required. It does need outbound HTTPS access to `cricsheet.org`. The downloaded raw ZIPs stay on the temporary runner and are not uploaded as artifacts; only the aggregate report is retained for 14 days.

## Optional local run

If you later obtain a local clone, run from its root:

```powershell
py -3 scripts/cricsheet-archive-audit.py
```

The script uses only Python's standard library and writes the report to `cricsheet-audit-output/cricsheet-audit-report.json`.

## What the report checks

- archive byte size and SHA-256;
- JSON entry count, parse failures and duplicate filename-based match IDs;
- Cricsheet data format versions;
- date range and season distribution;
- teams and venues;
- innings, overs, deliveries and wickets;
- missing delivery-required fields and result categories;
- declared missing metadata and structural anomalies.

A `PASS` means the archive parsed without invalid JSON, duplicate filename-based IDs, detected structural anomalies, declared missing metadata or counted missing fields. Any declared metadata gap or counted missing field produces `REVIEW`. Neither status establishes complete real-world competition coverage, official settlement authority, pre-match feature safety, rights clearance, or production readiness. Inspect the report and representative match files before any later integration. In particular, validate event/competition labels, match dates and season coverage against official competition records. No-result and draw/tie matches are counted separately and require explicit downstream handling.

## Licence and safety boundary

Cricsheet's JSON match data is covered by ODC-BY 1.0. Read the full licence and implement required attribution and notices before public or product use. XML is separately licensed under CC BY 4.0. See https://cricsheet.org/licensing/.

This audit does not change OctaNet application code paths, browser storage, Firebase, prediction logic, model weights, training data, or fixture discovery. It must remain isolated until separately reviewed and approved.
