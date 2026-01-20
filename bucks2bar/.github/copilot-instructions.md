# Bucks2Bar - Copilot Instructions

## Project Overview

**Bucks2Bar** is a single-page financial tracker application that visualizes monthly income vs expenses as an interactive bar chart. Built as a standalone HTML/CSS/JS application with no build process or backend.

## Architecture

- **Single-page structure**: [index.html](../index.html) contains all UI markup with Bootstrap 5 tabs
- **Client-side only**: No server, API calls, or authentication
- **External dependencies via CDN**:
  - Bootstrap 5.3.0 for UI components and responsive layout
  - Chart.js 4.4.0 for bar chart visualization

## Key Patterns & Conventions

### UI elements

All buttons must be a pink color with blue text.

### Data Model

- Monthly data stored transiently in DOM input fields (12 months: `jan` through `dec`)
- Two parallel arrays track income/expense per month in [script.js](../script.js)
- Month IDs follow pattern: `income-{month}` and `expense-{month}` (e.g., `income-jan`, `expense-feb`)
- Data persists only during session (no localStorage or backend)

### Chart Lifecycle

- Chart instance stored in global `myChart` variable (line 6)
- **Lazy initialization**: Chart only renders when "Chart" tab is activated (see `shown.bs.tab` event listener)
- **Destroy before recreate**: Always call `myChart.destroy()` before creating new chart to prevent memory leaks
- Chart configuration uses light green (`rgba(144, 238, 144, 0.7)`) for income, light red (`rgba(255, 160, 160, 0.7)`) for expenses

### Data Initialization

- `initializeRandomData()` generates random values between $50-$8000 on page load
- Algorithm ensures income ≥ expenses by assigning `Math.max()` to income and `Math.min()` to expenses
- To modify range or logic, edit lines 89-100

### Input Validation

- All inputs have `min="0"` attribute and runtime validation preventing negative values
- Event listener pattern: Loop through `.income-input, .expense-input` classes, not individual IDs
- Validation resets negative values to 0 immediately on input

## Development Workflows

### Running the Application

```bash
# No build step required - open directly in browser
open index.html
# Or use a simple HTTP server for CORS safety
python3 -m http.server 8000
```

### Adding New Months

1. Add HTML input pair in [index.html](../index.html) following existing pattern
2. Add month abbreviation to `months` array (line 2)
3. Add full name to `monthLabels` array (line 3)
4. All data collection loops automatically include new month

### Chart Download Feature

- Triggered by "Download Chart" button → `downloadChartAsPNG()` function
- Uses Chart.js built-in `toBase64Image()` method
- Creates temporary `<a>` element to trigger browser download
- Output filename: `income-expenses-chart.png`

## Important Constraints

- **No module system**: All code in single `script.js` file, variables in global scope
- **No transpilation/bundling**: Write ES5+ compatible code that runs directly in browsers
- **No styling file**: All styles via Bootstrap classes or inline in HTML
- **Tab state**: Bootstrap manages tab switching; chart updates on tab activation event, not data change
