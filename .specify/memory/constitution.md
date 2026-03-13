<!--
  SYNC IMPACT REPORT
  ==================
  Version change: N/A (initial) → 1.0.0
  Bump rationale: Initial ratification — MAJOR version 1.0.0.

  Principles established (6):
    I.   Brand-First Presentation (NEW)
    II.  Zero Server-Side Runtime (NEW)
    III. Pulumi YAML as Single Source of Truth (NEW)
    IV.  Stack Config as Sole Configuration Surface (NEW)
    V.   SSL Termination via Traefik + Let's Encrypt (NEW)
    VI.  Progressive Platform Evolution (NEW)

  Added sections:
    - Technology Stack & Constraints
    - Development Workflow

  Removed sections: none (initial creation)

  Templates requiring updates:
    ✅ plan-template.md — no changes needed (generic placeholder)
    ✅ spec-template.md — no changes needed (generic placeholder)
    ✅ tasks-template.md — no changes needed (generic placeholder)
    ✅ No commands/ directory exists; prompt files are mode-scoped

  Follow-up TODOs: none
-->

# ViewLondon UK Web Constitution

## Core Principles

### I. Brand-First Presentation

Everything delivered under the ViewLondon UK domain MUST project
a professional, premium real estate brand. Visual design, copy,
performance, and uptime standards MUST meet or exceed expectations
for a London property audience. Every public-facing artifact—HTML,
images, metadata, DNS records—MUST reinforce brand credibility.
No developer tooling, debug output, or placeholder-framework
boilerplate may be visible in production.

### II. Zero Server-Side Runtime

The VPS MUST NOT run application-level server processes (Node.js,
Python, PHP, etc.) outside of Docker containers. All services MUST
be packaged as Docker images and orchestrated via Docker Compose.
The host OS is responsible only for running Docker Engine and
Traefik. This constraint ensures reproducibility, portability, and
minimises the attack surface of the production server.

### III. Pulumi YAML as Single Source of Truth

All infrastructure—DNS records, server provisioning, Docker Compose
files, Traefik configuration, and cloud resource definitions—MUST
be declared in Pulumi YAML programs. No manual infrastructure
changes are permitted. If it is not in a Pulumi program, it does
not exist. `pulumi up` MUST be the sole mechanism for applying
infrastructure changes to any environment.

### IV. Stack Config as Sole Configuration Surface

All environment-specific values (domains, secrets, feature flags,
resource sizes, email addresses, API keys) MUST originate from
Pulumi stack configuration files (`Pulumi.<stack>.yaml`).
Application code and Docker Compose templates MUST NOT contain
hardcoded environment-specific values. Secrets MUST be encrypted
via `pulumi config set --secret`. This ensures a single, auditable,
version-controlled source for every tuneable parameter.

### V. SSL Termination via Traefik + Let's Encrypt

All public HTTP traffic MUST be terminated with TLS via Traefik
acting as the reverse proxy and edge router. Certificates MUST be
automatically provisioned and renewed using Let's Encrypt (ACME).
No self-signed certificates, manual certificate management, or
TLS passthrough to backend containers is permitted in production.
Traefik configuration MUST be generated from Pulumi stack config,
not hand-edited on the server.

### VI. Progressive Platform Evolution

The architecture MUST support a clear, non-destructive upgrade
path from a static HTML placeholder site to a full-featured
property platform. Each evolutionary stage (static site →
CMS-backed content → property listings → user accounts →
transactions) MUST be deployable independently without
re-architecting prior stages. New capabilities MUST be added as
new Docker services behind Traefik routes, preserving existing
URLs and SEO equity. Backward compatibility of public URLs is
NON-NEGOTIABLE across upgrades.

## Technology Stack & Constraints

- **Host OS**: Ubuntu LTS on VPS (managed via Pulumi)
- **Container Runtime**: Docker Engine + Docker Compose
- **Reverse Proxy / Edge Router**: Traefik v3
- **IaC Tool**: Pulumi (YAML language only)
- **Static Site Tooling**: Plain HTML/CSS/JS or a static-site
  generator producing vanilla output—no server-side rendering
  framework required at the placeholder stage
- **Domain & DNS**: Managed via Pulumi (provider configured in
  stack config—e.g., Cloudflare, Route 53, or equivalent)
- **Secrets Management**: Pulumi ESC or `pulumi config --secret`
- **Monitoring**: Container health checks exposed via Docker;
  uptime monitoring configured externally
- **Runtime Databases**: Not permitted until the platform
  evolution stage that explicitly introduces one as a new Docker
  service

## Development Workflow

- **Branch Strategy**: Feature branches off `main`; merge via
  pull request after review
- **Local Development**: `docker compose up` MUST reproduce
  the production topology locally (Traefik + site container at
  minimum)
- **Preview Environments**: Encouraged via separate Pulumi
  stacks (`dev`, `staging`, `prod`)
- **Deployment**: `pulumi up --stack <env>` is the ONLY
  deployment mechanism; no SSH-and-edit workflows
- **Validation Before Merge**: Every PR MUST pass
  `pulumi preview` with no unexpected changes against the
  target stack
- **Content Updates**: Static content changes follow the same
  branch → PR → `pulumi up` pipeline as infrastructure changes

## Governance

This constitution is the authoritative source of architectural
and operational decisions for the ViewLondon UK Web project. It
supersedes ad-hoc decisions, verbal agreements, and undocumented
practices.

- **Amendments** MUST be proposed via pull request with a clear
  rationale, reviewed, and merged before taking effect.
- **Versioning** follows Semantic Versioning: MAJOR for principle
  removals or incompatible redefinitions, MINOR for new principles
  or material expansions, PATCH for clarifications and wording
  fixes.
- **Compliance**: Every pull request and code review MUST verify
  alignment with these principles. Deviations MUST be documented
  and justified in the PR description with an explicit exception
  rationale.
- **Review Cadence**: The constitution SHOULD be reviewed at each
  major platform evolution milestone (see Principle VI) to confirm
  it still serves the project's needs.

**Version**: 1.0.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-13
