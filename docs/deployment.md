# Deployment

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for the `skyvern_ui` database |
| `BETTER_AUTH_SECRET` | Yes | Session encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Public URL of this app (e.g., `https://skyvern.example.com`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `BETTER_AUTH_URL` |
| `SKYVERN_INTERNAL_URL` | No | Skyvern API base URL (default: `http://127.0.0.1:8448`) |

## Docker Compose

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

## Docker Image

The Dockerfile uses a multi-stage build:

1. **deps** — installs node_modules
2. **builder** — runs `next build` with standalone output
3. **runner** — minimal Node.js 20 Alpine image, non-root user, port 3000

## Security Checklist

- [ ] **Change `BETTER_AUTH_SECRET`** — use `openssl rand -base64 32`
- [ ] **Change the PostgreSQL password** — the default `skyvern/skyvern` is for development only
- [ ] **Use HTTPS** — put a reverse proxy (nginx, Caddy, Traefik) in front of Skyvern UI
- [ ] **Don't expose Skyvern's port** — keep it on the internal Docker network
- [ ] **Keep Skyvern UI as the only public entry point** — port 3000 should be the only port published to the host

## Notes

- There is **no public registration** — only admins can create user accounts
- Sessions track **IP address and user agent** for security auditing
- The artifact proxy has a **URL allowlist** — only S3, CloudFlare R2, Google Cloud Storage, Azure Blob, and localhost are allowed
- The Skyvern API key is stored in the database, not in env vars — it's set during initial setup or in Settings
