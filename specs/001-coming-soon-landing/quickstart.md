# Quickstart: Coming Soon Landing Page

**Feature**: `001-coming-soon-landing`

## Prerequisites

- Docker Engine ≥ 24.0
- Docker Compose ≥ 2.20
- Git

No Node.js, npm, or Pulumi CLI required for local development.

## 1. Clone and Checkout

```bash
git clone <repo-url> viewlondonuk-web
cd viewlondonuk-web
git checkout 001-coming-soon-landing
```

## 2. Add Local Host Entry

```bash
echo "127.0.0.1 viewlondonuk.local www.viewlondonuk.local" | sudo tee -a /etc/hosts
```

## 3. Start Development Environment

```bash
docker compose up
```

This starts:
- **Traefik** — reverse proxy on ports 80/443, dashboard on port 8080
- **Next.js** (development target) — hot-reload enabled, source mounted via bind mount

## 4. Open in Browser

Navigate to `http://viewlondonuk.local`. You should see the Coming Soon page
with:
- ViewLondon UK brand name
- "Coming Soon" heading
- Tagline
- Contact email link

The Traefik dashboard is available at `http://localhost:8080`.

## 5. Edit Content

Edit files in `site/app/` — changes are reflected immediately via Next.js hot
reload (the `site/` directory is bind-mounted into the development container).

## 6. Stop

```bash
docker compose down
```

---

## Production Deployment

Production deployments are managed exclusively via Pulumi:

```bash
cd infra
pulumi stack select prod
pulumi up
```

This:
1. Builds the Docker image with `--target production`
2. Copies the generated `docker-compose.yaml` to the VPS
3. Runs `docker compose up -d` on the remote server

See [contracts/pulumi-config.md](contracts/pulumi-config.md) for required
stack configuration values.
