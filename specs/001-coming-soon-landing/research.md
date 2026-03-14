# Research: Coming Soon Landing Page

**Feature**: `001-coming-soon-landing`
**Date**: 2026-03-13

## R-001: Next.js Multi-Stage Dockerfile

**Decision**: Use a three-stage Dockerfile (`base` → `development` → `production`) with `node:22-alpine`. Production stage uses `output: 'standalone'` mode so the final image copies only `.next/standalone`, `.next/static`, and `public/` — running `node server.js` instead of `next start` for a minimal ~150 MB image.

**Rationale**: Next.js `standalone` output traces only the required Node.js dependencies, eliminating the full `node_modules` from the production image. This aligns with Constitution Principle II (zero host-side runtime, minimal Docker footprint) and the official `vercel/next.js` Docker example.

**Alternatives considered**:
- `next start` with full `node_modules` — larger image, slower cold start, unnecessary dependencies in production.
- Static export (`output: 'export'`) served by nginx — eliminates SSR capability needed for future platform stages (Constitution Principle VI), and introduces nginx contrary to the Traefik-only architecture.

## R-002: Runtime Configuration via Server Components

**Decision**: Pass environment-specific values (contact email, tagline) as plain environment variables (no `NEXT_PUBLIC_` prefix) and read them in Server Components at request time. This avoids baking config into the JavaScript bundle at build time.

**Rationale**: Constitution Principle IV requires all config from Pulumi stack files. Since `NEXT_PUBLIC_` vars are inlined at `next build` time, changing them requires a rebuild. Plain env vars read in Server Components allow the same image to run with different config per stack (dev/prod) simply by changing Docker environment variables in the Compose file.

**Alternatives considered**:
- `NEXT_PUBLIC_` build-time vars — would require per-environment image builds, defeating the single-image-per-commit pattern for CI/CD.
- Runtime `publicRuntimeConfig` — deprecated in Next.js App Router.

## R-003: Traefik v3 SSL + Routing Configuration

**Decision**: Traefik v3 handles all edge routing:
- **HTTP→HTTPS**: Configured at the entrypoint level (`entryPoints.http.http.redirections.entryPoint.to: https`) — global, no per-service middleware needed.
- **www→apex**: A `redirectregex` middleware applied to the Next.js router, matching `^https?://www\.viewlondonuk\.com/(.*)` and redirecting to `https://viewlondonuk.com/$1` with `permanent: true` (301).
- **ACME**: `certificatesResolvers.letsencrypt.acme.httpChallenge.entryPoint: http` with storage at `/letsencrypt/acme.json` on a named Docker volume.
- **Routing**: Docker provider labels on the Next.js service define the router rule `Host(\`viewlondonuk.com\`) || Host(\`www.viewlondonuk.com\`)` on the `https` entrypoint.

**Rationale**: Entrypoint-level redirect is the simplest mechanism for global HTTP→HTTPS (no middleware to manage). The `redirectregex` middleware handles www→apex at the routing layer, keeping DNS simple (both A/CNAME records point to the same server). Constitution Principle V is satisfied: TLS via Traefik + ACME, no manual certs, no nginx.

**Alternatives considered**:
- DNS-level redirect (e.g., Cloudflare page rule) — adds a provider dependency and splits redirect logic between DNS and Traefik.
- Separate Traefik router for www — more verbose, harder to maintain than a middleware.

## R-004: Pulumi YAML for VPS Deployment

**Decision**: Use Pulumi YAML runtime with the `command` provider (`command:remote:CopyToRemoteFile` and `command:remote:Command`) to template and deploy `docker-compose.yaml` to the VPS via SSH. The compose file is templated inline in `Pulumi.yaml` with stack config interpolation.

**Rationale**: The `command` provider is the recommended Pulumi approach for VPS targets that aren't managed cloud services. It requires only SSH access — no Docker daemon on the CI runner, no cloud-specific provider. This satisfies Constitution Principle III: all infra in Pulumi YAML, `pulumi up` as sole deployment mechanism.

**Alternatives considered**:
- Pulumi `docker` provider pointed at remote daemon — requires exposing the Docker API over TLS on the VPS, increasing attack surface.
- Ansible/Terraform — violates Constitution Principle III (Pulumi YAML as single IaC tool).

## R-005: CI/CD via GitHub Actions

**Decision**: Use `pulumi/actions@v6` in GitHub Actions. Workflow: checkout → build Docker image with `--target` from stack config → push to container registry → `pulumi up --stack <env>`. PRs run `pulumi preview` with PR comment output.

**Rationale**: Official Pulumi GitHub Action handles OIDC auth, caching, and preview commenting. The build target (development/production) is sourced from stack config, keeping CI/CD environment-agnostic.

**Alternatives considered**:
- Self-hosted runner on VPS — adds maintenance burden; GH-hosted runners are sufficient.
- Manual SSH deploy script — violates Constitution Principle III.

## R-006: Local Development with Traefik

**Decision**: A root `docker-compose.yaml` mirrors production topology (Traefik + Next.js) but uses `viewlondonuk.local` as the host rule and skips ACME (HTTP-only or Traefik's default self-signed cert). Developers add `127.0.0.1 viewlondonuk.local` to `/etc/hosts`. The development Docker target runs `next dev` with hot reload via a bind-mounted `site/` directory.

**Rationale**: Constitution Development Workflow mandates that `docker compose up` reproduces production topology locally. Using a `.local` domain avoids ACME rate-limit issues and doesn't require real DNS.

**Alternatives considered**:
- `mkcert` for trusted local certs — adds a setup step; HTTP is sufficient for local dev.
- Running Next.js outside Docker locally — violates the principle of matching production topology.
