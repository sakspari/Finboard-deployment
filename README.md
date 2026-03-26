# Finboard

A personal finance CSV visualizer. Upload your bank statement and instantly see spending breakdowns, income vs expenses, merchant insights, and transaction trends.

**No accounts. No database. Your data stays in your browser.**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS v4, Zustand, Motion, Recharts |
| Backend | Express.js, TypeScript, PapaParse, Multer |
| Monorepo | pnpm workspaces, Turborepo |
| CI/CD | GitHub Actions |
| Deployment | Docker + Docker Compose |

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+

### Development

```bash
# Install dependencies
pnpm install

# Start dev servers (frontend :3000, backend :3001)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and upload a CSV file.

### Docker

```bash
docker compose up --build
```

## CSV Format

Finboard auto-detects common bank CSV formats. Required columns:

| Column | Aliases |
|--------|---------|
| Date | `date`, `transaction_date`, `posting_date` |
| Amount | `amount`, `debit`/`credit` |
| Description | `description`, `memo`, `payee` |

Supported date formats: `MM/DD/YYYY`, `YYYY-MM-DD`, `DD/MM/YYYY`, `DD-Mon-YY`

## Project Structure

```
Finboard/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker/
├── .github/workflows/
└── docs/plans/
```

## Features

### Core
- Drag-and-drop CSV upload with validation
- Auto-categorization of transactions (12 categories, keyword matching)
- Summary cards: income, expenses, net balance, transaction count
- Transaction table with sort, pagination, and search
- Responsive design (mobile to desktop)
- Smooth Motion animations with glassmorphism UI

### Charts & Visualization
- Spending by category donut chart
- Income vs expenses area chart
- Category shape radar chart
- **Chart layout switcher** — pick from 6 presets: Overview, Spending Focus, Category Deep Dive, Trends & Shape, Full Analysis, and Minimal

### Category Correction
- Click any category badge in the transaction table to reassign it
- **"Apply to similar"** option auto-corrects matching merchants/descriptions
- Corrections persist in session storage (no database needed)
- Correction count shown in the header with a clear button

### Period Comparison
- **Compare toggle** in the header activates comparison mode
- Auto mode splits your data in half; custom mode lets you pick exact date ranges
- Delta cards show % change in income, expenses, balance, and transaction count
- Category-level change breakdown table with color-coded direction indicators

### Merchant Insights
- **Recurring transaction detection** — finds subscriptions and repeating payments by analyzing amount similarity and interval regularity
- Frequency detection: weekly, biweekly, monthly, quarterly, annual
- Estimated monthly cost per recurring item
- **Top merchants** ranked by total spend with visual bar chart

### Filters
- Search by description
- Filter by category (multi-select)
- All charts and insights update in real-time as filters change

## Architecture

- **Stateless backend** — Parse CSV, return JSON, forget. No database, no sessions.
- **Client-side state** — Zustand with sessionStorage persistence. Filters, corrections, and insights computed on the frontend.
- **Type-safe** — Branded types, readonly interfaces, strict TypeScript across the monorepo.
- **Security** — CSV injection sanitization, rate limiting, helmet headers, file validation.

## Demo Flow

1. Open `http://localhost:3000`
2. Drag and drop a bank statement CSV (or click to browse)
3. See summary cards, charts, and insights instantly
4. Use the **chart layout switcher** to customize the visualization
5. Click the **Compare** button to see period-over-period changes
6. Click any category badge in the table to correct a miscategorized transaction
7. Scroll down to see **recurring transactions** and **top merchants**
8. Use search and category filters to drill into specific data
