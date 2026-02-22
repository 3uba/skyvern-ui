# Development

## Prerequisites

- Node.js 20+
- PostgreSQL with a `skyvern_ui` database

## Setup

```bash
# Install dependencies
npm install

# Create the database (if using the Docker postgres)
docker exec -it <postgres-container> psql -U skyvern -c "CREATE DATABASE skyvern_ui;"

# Push the schema to the database
npm run db:push

# Start the dev server
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (dev only) |
| `npm run db:studio` | Open Drizzle Studio (visual DB editor) |
| `npm run generate:api` | Regenerate TypeScript SDK from Skyvern's OpenAPI spec |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Auth | [Better Auth](https://www.better-auth.com) with admin plugin |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) |
| UI | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS 4](https://tailwindcss.com) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) (light/dark mode) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Tables | [TanStack Table](https://tanstack.com/table) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| State | [Zustand](https://zustand.docs.pmnd.rs) |
| Command palette | [cmdk](https://cmdk.paco.me) |
| Real-time | WebSocket (custom manager with auto-reconnect) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Notifications | [Sonner](https://sonner.emilkowal.dev) |
| Icons | [Lucide](https://lucide.dev) |
| API client | Auto-generated from Skyvern's OpenAPI spec via [@hey-api/openapi-ts](https://heyapi.dev) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/         # Better Auth handler
│   │   ├── artifact-proxy/        # CORS proxy for S3/cloud artifacts
│   │   ├── setup/                 # Initial setup API
│   │   └── skyvern/[...path]/     # Authenticated proxy → Skyvern API
│   ├── (auth)/
│   │   ├── login/                 # Sign in page
│   │   ├── register/              # Redirects to login (no public registration)
│   │   └── setup/                 # Initial setup wizard
│   └── (dashboard)/
│       ├── dashboard/             # Overview
│       ├── tasks/                 # Task list + new task + task detail
│       ├── workflows/             # Workflow list + builder + run history
│       ├── runs/                  # Run list + run detail (6-tab view)
│       ├── credentials/           # Credential vault
│       ├── sessions/              # Browser sessions
│       └── settings/              # Settings + user management + audit log
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── layout/                    # Sidebar, header, command menu (Cmd+K)
│   ├── auth/                      # Login form
│   ├── browser/                   # Live browser viewport (WebSocket)
│   ├── runs/                      # Run detail components (overview, steps, output, etc.)
│   ├── workflow/                  # Block-based workflow builder
│   └── shared/                    # Reusable components (empty state, loading, errors, etc.)
├── hooks/                         # Custom React hooks (tasks, workflows, runs, credentials, sessions, WebSocket)
├── lib/
│   ├── api/                       # API client + proxy helper + auto-generated SDK
│   ├── auth/                      # Better Auth config (server + client)
│   ├── db/                        # Drizzle schema + connection
│   ├── audit/                     # Audit logging
│   ├── ws/                        # WebSocket manager (singleton, auto-reconnect)
│   └── utils/                     # Date/duration formatting helpers
├── providers/                     # React context providers (TanStack Query, theme)
└── middleware.ts                   # Auth middleware (session validation on edge)
```

## API Client Generation

The TypeScript API client is auto-generated from Skyvern's OpenAPI specification:

```bash
npm run generate:api
```

This generates types, SDK functions, and TanStack Query hooks in `src/lib/api/generated/`.
