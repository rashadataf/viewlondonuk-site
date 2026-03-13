# Data Model: Coming Soon Landing Page

**Feature**: `001-coming-soon-landing`
**Date**: 2026-03-13

## Overview

This feature has no persistent data store and no runtime entities. The "data
model" consists entirely of configuration values injected at deployment time
and static content rendered at request time.

## Configuration Entities

### SiteConfig

Environment-specific values sourced from Pulumi stack config and injected as
Docker environment variables into the Next.js container.

| Field | Type | Source | Example |
|-------|------|--------|---------|
| `DOMAIN` | string | `Pulumi.<stack>.yaml` | `viewlondonuk.com` |
| `CONTACT_EMAIL` | string | `Pulumi.<stack>.yaml` | `hello@viewlondonuk.com` |
| `ACME_EMAIL` | string | `Pulumi.<stack>.yaml` | `admin@viewlondonuk.com` |
| `BUILD_TARGET` | enum(`development`, `production`) | `Pulumi.<stack>.yaml` | `production` |
| `SITE_PORT` | integer | `Pulumi.<stack>.yaml` | `3000` |

**Validation rules**:
- `DOMAIN` must be a valid domain name (no protocol, no trailing slash).
- `CONTACT_EMAIL` and `ACME_EMAIL` must be valid email addresses.
- `BUILD_TARGET` must be exactly `development` or `production`.
- `SITE_PORT` must be a valid port number (1024–65535).

### PageContent

Static content rendered in the Coming Soon page. These are not runtime entities
— they are hardcoded in the source or read from environment variables in a
Server Component.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| Brand name | string | Hardcoded | `"ViewLondon UK"` — immutable |
| Heading | string | Hardcoded | `"Coming Soon"` — immutable |
| Tagline | string | Source code (editable) | Short description of the platform |
| Contact email | string | `CONTACT_EMAIL` env var | Rendered as `mailto:` link |
| OG image | static file | `public/og-image.png` | Social sharing preview |

### DNS Records

Managed by Pulumi, not by the application. Documented here for completeness.

| Record | Type | Value |
|--------|------|-------|
| `viewlondonuk.com` | A | VPS IP address |
| `www.viewlondonuk.com` | CNAME | `viewlondonuk.com` |

## State Transitions

None. This is a stateless static page with no user sessions, no form
submissions, and no data persistence.

## Future Evolution (Principle VI)

When the platform evolves beyond the Coming Soon stage, new entities (e.g.,
Property, User, Inquiry) will be introduced as separate data models in their
own feature specs. The `SiteConfig` entity will grow to include additional
fields (e.g., database connection strings, API keys) but the existing fields
will remain backward-compatible.
