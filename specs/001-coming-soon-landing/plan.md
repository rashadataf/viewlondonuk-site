# Implementation Plan: Coming Soon Landing Page

**Branch**: `001-coming-soon-landing` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-coming-soon-landing/spec.md`

## Summary

Deliver a branded "Coming Soon" landing page for viewlondonuk.com as a Next.js
application running inside a multi-stage Docker container. Traefik v3 sits in
front handling TLS via Let's Encrypt and routing all traffic — including www→apex
and HTTP→HTTPS redirects. All configuration (domain, contact email, ACME email,
build target, internal port) comes exclusively from Pulumi YAML stack config
files. No runtime is installed on the VPS beyond Docker and the Pulumi CLI.
CI/CD uses GitHub Actions to build the correct Docker target, push to registry,
and run `pulumi up`.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 22 LTS (inside Docker only)
**Primary Dependencies**: Next.js 15 (App Router), React 19, Tailwind CSS 4
**Storage**: N/A — no database; no persistent state
**Testing**: Playwright (E2E for redirect & rendering), Lighthouse CI (performance/SEO/a11y)
**Target Platform**: Linux VPS (Ubuntu LTS) running Docker Engine + Traefik v3
**Project Type**: Containerised web application (static-first landing page)
**Performance Goals**: < 2 s first contentful paint on broadband; Lighthouse ≥ 90 all categories
**Constraints**: Zero host-installed runtimes; all services in Docker; config solely from Pulumi stack files
**Scale/Scope**: Single page, single domain, 1 container + Traefik

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Brand-First Presentation | ✅ PASS | Clean branded page; no framework boilerplate visible in production. Custom layout with Tailwind, no default Next.js splash. |
| II | Zero Server-Side Runtime | ✅ PASS | Next.js runs via `node server.js` (standalone output) inside Docker; host runs only Docker Engine + Traefik. No Node/Python/PHP on VPS. |
| III | Pulumi YAML as Single Source of Truth | ✅ PASS | Docker Compose, Traefik config, and DNS all declared in Pulumi YAML. `pulumi up` is sole deployment mechanism. |
| IV | Stack Config as Sole Configuration Surface | ✅ PASS | Domain, contact email, ACME email, build target, internal port all from `Pulumi.<stack>.yaml`. No hardcoded env-specific values. |
| V | SSL Termination via Traefik + Let's Encrypt | ✅ PASS | Traefik handles TLS with ACME auto-renewal. No self-signed certs, no manual management, no nginx. |
| VI | Progressive Platform Evolution | ✅ PASS | Next.js is the long-term framework. Coming Soon page is the first evolutionary stage; subsequent stages add routes/services behind Traefik without re-architecting. URL backward compat maintained. |

**Gate result: PASS** — no violations. Complexity Tracking section not needed.

### Post-Design Re-Check (after Phase 1)

All six principles re-verified against concrete design artifacts:
- **I**: Branded `not-found.tsx`; OG metadata in contracts; Tailwind custom styling.
- **II**: `output: 'standalone'` confirmed in research (R-001); `node server.js` in Docker.
- **III**: `command:remote:CopyToRemoteFile` + `command:remote:Command` in Pulumi YAML (R-004).
- **IV**: All config keys documented in `contracts/pulumi-config.md`; runtime env vars via Server Components (R-002).
- **V**: ACME HTTP-01 via Traefik entrypoint; `acme.json` on named volume (R-003).
- **VI**: Next.js App Router allows incremental route addition; new services as Docker containers behind Traefik.

**Post-design gate: PASS** — no new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-coming-soon-landing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
site/                          # Next.js application root
├── app/
│   ├── layout.tsx             # Root layout (metadata, fonts, global styles)
│   ├── page.tsx               # Coming Soon page component
│   └── not-found.tsx          # Branded 404 page
├── public/
│   ├── og-image.png           # Open Graph preview image
│   └── favicon.ico            # Favicon
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.ts             # Next.js configuration
├── package.json
├── tsconfig.json
└── Dockerfile                 # Multi-stage: base → development → production

infra/                         # Pulumi IaC root
├── Pulumi.yaml                # Pulumi project definition
├── Pulumi.dev.yaml            # Dev stack config
├── Pulumi.prod.yaml           # Prod stack config
└── docker-compose.yaml.tpl    # Template rendered by Pulumi with stack values

.github/
└── workflows/
    └── deploy.yml             # GitHub Actions: build → push → pulumi up

docker-compose.yaml            # Local dev compose (Traefik + site, mirrors prod)
```

**Structure Decision**: Single Next.js app in `site/` with Pulumi infrastructure in `infra/`. No backend directory — this is a single-container static-first site. The `site/` prefix keeps application code separate from infrastructure and speckit tooling at the repo root.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
