# HTTP Contracts: Coming Soon Landing Page

**Feature**: `001-coming-soon-landing`
**Date**: 2026-03-13

## Overview

This feature exposes a single public HTTP interface: the Coming Soon page and
its associated routing behaviour. There are no APIs, no form submissions, and
no authenticated endpoints. The contracts below define the expected HTTP
behaviour that Traefik and Next.js must collectively deliver.

---

## Contract 1: Serve the Coming Soon Page

**Endpoint**: `GET https://viewlondonuk.com/`

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `https://viewlondonuk.com/` |
| Response status | `200 OK` |
| Content-Type | `text/html; charset=utf-8` |
| TLS | Required (valid Let's Encrypt certificate) |

**Response body requirements**:
- Contains the text "ViewLondon UK" (brand name)
- Contains the text "Coming Soon" (heading)
- Contains a tagline string (non-empty)
- Contains a `mailto:` link with the configured contact email
- Contains `<title>` tag with meaningful content
- Contains `<meta name="description">` tag
- Contains `<meta property="og:image">` tag

---

## Contract 2: HTTP→HTTPS Redirect (Apex)

**Endpoint**: `GET http://viewlondonuk.com/*`

| Field | Value |
|-------|-------|
| Method | `GET` (any method) |
| URL | `http://viewlondonuk.com/{path}` |
| Response status | `301 Moved Permanently` |
| `Location` header | `https://viewlondonuk.com/{path}` |

---

## Contract 3: www→Apex Redirect (HTTPS)

**Endpoint**: `GET https://www.viewlondonuk.com/*`

| Field | Value |
|-------|-------|
| Method | `GET` (any method) |
| URL | `https://www.viewlondonuk.com/{path}` |
| Response status | `301 Moved Permanently` |
| `Location` header | `https://viewlondonuk.com/{path}` |

---

## Contract 4: www→Apex Redirect (HTTP)

**Endpoint**: `GET http://www.viewlondonuk.com/*`

| Field | Value |
|-------|-------|
| Method | `GET` (any method) |
| URL | `http://www.viewlondonuk.com/{path}` |
| Response status | `301 Moved Permanently` |
| `Location` header | `https://viewlondonuk.com/{path}` |

**Note**: This may involve two hops (HTTP→HTTPS→apex) depending on Traefik
entrypoint ordering, but the final destination MUST be `https://viewlondonuk.com/{path}`.

---

## Contract 5: Unknown Paths (404)

**Endpoint**: `GET https://viewlondonuk.com/{any-undefined-path}`

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `https://viewlondonuk.com/anything` |
| Response status | `404 Not Found` |
| Content-Type | `text/html; charset=utf-8` |

**Response body requirements**:
- Branded page (consistent styling with the main Coming Soon page)
- Contains the text "ViewLondon UK"
- Contains a "page not found" or equivalent message
- Contains a link back to `/`
- MUST NOT display raw framework error pages, stack traces, or debug output

---

## Contract 6: Static Assets

**Endpoint**: `GET https://viewlondonuk.com/_next/static/*` and `GET https://viewlondonuk.com/favicon.ico`

| Field | Value |
|-------|-------|
| Method | `GET` |
| Response status | `200 OK` |
| Cache-Control | Immutable or long-lived cache headers (`_next/static/`) |

**Note**: Next.js standalone mode serves static assets via `_next/static/`. The
`public/` directory assets (favicon, OG image) are served from the root path.

---

## Redirect Summary

| Request URL | Status | Location |
|-------------|--------|----------|
| `http://viewlondonuk.com/` | 301 | `https://viewlondonuk.com/` |
| `https://viewlondonuk.com/` | 200 | — (serve page) |
| `http://www.viewlondonuk.com/` | 301 | `https://viewlondonuk.com/` |
| `https://www.viewlondonuk.com/` | 301 | `https://viewlondonuk.com/` |
| `https://viewlondonuk.com/unknown` | 404 | — (branded 404) |
