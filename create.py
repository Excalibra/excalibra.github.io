#!/usr/bin/env python3
"""Diary scaffolding for this site: fill in title → choose type → save with today's date.

Usage (run from repository root):
  python create.py "Today's Note"
  python create.py              # Interactive title prompt
  python create.py --date 2026-03-15 Catch-up entry

Type (will ask unless explicitly given):
  1  single-file   …/2026-07-20-title.md          # Used when no cover image
  2  bundle        …/2026-07-20-title/index.md     # Used when a feature cover is needed
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
CONTENT_POSTS = ROOT / "content" / "posts"
TZ = ZoneInfo("Europe/Moscow")  # Moscow timezone

_BAD = re.compile(r'[\\/:*?"<>|\x00-\x1f]')


def decade_bucket(year: int) -> str:
    return f"{year // 10 * 10}s"


def safe_title_segment(title: str) -> str:
    s = title.strip()
    s = _BAD.sub("", s)
    s = re.sub(r"\s+", "-", s)
    s = s.strip(".-")
    if not s:
        raise SystemExit("Title is empty or became empty after sanitization")
    return s


def ensure_section_index(dir_path: Path, title: str) -> None:
    dir_path.mkdir(parents=True, exist_ok=True)
    index = dir_path / "_index.md"
    if index.exists():
        return
    index.write_text(
        f"""---
title: "{title}"
build:
  render: never
  list: never
  publishResources: false
---
""",
        encoding="utf-8",
    )
    print(f"  + {index.relative_to(ROOT)}")


def front_matter(title: str, when: datetime, *, bundle: bool = False) -> str:
    date_s = when.strftime("%Y-%m-%dT%H:%M:%S%z")
    if len(date_s) >= 5 and date_s[-5] in "+-" and date_s[-3] != ":":
        date_s = date_s[:-2] + ":" + date_s[-2:]
    slug = when.strftime("%Y%m%d%H%M%S")
    title_esc = title.replace("\\", "\\\\").replace('"', '\\"')
    # coverCaption is for Congo theme cover description; only used in bundles
    cover_line = '\ncoverCaption: ""' if bundle else ""
    return f"""---
title: "{title_esc}"
date: {date_s}
slug: "{slug}"
categories: ["Notes"]
tags: []
summary: ""
featured: false{cover_line}
---
"""


def resolve_when(date_arg: str | None) -> datetime:
    now = datetime.now(TZ)
    if not date_arg:
        return now
    raw = date_arg.strip().replace(".", "-").replace("/", "-")
    parts = [p for p in raw.split("-") if p]
    if len(parts) != 3:
        raise SystemExit(f"Cannot parse --date: {date_arg}")
    y, m, d = (int(parts[0]), int(parts[1]), int(parts[2]))
    return now.replace(year=y, month=m, day=d)


def ask_title(cli_parts: list[str]) -> str:
    title = " ".join(cli_parts).strip()
    if title:
        return title
    if not sys.stdin.isatty():
        raise SystemExit('Please provide a title, e.g.: python create.py "Today\'s Note"')
    try:
        title = input("Article title: ").strip()
    except EOFError:
        title = ""
    if not title:
        raise SystemExit("Title cannot be empty")
    return title


def ask_kind(cli_kind: str | None, leaf: str) -> str:
    """Return 'flat' or 'bundle'. If not explicitly given with --flat/--bundle, ask interactively."""
    if cli_kind in ("flat", "bundle"):
        return cli_kind

    print()
    print("Type (most articles without a cover choose 1):")
    print(f"  1) single-file  {leaf}.md")
    print(f"  2) bundle       {leaf}/index.md   ← needed when you have a feature cover image")
    print("   Press Enter = 1")
    try:
        choice = input("Choose [1/2]: ").strip()
    except EOFError:
        choice = ""

    if choice in ("", "1"):
        return "flat"
    if choice == "2":
        return "bundle"
    raise SystemExit("Invalid choice; please enter 1 or 2")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a Hugo diary entry for this site with today's date (interactive choice between single-file / bundle)"
    )
    parser.add_argument("title", nargs="*", help="Article title")
    kind = parser.add_mutually_exclusive_group()
    kind.add_argument(
        "--flat",
        action="store_const",
        const="flat",
        dest="kind",
        help="Non-interactive: single-file …/YYYY-MM-DD-title.md",
    )
    kind.add_argument(
        "--bundle",
        action="store_const",
        const="bundle",
        dest="kind",
        help="Non-interactive: page bundle …/YYYY-MM-DD-title/index.md",
    )
    parser.add_argument(
        "--date",
        metavar="YYYY-MM-DD",
        help="Writing date (default: today in Europe/Moscow)",
    )
    args = parser.parse_args()

    title = ask_title(args.title)
    when = resolve_when(args.date)
    year, month = when.year, when.month
    bucket = decade_bucket(year)
    day = when.strftime("%Y-%m-%d")
    leaf = f"{day}-{safe_title_segment(title)}"
    kind_val = ask_kind(args.kind, leaf)

    decade_dir = CONTENT_POSTS / bucket
    year_dir = decade_dir / f"{year}"
    month_dir = year_dir / f"{month:02d}"

    ensure_section_index(decade_dir, bucket)
    ensure_section_index(year_dir, str(year))
    ensure_section_index(month_dir, f"{year}-{month:02d}")

    body = front_matter(title, when, bundle=(kind_val == "bundle"))
    if kind_val == "flat":
        target = month_dir / f"{leaf}.md"
        if target.exists():
            raise SystemExit(f"Already exists: {target.relative_to(ROOT)}")
        target.write_text(body, encoding="utf-8")
    else:
        bundle = month_dir / leaf
        target = bundle / "index.md"
        if target.exists():
            raise SystemExit(f"Already exists: {target.relative_to(ROOT)}")
        if bundle.exists():
            raise SystemExit(f"Directory already exists: {bundle.relative_to(ROOT)}")
        bundle.mkdir(parents=True, exist_ok=False)
        target.write_text(body, encoding="utf-8")

    print(f"Created: {target.relative_to(ROOT)}")
    print("Preview:   hugo server")
    print(
        f"URL:    /posts/{year}/{when.strftime('%Y%m%d%H%M%S')}/  (slug)"
    )


if __name__ == "__main__":
    main()
