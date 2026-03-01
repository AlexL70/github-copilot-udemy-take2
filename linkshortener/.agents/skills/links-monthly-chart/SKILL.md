---
name: links-monthly-chart
description: >
  Generates a PNG bar chart showing the number of links created each month
  over the past 12 months by querying the linkshortener PostgreSQL database.
  Use this skill whenever the user asks to visualise, chart, graph, plot, or
  report on link-creation activity, monthly link statistics, link trends, or
  anything involving the links database and a time-based breakdown. Also trigger
  this skill if the user asks questions like "how many links were created last
  month?", "show me link growth", "export a chart of links", or "generate a
  report on link history".
---

# Links Monthly Chart Skill

## What this skill does

Connects to the project's PostgreSQL database (reading `DATABASE_URL` from the
nearest `.env` file), counts how many short-links were created in each of the
past 12 calendar months, and renders the result as a labelled bar chart saved
as a PNG image.

---

## When to use this skill

- User wants a chart / graph / visualisation of link-creation data
- User asks about monthly, historical, or trend statistics for links
- User wants to "export" or "generate a report" on link history
- User asks questions such as "how many links were created last month?"

---

## Prerequisites

Install the two required Python packages if they are missing:

```bash
pip install psycopg2-binary matplotlib
```

> **macOS with Homebrew Python (PEP 668):** If pip refuses to install into the
> system interpreter, add `--break-system-packages`:
>
> ```bash
> python3 -m pip install psycopg2-binary matplotlib --break-system-packages
> ```

---

## Running the script

The bundled script is at `scripts/plot_links.py` relative to this skill file.

### Basic usage (output saved in current working directory)

```bash
python <skill-dir>/scripts/plot_links.py
```

### Specify a custom output path

```bash
python <skill-dir>/scripts/plot_links.py --output /path/to/chart.png
```

### Specify a custom .env file location

```bash
python <skill-dir>/scripts/plot_links.py --env /path/to/.env
```

---

## How it works

1. **Locate `DATABASE_URL`** – The script walks up the directory tree from its
   own location to find the nearest `.env` file and reads `DATABASE_URL` from
   it. You can override this with `--env`.

2. **Query the database** – Executes this SQL against the `links` table:

   ```sql
   SELECT
       TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE 'UTC'), 'YYYY-MM') AS month,
       COUNT(*) AS total_links
   FROM links
   WHERE created_at >= (NOW() AT TIME ZONE 'UTC') - INTERVAL '12 months'
   GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC')
   ORDER BY 1 ASC;
   ```

3. **Fill the series** – Months with zero links are inserted so the X axis
   always spans the full 12-month window.

4. **Render the chart** – Produces an indigo bar chart with labelled bars,
   clean gridlines, and a 150 DPI PNG output.

---

## Output

A PNG file (default name: `links_monthly_chart.png`) in the current working
directory, or at the path provided via `--output`.

Tell the user where the file was saved and (if VS Code is open) suggest they
open it with `code <path>`.

---

## Troubleshooting

| Problem                                           | Fix                                                    |
| ------------------------------------------------- | ------------------------------------------------------ |
| `ModuleNotFoundError: psycopg2`                   | `pip install psycopg2-binary`                          |
| `ModuleNotFoundError: matplotlib`                 | `pip install matplotlib`                               |
| `FileNotFoundError: Could not locate a .env file` | Pass `--env /absolute/path/to/.env`                    |
| `ValueError: DATABASE_URL not found`              | Make sure `.env` contains a `DATABASE_URL=...` line    |
| SSL / connection errors with Neon                 | Ensure your `DATABASE_URL` includes `?sslmode=require` |
