#!/usr/bin/env python3
"""Audit Cricsheet competition ZIPs without importing match data into OctaNet."""
from __future__ import annotations

import hashlib
import json
import sys
import urllib.request
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

SOURCES = {
    "SA20": "https://cricsheet.org/downloads/sat_json.zip",
    "CSA T20 Challenge": "https://cricsheet.org/downloads/ctc_json.zip",
}
MAX_ARCHIVE_BYTES = 25 * 1024 * 1024
USER_AGENT = "OctaNet-Cricsheet-Audit/1.0 (local research; no production ingestion)"


def download(url: str, destination: Path) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    digest = hashlib.sha256()
    size = 0
    with urllib.request.urlopen(request, timeout=45) as response, destination.open("wb") as out:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_ARCHIVE_BYTES:
                raise ValueError(f"Archive exceeds safety limit ({MAX_ARCHIVE_BYTES} bytes)")
            digest.update(chunk)
            out.write(chunk)
    return size, digest.hexdigest()


def audit_archive(competition: str, url: str, archive: Path) -> dict:
    size, sha256 = download(url, archive)
    report = {
        "competition": competition,
        "source_url": url,
        "retrieved_at_utc": datetime.now(timezone.utc).isoformat(),
        "archive_bytes": size,
        "archive_sha256": sha256,
        "json_files": 0,
        "valid_matches": 0,
        "invalid_json_files": [],
        "duplicate_match_ids": [],
        "format_versions": {},
        "date_min": None,
        "date_max": None,
        "seasons": {},
        "teams": {},
        "venues": {},
        "innings_total": 0,
        "overs_total": 0,
        "deliveries_total": 0,
        "wickets_total": 0,
        "missing_metadata_matches": 0,
        "no_result_matches": 0,
        "draw_or_tie_matches": 0,
        "missing_field_counts": {},
        "field_anomalies": [],
        "archive_entries": [],
    }
    dates, match_ids = [], set()
    seasons, teams, venues, versions, missing = Counter(), Counter(), Counter(), Counter(), Counter()

    with zipfile.ZipFile(archive) as zf:
        infos = [i for i in zf.infolist() if not i.is_dir()]
        report["archive_entries"] = [i.filename for i in infos]
        json_infos = [i for i in infos if i.filename.lower().endswith(".json")]
        report["json_files"] = len(json_infos)
        if not json_infos:
            raise ValueError("ZIP contains no JSON match records")
        for info in json_infos:
            if info.file_size > 5 * 1024 * 1024:
                report["field_anomalies"].append(f"{info.filename}: unusually large JSON entry")
                continue
            try:
                match = json.loads(zf.read(info).decode("utf-8"))
                meta, game = match["meta"], match["info"]
                if not isinstance(meta, dict) or not isinstance(game, dict):
                    raise ValueError("meta/info must be objects")
                match_id = Path(info.filename).stem
                if match_id in match_ids:
                    report["duplicate_match_ids"].append(match_id)
                match_ids.add(match_id)
                report["valid_matches"] += 1
                versions[str(meta.get("data_version", "missing"))] += 1
                dates.extend(d for d in game.get("dates", []) if isinstance(d, str))
                if not game.get("dates") or len(game.get("teams", [])) != 2:
                    report["field_anomalies"].append(f"{info.filename}: missing dates or not exactly two teams")
                if game.get("season") is not None:
                    seasons[str(game["season"])] += 1
                else:
                    missing["season"] += 1
                for team in game.get("teams", []):
                    teams[str(team)] += 1
                if game.get("venue"):
                    venues[str(game["venue"])] += 1
                else:
                    missing["venue"] += 1
                if game.get("missing"):
                    report["missing_metadata_matches"] += 1
                outcome = game.get("outcome", {})
                if outcome.get("result") == "no result":
                    report["no_result_matches"] += 1
                if outcome.get("result") in ("draw", "tie"):
                    report["draw_or_tie_matches"] += 1

                innings = match.get("innings", [])
                report["innings_total"] += len(innings)
                for inning in innings:
                    overs = inning.get("overs", [])
                    report["overs_total"] += len(overs)
                    for over in overs:
                        for ball in over.get("deliveries", []):
                            report["deliveries_total"] += 1
                            if not all(k in ball for k in ("batter", "bowler", "non_striker", "runs")):
                                missing["delivery_required_fields"] += 1
                            runs = ball.get("runs")
                            if not isinstance(runs, dict) or not all(k in runs for k in ("batter", "extras", "total")):
                                missing["runs_fields"] += 1
                            report["wickets_total"] += len(ball.get("wickets", []))
            except Exception as exc:
                report["invalid_json_files"].append({"file": info.filename, "error": str(exc)})

    report["date_min"] = min(dates) if dates else None
    report["date_max"] = max(dates) if dates else None
    report["seasons"] = dict(sorted(seasons.items()))
    report["teams"] = dict(sorted(teams.items()))
    report["venues"] = dict(sorted(venues.items()))
    report["format_versions"] = dict(sorted(versions.items()))
    report["missing_field_counts"] = dict(sorted(missing.items()))
    report["status"] = "PASS" if report["valid_matches"] and not report["invalid_json_files"] and not report["field_anomalies"] and not report["duplicate_match_ids"] else "REVIEW"
    return report


def main() -> int:
    output_dir = Path("cricsheet-audit-output")
    output_dir.mkdir(exist_ok=True)
    reports = []
    with TemporaryDirectory(prefix="octanet-cricsheet-") as temp:
        temp_dir = Path(temp)
        for index, (competition, url) in enumerate(SOURCES.items(), start=1):
            archive = temp_dir / f"competition-{index}.zip"
            try:
                report = audit_archive(competition, url, archive)
            except Exception as exc:
                report = {"competition": competition, "source_url": url, "status": "NOT RUN", "error": str(exc)}
            reports.append(report)
            print(f"\n{competition}: {report['status']}")
            for key in ("archive_bytes", "archive_sha256", "json_files", "valid_matches", "date_min", "date_max", "deliveries_total", "invalid_json_files", "duplicate_match_ids", "field_anomalies", "error"):
                if key in report:
                    print(f"  {key}: {report[key]}")
    result = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "note": "Audit only. No match records are persisted; downloaded ZIPs are removed after the run.",
        "reports": reports,
    }
    target = output_dir / "cricsheet-audit-report.json"
    target.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"\nReport written to: {target}")
    print("Review source licence and attribution before any product use.")
    return 0 if all(r.get("status") == "PASS" for r in reports) else 2


if __name__ == "__main__":
    sys.exit(main())
