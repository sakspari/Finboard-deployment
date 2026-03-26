# Finboard

A personal finance CSV visualizer. Upload your bank statement and instantly see spending breakdowns, income vs expenses, and transaction insights.

**No accounts. No database. Your data stays in your browser.**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS v4, shadcn/ui, Zustand, Motion, Recharts |
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

Open [http://localhost:3000](http://localhost:3000) and upload a CSV file. A sample is included at `apps/web/public/sample.csv`.

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

- Drag-and-drop CSV upload with validation
- Auto-categorization of transactions (12 categories, keyword matching)
- Summary cards: income, expenses, net balance, transaction count
- Spending by category donut chart
- Income vs expenses bar chart
- Insights: top category, biggest expense, daily average
- Transaction table with sort and pagination
- Filter by category and search by description
- Responsive design (mobile to desktop)
- Smooth Motion animations

## Architecture

- **Stateless backend** — Parse CSV, return JSON, forget. No database, no sessions.
- **Client-side state** — Zustand with sessionStorage persistence. Filters and insights computed on the frontend.
- **Type-safe** — Branded types, readonly interfaces, strict TypeScript across the monorepo.
- **Security** — CSV injection sanitization, rate limiting, helmet headers, file validation.
