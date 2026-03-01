#!/usr/bin/env python3
"""
plot_links.py - Query the linkshortener database and generate a monthly links bar chart.

Usage:
    python plot_links.py [--output OUTPUT_PATH] [--env ENV_PATH]

Arguments:
    --output    Path for the output PNG file (default: links_monthly_chart.png)
    --env       Path to .env file (default: auto-detected project root .env)
"""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


def find_env_file(start_path: Path) -> Path:
    """Walk up from start_path to find the nearest .env file."""
    current = start_path.resolve()
    for candidate in [current, *current.parents]:
        env_file = candidate / ".env"
        if env_file.exists():
            return env_file
    raise FileNotFoundError(
        "Could not locate a .env file. "
        "Pass --env <path> to specify one explicitly."
    )


def load_database_url(env_path: Path) -> str:
    """Read DATABASE_URL from a .env file without requiring python-dotenv."""
    with env_path.open() as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            if key.strip() == "DATABASE_URL":
                # Strip surrounding quotes if present
                value = value.strip().strip('"').strip("'")
                return value
    raise ValueError(f"DATABASE_URL not found in {env_path}")


def query_monthly_link_counts(database_url: str) -> list[tuple[str, int]]:
    """
    Query the links table for counts grouped by month over the past 12 months.
    Returns a list of (month_label, count) tuples ordered chronologically.
    """
    try:
        import psycopg2  # type: ignore
    except ImportError:
        print("psycopg2 is required. Install it with:  pip install psycopg2-binary")
        sys.exit(1)

    sql = """
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE 'UTC'), 'YYYY-MM') AS month,
            COUNT(*) AS total_links
        FROM links
        WHERE created_at >= (NOW() AT TIME ZONE 'UTC') - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC')
        ORDER BY 1 ASC;
    """

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
    finally:
        conn.close()

    return [(str(row[0]), int(row[1])) for row in rows]


def build_full_12_month_series(
    rows: list[tuple[str, int]],
) -> tuple[list[str], list[int]]:
    """
    Fill in any months with zero links so the X axis always shows all 12 months.
    Months are labelled as 'Mon YYYY' (e.g. 'Jan 2025').
    """
    now = datetime.now(tz=timezone.utc)
    # Build ordered list of the past 12 calendar months (oldest → newest)
    months_ordered: list[str] = []
    for offset in range(11, -1, -1):
        # Go back 'offset' months from the current month
        year = now.year
        month = now.month - offset
        while month <= 0:
            month += 12
            year -= 1
        months_ordered.append(f"{year}-{month:02d}")

    counts_by_month: dict[str, int] = dict(rows)

    labels: list[str] = []
    counts: list[int] = []
    for key in months_ordered:
        year, month = map(int, key.split("-"))
        label = datetime(year, month, 1).strftime("%b %Y")
        labels.append(label)
        counts.append(counts_by_month.get(key, 0))

    return labels, counts


def plot_bar_chart(labels: list[str], counts: list[int], output_path: str) -> None:
    """Render and save the bar chart as a PNG."""
    try:
        import matplotlib  # type: ignore
        # Non-interactive backend — works without a display
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt  # type: ignore
        import matplotlib.ticker as ticker  # type: ignore
    except ImportError:
        print("matplotlib is required. Install it with:  pip install matplotlib")
        sys.exit(1)

    fig, ax = plt.subplots(figsize=(14, 6))

    bar_color = "#4F46E5"  # Indigo — matches the project's colour scheme
    bars = ax.bar(
        range(len(labels)),
        counts,
        color=bar_color,
        width=0.6,
        edgecolor="white",
        linewidth=0.8,
    )

    # Annotate each bar with its value
    for bar, count in zip(bars, counts):
        if count > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + max(counts) * 0.01,
                str(count),
                ha="center",
                va="bottom",
                fontsize=9,
                color="#374151",
            )

    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=30, ha="right", fontsize=10)
    ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    ax.set_xlabel("Month", fontsize=12, labelpad=8)
    ax.set_ylabel("Links Created", fontsize=12, labelpad=8)
    ax.set_title("Links Created per Month (Last 12 Months)",
                 fontsize=14, fontweight="bold", pad=14)
    ax.set_ylim(bottom=0)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.4)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Chart saved to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a monthly links bar chart.")
    parser.add_argument(
        "--output",
        default="links_monthly_chart.png",
        help="Output PNG file path (default: links_monthly_chart.png)",
    )
    parser.add_argument(
        "--env",
        default=None,
        help="Path to .env file (default: nearest .env walking up from script location)",
    )
    args = parser.parse_args()

    # Resolve the .env file
    env_path = Path(args.env) if args.env else find_env_file(
        Path(__file__).parent)
    print(f"Using .env file: {env_path}")

    database_url = load_database_url(env_path)
    print("Connecting to database…")

    rows = query_monthly_link_counts(database_url)
    print(
        f"Fetched {sum(c for _, c in rows)} links across {len(rows)} month(s) with data.")

    labels, counts = build_full_12_month_series(rows)
    print("Rendering chart…")

    plot_bar_chart(labels, counts, args.output)


if __name__ == "__main__":
    main()
