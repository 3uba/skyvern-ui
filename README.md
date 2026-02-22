# Skyvern UI

A lightweight, self-hosted web interface for [Skyvern](https://github.com/Skyvern-AI/skyvern) — the open-source browser automation platform powered by AI.

**Skyvern UI adds what Skyvern doesn't ship out of the box:** user authentication, role-based access control, and a secure API proxy — so you can deploy Skyvern in production without exposing it directly to the internet.

## Why does this exist?

Skyvern's built-in frontend has no authentication. Anyone with access to the URL can run automations, view credentials, and access the API key. That's fine for local development, but not for production.

Skyvern UI wraps Skyvern with:

- **Authentication** — email/password login with server-side sessions (30-day expiry)
- **Role-based access** — admin and user roles; admin manages users, regular users run automations
- **Secure API proxy** — the Skyvern API key is stored in the database and injected server-side; it never reaches the browser
- **Initial setup wizard** — Jenkins-style: the first person to access the app creates the admin account; no public registration
- **Audit logging** — every write operation is logged with user, action, and timestamp

## Architecture

```
┌──────────────┐       ┌─────────────────────────┐       ┌──────────────┐
│              │       │     Skyvern UI (:3000)   │       │              │
│   Browser    │──────▶│                          │──────▶│  Skyvern API │
│              │       │  /api/auth/*    (auth)   │       │  (internal)  │
│              │◀──────│  /api/skyvern/* (proxy)  │◀──────│              │
│              │       │                          │       │              │
└──────────────┘       └────────────┬─────────────┘       └──────────────┘
                                    │
                              ┌─────▼─────┐
                              │ PostgreSQL │
                              │ skyvern_ui │
                              └───────────┘
```

**Key design decisions:**

- Skyvern's port is **never exposed** — only accessible through the internal Docker network
- The browser **never talks to Skyvern directly** — every request goes through the Next.js proxy at `/api/skyvern/*`
- The **Skyvern API key is stored in the database**, not in environment variables; the admin sets it during initial setup or in Settings
- Skyvern UI uses its **own database** (`skyvern_ui`) on the same PostgreSQL instance — it does not touch Skyvern's `skyvern` database
- **Zero modifications to Skyvern** — this is a pure overlay

## Quick Start (Docker)

### Prerequisites

- Docker and Docker Compose
- A running Skyvern instance (or use the included docker-compose which expects Skyvern on the same Docker network)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/skyvern-ui.git
cd skyvern-ui
cp .env.example .env.local
```

Edit `.env.local` — at minimum, set a proper `BETTER_AUTH_SECRET`:

```bash
# Generate a secure secret
openssl rand -base64 32
```

### 2. Start with Docker Compose

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** — with automatic creation of the `skyvern_ui` database
- **Skyvern UI** — on port 3000

### 3. Initial setup

Open `http://localhost:3000`. You'll be redirected to the setup wizard where you:

1. Create your **admin account** (name, email, password)
2. Optionally configure the **Skyvern API key** and URL

After setup, you'll be signed in and redirected to the dashboard.

### 4. Add more users

Go to **Settings > Users** (admin only) and click **Invite User**. There is no public registration — only admins can create accounts.

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL with a `skyvern_ui` database

### Setup

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

### Available scripts

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
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Tables | [TanStack Table](https://tanstack.com/table) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Workflow builder | [@xyflow/react](https://reactflow.dev) |
| Icons | [Lucide](https://lucide.dev) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth handler
│   │   ├── setup/             # Initial setup API
│   │   └── skyvern/[...path]/ # Proxy → Skyvern API
│   ├── (auth)/
│   │   ├── login/             # Sign in page
│   │   └── setup/             # Initial setup wizard
│   └── (dashboard)/
│       ├── dashboard/         # Overview
│       ├── tasks/             # Task management
│       ├── workflows/         # Workflow builder
│       ├── runs/              # Run history
│       ├── credentials/       # Credential vault
│       ├── sessions/          # Browser sessions
│       └── settings/          # Settings + user management
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Sidebar, header, command menu
│   ├── auth/                  # Login form
│   ├── workflow/              # Workflow builder components
│   └── shared/                # Reusable components
├── hooks/                     # Custom React hooks
├── lib/
│   ├── api/                   # API client + proxy helper
│   ├── auth/                  # Better Auth config
│   ├── db/                    # Drizzle schema + connection
│   ├── audit/                 # Audit logging
│   └── utils/                 # Formatting helpers
├── providers/                 # React context providers
└── middleware.ts              # Auth middleware
```

## Database Schema

Skyvern UI uses 6 tables in the `skyvern_ui` database:

| Table | Purpose |
|-------|---------|
| `user` | User accounts with roles (`admin` / `user`) |
| `session` | Server-side sessions (Better Auth) |
| `account` | Auth provider accounts (Better Auth) |
| `verification` | Email verification tokens (Better Auth) |
| `organization_settings` | Skyvern API key and URL |
| `audit_log` | Action audit trail |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for the `skyvern_ui` database |
| `BETTER_AUTH_SECRET` | Yes | Session encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Public URL of this app (e.g., `https://skyvern.example.com`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `BETTER_AUTH_URL` |
| `SKYVERN_INTERNAL_URL` | No | Skyvern API base URL (default: `http://127.0.0.1:8448`) |

## How the Proxy Works

Every API request from the browser goes through `/api/skyvern/*`:

1. **Auth check** — validates the session cookie
2. **Config lookup** — fetches the Skyvern API key from the database
3. **Forward** — proxies the request to Skyvern with the API key injected as `x-api-key` header
4. **Audit log** — logs write operations (POST/PUT/PATCH/DELETE) with user info
5. **Response** — returns the Skyvern response to the browser

This means:
- The Skyvern API key **never leaves the server**
- Every action is **attributed to a user**
- Skyvern doesn't need to be **exposed to the internet**

## Docker Compose (Production)

The included `docker-compose.yml` runs PostgreSQL and Skyvern UI. To add Skyvern itself, extend it:

```yaml
services:
  postgres:
    image: postgres:14-alpine
    # ... (included in docker-compose.yml)

  skyvern:
    image: skyvern/skyvern:latest
    expose:
      - "8000"  # Internal only — not published to host
    environment:
      DATABASE_STRING: postgresql+psycopg://skyvern:skyvern@postgres:5432/skyvern
    depends_on:
      postgres:
        condition: service_healthy

  skyvern-ui:
    build: .
    ports:
      - "3000:3000"  # The only public port
    environment:
      SKYVERN_INTERNAL_URL: http://skyvern:8000
      DATABASE_URL: postgresql://skyvern:skyvern@postgres:5432/skyvern_ui
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: https://skyvern.example.com
      NEXT_PUBLIC_APP_URL: https://skyvern.example.com
    depends_on:
      postgres:
        condition: service_healthy
```

## Security Considerations

- **Change `BETTER_AUTH_SECRET`** before deploying — use `openssl rand -base64 32`
- **Change the PostgreSQL password** — the default `skyvern/skyvern` is for development only
- **Use HTTPS** in production — put a reverse proxy (nginx, Caddy, Traefik) in front
- **Don't expose Skyvern's port** — keep it on the internal Docker network
- The Skyvern API key is stored encrypted-at-rest if your PostgreSQL supports it

## License

MIT
