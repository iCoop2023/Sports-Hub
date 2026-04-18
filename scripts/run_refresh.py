#!/usr/bin/env python3
"""Orchestrate a full data refresh (games + news) for Sports Hub."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"
DATA_DIR = BASE_DIR / "data"
CACHE_DIR = DATA_DIR / "cache"
LOG_DIR = DATA_DIR / "logs"
STATUS_FILE = CACHE_DIR / "refresh_status.json"

FETCH_SCRIPT = SCRIPTS_DIR / "fetch_all.py"
NEWS_SCRIPT = SCRIPTS_DIR / "update_news.py"

LOG_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def iso_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def write_status(payload: dict) -> None:
    payload.setdefault("updated_at", iso_now())
    STATUS_FILE.write_text(json.dumps(payload, indent=2))


def run_step(step_name: str, command: List[str], log_file: Path) -> dict:
    global steps, refresh_id, started_at

    step_info = {
        "name": step_name,
        "command": " ".join(command),
        "status": "running",
        "started_at": iso_now()
    }
    write_status({
        "refresh_id": refresh_id,
        "status": "running",
        "started_at": started_at,
        "log_file": str(log_file.relative_to(BASE_DIR)),
        "current_step": step_info,
        "steps": steps + [step_info],
        "message": f"Running {step_name}"
    })

    with log_file.open("a") as log_handle:
        log_handle.write(f"\n[{step_info['started_at']}] >>> {' '.join(command)}\n")
        result = subprocess.run(
            command,
            cwd=BASE_DIR,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            check=False,
            text=True
        )

    step_info["completed_at"] = iso_now()
    step_info["return_code"] = result.returncode
    step_info["status"] = "success" if result.returncode == 0 else "error"

    steps.append(step_info)
    return step_info


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh-id", dest="refresh_id", default=None)
    args = parser.parse_args()

    refresh_id = args.refresh_id or datetime.utcnow().strftime("%Y%m%d%H%M%S")
    started_at = iso_now()
    steps: List[dict] = []
    log_file = LOG_DIR / f"refresh-{refresh_id}.log"

    write_status({
        "refresh_id": refresh_id,
        "status": "running",
        "started_at": started_at,
        "log_file": str(log_file.relative_to(BASE_DIR)),
        "steps": steps,
        "message": "Refresh queued"
    })

    try:
        # Step 1: games/schedules
        step = run_step("fetch_games", [sys.executable, str(FETCH_SCRIPT)], log_file)
        if step["status"] != "success":
            raise RuntimeError("fetch_all.py failed")

        # Step 2: news aggregation
        step = run_step("update_news", [sys.executable, str(NEWS_SCRIPT)], log_file)
        if step["status"] != "success":
            raise RuntimeError("update_news.py failed")

        write_status({
            "refresh_id": refresh_id,
            "status": "success",
            "started_at": started_at,
            "completed_at": iso_now(),
            "log_file": str(log_file.relative_to(BASE_DIR)),
            "steps": steps,
            "message": "Refresh completed"
        })
    except Exception as exc:
        write_status({
            "refresh_id": refresh_id,
            "status": "error",
            "started_at": started_at,
            "completed_at": iso_now(),
            "log_file": str(log_file.relative_to(BASE_DIR)),
            "steps": steps,
            "message": f"Refresh failed: {exc}"
        })
        sys.exit(1)
