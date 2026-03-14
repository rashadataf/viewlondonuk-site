# ViewLondon UK

A modern real estate platform for London property — currently displaying a Coming Soon page.

## Architecture

- **Next.js 15** (App Router) in `site/` — branded landing page with server-side rendering
- **Traefik v2** — reverse proxy with automatic TLS via Let's Encrypt
- **Pulumi YAML** in `infra/` — infrastructure-as-code managing Docker containers on VPS
- **Docker** — multi-stage builds, zero host-installed runtimes

## Local Development

**Prerequisites**: Docker Desktop, Pulumi CLI

1. Start the development stack:
   ```sh
   cd infra
   pulumi up --stack dev
   ```

2. Open [http://localhost](http://localhost)

Hot reload is enabled — changes to files in `site/` are reflected immediately.

## Production Deployment

SSH into the VPS, authenticate with your container registry, then:

```sh
cd infra
pulumi up --stack prod
```

Pulumi builds the Docker image on the VPS, creates the Traefik + site containers, and configures TLS.

Stack config lives in `infra/Pulumi.prod.yaml`. All environment-specific values (domain, email, TLS settings) are configured there — no hardcoded values in source.

## Project Structure

```
site/                    # Next.js application
├── app/                 # App Router pages and layout
├── public/              # Static assets (OG image, favicon)
├── Dockerfile           # Multi-stage: base → development → production
└── package.json

infra/                   # Pulumi infrastructure
├── Pulumi.yaml          # Project definition with resources
├── Pulumi.dev.yaml      # Dev stack config
└── Pulumi.prod.yaml     # Prod stack config
```
