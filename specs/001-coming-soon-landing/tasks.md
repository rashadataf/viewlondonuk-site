# Tasks: Coming Soon Landing Page

**Input**: Design documents from `/specs/001-coming-soon-landing/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js app**: `site/` at repository root
- **Infrastructure**: `infra/` at repository root
- **CI/CD**: `.github/workflows/` at repository root
- **Local dev**: `docker-compose.yaml` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js project, Docker setup, and local development environment

- [x] T001 Initialize Next.js 15 project with TypeScript, React 19, and Tailwind CSS 4 in site/package.json
- [x] T002 Configure TypeScript compiler options in site/tsconfig.json
- [x] T003 [P] Configure Next.js with `output: 'standalone'` in site/next.config.ts
- [x] T004 [P] Configure Tailwind CSS with brand colour palette and typography in site/tailwind.config.ts
- [x] T005 Create multi-stage Dockerfile (base → development → production) in site/Dockerfile
- [x] T006 Create local development docker-compose.yaml at repository root with Traefik + Next.js services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Root layout, Pulumi project skeleton with stack configs — MUST be complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create root layout with HTML shell, viewport meta, and global Tailwind styles in site/app/layout.tsx
- [x] T008 Create Pulumi YAML project definition in infra/Pulumi.yaml with config schema for domain, contactEmail, acmeEmail, buildTarget, sitePort, hostIp, sshUser, sshPrivateKey
- [x] T009 [P] Create dev stack config file in infra/Pulumi.dev.yaml with local development values (viewlondonuk.local, development target)
- [x] T010 [P] Create prod stack config file in infra/Pulumi.prod.yaml with production placeholder values

**Checkpoint**: Project skeleton ready — Next.js builds, Docker image builds for both targets, Pulumi project initialised. User story implementation can now begin.

---

## Phase 3: User Story 1 — Visit the Coming Soon Page (Priority: P1) 🎯 MVP

**Goal**: A visitor at `https://viewlondonuk.com` sees a branded Coming Soon page with the brand name, heading, tagline, and contact email — responsive from 320 px to 2560 px — with SEO metadata and Open Graph tags.

**Independent Test**: Run `docker compose up`, navigate to `http://viewlondonuk.local`, and confirm all four content elements (brand name, heading, tagline, email) are visible above the fold on both desktop and mobile viewports.

### Implementation for User Story 1

- [x] T011 [US1] Build the Coming Soon page component displaying brand name, heading, tagline, and contact email in site/app/page.tsx
- [x] T012 [US1] Read CONTACT_EMAIL from server-side environment variable in site/app/page.tsx and render as mailto link
- [x] T013 [P] [US1] Add responsive styles for 320 px–2560 px viewports using Tailwind utility classes in site/app/page.tsx
- [x] T014 [P] [US1] Add SEO metadata (title, description, Open Graph tags including og:image) via Next.js Metadata API in site/app/layout.tsx
- [x] T015 [P] [US1] Add placeholder Open Graph image in site/public/og-image.png
- [x] T016 [P] [US1] Add favicon in site/public/favicon.ico (implemented as site/app/icon.svg)
- [x] T017 [US1] Create branded 404 page with ViewLondon UK branding and link back to / in site/app/not-found.tsx

**Checkpoint**: Coming Soon page renders with all content, is responsive, has SEO metadata, and unknown paths show a branded 404. Story is independently testable via `docker compose up`.

---

## Phase 4: User Story 2 — HTTPS and Domain Routing (Priority: P1)

**Goal**: All four URL variants (http/https × apex/www) resolve to `https://viewlondonuk.com` with a valid TLS certificate. Traefik handles HTTP→HTTPS redirect at the entrypoint level and www→apex via redirectregex middleware.

**Independent Test**: Issue curl requests to all four URL variants and confirm 301 redirects to `https://viewlondonuk.com`; verify TLS certificate is valid and issued by Let's Encrypt.

### Implementation for User Story 2

- [x] T018 [US2] Create Traefik static configuration with entrypoints (http:80, https:443), HTTP→HTTPS redirect, and ACME Let's Encrypt certificate resolver in infra/docker-compose.yaml.tpl (Traefik service section)
- [x] T019 [US2] Add Docker labels on the Next.js service for Traefik routing: Host rule for apex + www, TLS certresolver, www→apex redirectregex middleware in infra/docker-compose.yaml.tpl (site service section)
- [x] T020 [US2] Add Pulumi YAML resource to template docker-compose.yaml.tpl with stack config values (domain, acmeEmail, sitePort, imageTag) and copy to remote VPS via command:remote:CopyToRemoteFile in infra/Pulumi.yaml
- [x] T021 [US2] Add Pulumi YAML resource to run `docker compose up -d` on remote VPS via command:remote:Command in infra/Pulumi.yaml
- [x] T022 [US2] Add named Docker volume for ACME certificate persistence (letsencrypt:/letsencrypt) in infra/docker-compose.yaml.tpl
- [x] T023 [US2] Update local development docker-compose.yaml to mirror production Traefik routing topology with viewlondonuk.local host rules (no ACME, HTTP only)

**Checkpoint**: Production infrastructure is fully defined in Pulumi YAML. `pulumi up --stack prod` deploys Traefik + Next.js with TLS. Local dev mirrors the routing topology via `docker compose up`.

---

## Phase 5: User Story 3 — Contact via Email (Priority: P2)

**Goal**: The contact email is a fully accessible `mailto:` link that opens the visitor's default email client with the correct address pre-filled, usable via click and keyboard navigation.

**Independent Test**: Tab to the email link with keyboard only; press Enter; confirm the mail client opens with the correct address.

### Implementation for User Story 3

- [x] T024 [US3] Ensure the mailto link in site/app/page.tsx has an accessible label (aria-label or visible link text), is focusable, and is reachable via keyboard tab order
- [x] T025 [US3] Verify email link renders the correct CONTACT_EMAIL value from the environment variable, with fallback to a sensible default if unset, in site/app/page.tsx

**Checkpoint**: Email link is accessible, keyboard-navigable, and displays the correct contact email sourced from stack config. Story is independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: CI/CD pipeline, documentation, and final validation

- [x] T026 [P] Create GitHub Actions deployment workflow (build image → push to registry → pulumi up) in .github/workflows/deploy.yml
- [x] T027 [P] Create GitHub Actions PR preview workflow (pulumi preview with PR comment) in .github/workflows/deploy.yml
- [x] T028 [P] Add .dockerignore in site/.dockerignore to exclude node_modules, .next, .git, and specs from Docker build context
- [x] T029 Add a root README.md with project overview, local development quickstart, and deployment instructions
- [x] T030 Verify all constitution principles are satisfied: no hardcoded env values (Principle IV), no framework boilerplate visible (Principle I), standalone Docker output (Principle II)

---

## Dependencies

```text
Phase 1 (Setup)
  T001 → T002 → T003, T004 (parallel)
  T005 depends on T003
  T006 depends on T005

Phase 2 (Foundational)
  T007 depends on T001
  T008 depends on nothing (infra is independent)
  T009, T010 depend on T008 (parallel)

Phase 3 (US1) — depends on Phase 2
  T011 depends on T007
  T012 depends on T011
  T013, T014, T015, T016 can run in parallel (different files)
  T017 depends on T007

Phase 4 (US2) — depends on Phase 2
  T018 depends on T008
  T019 depends on T018
  T020 depends on T019, T009, T010
  T021 depends on T020
  T022 depends on T018
  T023 depends on T006, T018

Phase 5 (US3) — depends on T012 (email link exists)
  T024 depends on T012
  T025 depends on T024

Phase 6 (Polish) — depends on Phases 3, 4, 5
  T026, T027, T028 can run in parallel
  T029 depends on T026
  T030 depends on all prior tasks
```

## Parallel Execution Opportunities

**Within Phase 1**: T003 and T004 in parallel (different config files)
**Within Phase 2**: T009 and T010 in parallel (different stack files)
**Within Phase 3 (US1)**: T013, T014, T015, T016 in parallel (separate files/assets)
**Within Phase 4 (US2)**: T018 and T008 can overlap if infra and Traefik config are separate files
**Within Phase 6**: T026, T027, T028 in parallel (CI workflow, dockerignore)
**Cross-story**: US1 (Phase 3) and US2 (Phase 4) can proceed in parallel after Phase 2 completes — they touch different file trees (`site/app/` vs `infra/`)

## Implementation Strategy

1. **MVP = Phase 1 + Phase 2 + Phase 3 (US1)**: A working Coming Soon page in Docker, viewable locally. Delivers immediate value — brand presence established.
2. **Production-ready = MVP + Phase 4 (US2)**: Full Traefik + TLS + redirects. Deployable to VPS via `pulumi up`.
3. **Complete = All phases**: Adds accessible email link refinements, CI/CD, documentation, and final validation.

Incremental delivery is possible at each checkpoint — each phase produces a demonstrable, testable increment.
