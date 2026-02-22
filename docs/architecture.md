# Architecture

## Overview

```
┌──────────────┐       ┌───────────────────────────────┐       ┌──────────────┐
│              │       │       Skyvern UI (:3000)       │       │              │
│   Browser    │──────>│                                │──────>│  Skyvern API │
│              │       │  /api/auth/*         (auth)    │       │  (internal)  │
│              │<──────│  /api/skyvern/*      (proxy)   │<──────│              │
│              │  WS   │  /api/artifact-proxy (CORS)    │       │              │
│              │<─ ─ ─>│  /api/setup/*        (wizard)  │       │              │
└──────────────┘       └───────────────┬────────────────┘       └──────────────┘
                                       │
                                 ┌─────▼─────┐
                                 │ PostgreSQL │
                                 │ skyvern_ui │
                                 └───────────┘
```

## Key Design Decisions

- Skyvern's port is **never exposed** — only accessible through the internal Docker network
- The browser **never talks to Skyvern directly** — every request goes through the Next.js proxy at `/api/skyvern/*`
- The **Skyvern API key is stored in the database**, not in environment variables; the admin sets it during initial setup or in Settings
- Skyvern UI uses its **own database** (`skyvern_ui`) on the same PostgreSQL instance — it does not touch Skyvern's `skyvern` database
- **Zero modifications to Skyvern** — this is a pure overlay

## How the API Proxy Works

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

## Artifact Proxy

Artifact downloads (screenshots, recordings, files) go through `/api/artifact-proxy` to bypass CORS:

1. **Auth check** — validates the session cookie
2. **URL validation** — only allows trusted cloud storage providers:
   - AWS S3 (`*.amazonaws.com`)
   - CloudFlare R2 (`*.r2.cloudflarestorage.com`)
   - Google Cloud Storage (`*.storage.googleapis.com`)
   - Azure Blob Storage (`*.blob.core.windows.net`)
   - Localhost (`localhost`, `127.0.0.1`)
3. **Fetch & cache** — downloads the artifact server-side and returns it with `Cache-Control: private, max-age=3600`

## Authentication

- **Better Auth** with email/password and the admin plugin
- Server-side sessions stored in PostgreSQL (30-day expiry)
- Sessions track IP address and user agent
- Edge middleware validates session tokens before allowing access to protected routes
- No public registration — only admins can create accounts

### Setup Wizard

On first access (no users in the database), the app redirects to `/setup` where you:
1. Create the admin account (name, email, password)
2. Optionally configure the Skyvern API key and URL

## WebSocket

A singleton WebSocket manager (`src/lib/ws/websocket-manager.ts`) provides:
- Event subscription system
- Automatic reconnection with exponential backoff (up to 10 attempts)
- Used for live browser viewport — streaming screenshots in real time

## Database Schema

6 tables in the `skyvern_ui` database:

| Table | Purpose |
|-------|---------|
| `user` | User accounts with roles (`admin` / `user`) and ban status |
| `session` | Server-side sessions with expiry, token, IP address, user agent |
| `account` | Auth provider accounts (Better Auth) |
| `verification` | Email verification tokens (Better Auth) |
| `organization_settings` | Skyvern API key and backend URL |
| `audit_log` | Action audit trail (user, action, resource, details JSON, IP, timestamp) |
