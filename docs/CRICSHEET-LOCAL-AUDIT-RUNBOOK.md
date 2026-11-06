# Running the isolated Cricsheet archive audit

The repository now includes `scripts/cricsheet-archive-audit.py`. It is a standalone research utility, not an application provider or training-data importer.

## Run on Windows PowerShell

From the OctaNet repository root:

```powershell
py -3 scripts/cricsheet-archive-audit.py
```

If the Python launcher is unavailable but Python is installed:

```powershell
python scripts/cricsheet-archive-audit.py
```

The script uses only Python's standard library. It downloads the SA20 and CSA T20 Challenge JSON ZIPs directly from Cricsheet, calculates SHA-256 hashes, inspects JSON metadata and ball-by-ball structure, and writes a machine-readable report to:

```text
cricsheet-audit-output/cricsheet-audit-report.json
```

The downloaded ZIP files are held in a temporary directory and removed when the run ends. No raw match records are written to the repository. The output directory is local research output and should not be committed.

## What the report checks

- archive byte size and SHA-256;
- JSON entry count, parse failures and duplicate filename-based match IDs;
- Cricsheet data format versions;
- date range and season distribution;
- teams and venues;
- innings, overs, deliveries and wickets;
- missing delivery-required fields and result categories;
- declared missing metadata and structural anomalies.

A `PASS` is only a structural archive check. It does **not** establish complete competition coverage, official settlement authority, pre-match feature safety, rights clearance, or production readiness. Inspect the report and representative match files before any later integration. In particular, validate the event/competition labels, match dates and season coverage against official competition records.

## Expected environment

The machine running the command must have outbound HTTPS access to `cricsheet.org`. If a corporate firewall or DNS policy blocks the download, the script reports `NOT RUN`; this is a connectivity limitation, not proof of a bad archive or invalid provider.

Cricsheet's JSON match data is covered by ODC-BY 1.0. Read the full licence and implement the required attribution and notices before public or product use. XML is separately licensed under CC BY 4.0. See https://cricsheet.org/licensing/.

## Safety boundary

This script does not change OctaNet application code paths, browser storage, Firebase, prediction logic, model weights, training data, or fixture discovery. It must remain an isolated audit until separately reviewed and approved.
