# Pulumi Stack Config Contract: Coming Soon Landing Page

**Feature**: `001-coming-soon-landing`
**Date**: 2026-03-13

## Overview

All environment-specific configuration for this feature is declared in Pulumi
stack config files (`Pulumi.<stack>.yaml`). This contract defines the required
and optional config keys, their types, and validation rules.

---

## Required Config Keys

| Key | Type | Secret | Description | Example |
|-----|------|--------|-------------|---------|
| `viewlondonuk:domain` | string | No | Primary domain (apex, no `www`) | `viewlondonuk.com` |
| `viewlondonuk:contactEmail` | string | No | Contact email displayed on page | `hello@viewlondonuk.com` |
| `viewlondonuk:acmeEmail` | string | No | Email for Let's Encrypt account | `admin@viewlondonuk.com` |
| `viewlondonuk:hostIp` | string | No | VPS IP address for SSH deployment | `203.0.113.42` |
| `viewlondonuk:sshUser` | string | No | SSH user on VPS | `deploy` |
| `viewlondonuk:sshPrivateKey` | string | Yes | SSH private key for deployment | (encrypted) |

## Optional Config Keys

| Key | Type | Secret | Default | Description |
|-----|------|--------|---------|-------------|
| `viewlondonuk:buildTarget` | string | No | `production` | Docker build target (`development` or `production`) |
| `viewlondonuk:sitePort` | integer | No | `3000` | Internal port Next.js listens on |
| `viewlondonuk:imageTag` | string | No | `latest` | Docker image tag to deploy |

---

## Example: `Pulumi.prod.yaml`

```yaml
config:
  viewlondonuk:domain: viewlondonuk.com
  viewlondonuk:contactEmail: hello@viewlondonuk.com
  viewlondonuk:acmeEmail: admin@viewlondonuk.com
  viewlondonuk:buildTarget: production
  viewlondonuk:sitePort: 3000
  viewlondonuk:hostIp: 203.0.113.42
  viewlondonuk:sshUser: deploy
  viewlondonuk:sshPrivateKey:
    secure: v1:abc123...  # encrypted via `pulumi config set --secret`
```

## Example: `Pulumi.dev.yaml`

```yaml
config:
  viewlondonuk:domain: viewlondonuk.local
  viewlondonuk:contactEmail: dev@viewlondonuk.com
  viewlondonuk:acmeEmail: dev@viewlondonuk.com
  viewlondonuk:buildTarget: development
  viewlondonuk:sitePort: 3000
  viewlondonuk:hostIp: 127.0.0.1
  viewlondonuk:sshUser: dev
  viewlondonuk:sshPrivateKey:
    secure: v1:def456...
```

---

## Validation Rules

- `domain` MUST NOT contain a protocol prefix (`http://` or `https://`).
- `domain` MUST NOT contain a trailing slash.
- `contactEmail` and `acmeEmail` MUST be valid email addresses.
- `buildTarget` MUST be exactly `development` or `production`.
- `sitePort` MUST be between 1024 and 65535.
- `sshPrivateKey` MUST be set as a secret (encrypted in stack file).
