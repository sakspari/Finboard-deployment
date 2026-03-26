# Finboard — Development Conventions

## Tech Stack
- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui, Zustand, Motion, Recharts
- **Backend:** Express.js, TypeScript, PapaParse, Multer
- **Shared:** @finboard/shared (types + constants, no build step)

## File Naming
- React components: PascalCase `.tsx` (e.g., `SummaryCards.tsx`)
- Non-component files: camelCase `.ts` (e.g., `transactionStore.ts`)
- Zustand hook exports: `use` + PascalCase (e.g., `useTransactionStore`)

## Key Patterns
- Zustand stores: discriminated status union (`"idle" | "loading" | "success" | "error"`)
- Derived selectors: pure functions in `hooks/useFilteredData.ts`, memoized with `useMemo`
- Backend services: pure functions (input → output), no session state
- Tailwind v4: configure via `@theme` in `globals.css`, NOT `tailwind.config.js`
- Motion: import from `"motion/react"` (NOT `"framer-motion"`)

## Commands
- `pnpm dev` — Start all apps in development
- `pnpm build` — Build all packages
- `pnpm lint` — Lint all packages
- `pnpm typecheck` — Type-check all packages
