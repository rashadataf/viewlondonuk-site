# Feature Specification: Coming Soon Landing Page

**Feature Branch**: `001-coming-soon-landing`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Build a Coming Soon landing page for viewlondonuk.com, a real estate platform under construction. The page should display the brand name, a Coming Soon message, a short tagline, and a contact email. It must serve over HTTPS on the apex domain and redirect www to apex. The site is a static placeholder — no backend, no auth, no CMS — designed to be replaced later by a full platform."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Visit the Coming Soon Page (Priority: P1)

A prospective visitor, property professional, or search engine bot navigates to
`https://viewlondonuk.com`. They immediately see a clean, branded page
containing the ViewLondon UK name, a "Coming Soon" headline, a short tagline
describing the upcoming platform, and a contact email address. The page loads
quickly, renders correctly on mobile and desktop, and conveys professionalism.

**Why this priority**: This is the entire public-facing deliverable. Without it
there is no site. It establishes brand presence, provides a contact channel, and
claims the domain in search engines.

**Independent Test**: Open `https://viewlondonuk.com` in a browser; confirm the
brand name, coming-soon message, tagline, and contact email are all visible and
the page renders without errors.

**Acceptance Scenarios**:

1. **Given** the site is deployed, **When** a visitor loads `https://viewlondonuk.com`, **Then** they see the ViewLondon UK brand name, a "Coming Soon" heading, a short tagline, and a contact email address — all above the fold on a standard desktop viewport.
2. **Given** the site is deployed, **When** a visitor loads the page on a mobile device (viewport width ≤ 480 px), **Then** all content remains fully visible, legible, and correctly laid out without horizontal scrolling.
3. **Given** the site is deployed, **When** a visitor views the page source or inspects the document head, **Then** the page includes a meaningful `<title>` tag, a meta description, and an Open Graph image suitable for social sharing.

---

### User Story 2 — HTTPS and Domain Routing (Priority: P1)

A visitor types `viewlondonuk.com`, `www.viewlondonuk.com`, or any HTTP variant
into the browser address bar. Regardless of which combination they use, the
browser ends up at `https://viewlondonuk.com` with a valid TLS certificate and
a padlock icon.

**Why this priority**: Branded credibility and search-engine trust depend on
HTTPS with correct redirects from day one. Mis-routed or insecure requests
undermine the professional image the site must project.

**Independent Test**: Issue HTTP requests to all four URL variants
(`http://viewlondonuk.com`, `https://viewlondonuk.com`,
`http://www.viewlondonuk.com`, `https://www.viewlondonuk.com`) and confirm each
resolves to `https://viewlondonuk.com` with a valid, auto-renewed certificate.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to `http://viewlondonuk.com`, **When** the request reaches the server, **Then** the server responds with a 301 redirect to `https://viewlondonuk.com`.
2. **Given** a visitor navigates to `http://www.viewlondonuk.com` or `https://www.viewlondonuk.com`, **When** the request reaches the server, **Then** the server responds with a 301 redirect to `https://viewlondonuk.com`.
3. **Given** the TLS certificate is within 30 days of expiry, **When** the automated renewal process runs, **Then** the certificate is renewed without manual intervention and without downtime.

---

### User Story 3 — Contact via Email (Priority: P2)

A visitor sees the contact email on the page and wants to get in touch. They
click the email address (rendered as a `mailto:` link) and their default email
client opens with the address pre-filled.

**Why this priority**: The email link is the sole call-to-action before the full
platform launches. It must work reliably, but it is a simpler requirement than
the page itself or the HTTPS routing.

**Independent Test**: Click the email link on the page and verify the default
mail client opens with the correct address pre-populated.

**Acceptance Scenarios**:

1. **Given** the page is loaded, **When** a visitor clicks the contact email, **Then** their default email client opens with the correct address in the "To" field.
2. **Given** the page is loaded, **When** a visitor who cannot click (e.g., screen-reader user) navigates to the email link, **Then** the link is accessible, labelled, and activatable via keyboard.

---

### Edge Cases

- What happens when the TLS certificate authority rate-limits renewal requests? — The existing certificate remains valid; Traefik retries according to ACME back-off. No downtime occurs because renewal happens well before expiry.
- What happens when a visitor appends a path that does not exist (e.g., `/listings`)? — The server returns the Coming Soon page (or a branded 404 page) rather than a raw error.
- What happens when DNS propagation is incomplete and a visitor reaches the server via IP address? — Traefik responds only to configured host rules; a direct-IP request receives no content or a default Traefik response, preventing brand misrepresentation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display the brand name "ViewLondon UK" prominently.
- **FR-002**: The page MUST display a "Coming Soon" heading visible without scrolling on standard viewports.
- **FR-003**: The page MUST display a short tagline describing the upcoming real-estate platform.
- **FR-004**: The page MUST display a contact email address rendered as a clickable `mailto:` link.
- **FR-005**: The page MUST include a `<title>` tag, meta description, and Open Graph tags suitable for search engines and social previews.
- **FR-006**: The page MUST be fully responsive and legible on viewports from 320 px to 2560 px wide.
- **FR-007**: The server MUST redirect all `www.viewlondonuk.com` requests (HTTP and HTTPS) to `https://viewlondonuk.com` with a 301 status code.
- **FR-008**: The server MUST redirect all HTTP requests on the apex domain to HTTPS with a 301 status code.
- **FR-009**: The server MUST serve the apex domain over HTTPS with a valid, automatically renewed TLS certificate.
- **FR-010**: The page MUST be a static HTML document with no server-side processing, no backend, no authentication, and no CMS.
- **FR-011**: Requests to undefined paths MUST return a branded response (the Coming Soon page or a styled 404) — never a raw server error or framework default page.

### Assumptions

- The contact email address to display will be provided at deployment time via Pulumi stack configuration (Constitution Principle IV).
- The tagline copy will be supplied before first deployment; a sensible default can be committed but is expected to be refined.
- DNS for `viewlondonuk.com` and `www.viewlondonuk.com` is managed via Pulumi and points to the VPS running Traefik (Constitution Principles III & V).
- The Open Graph image asset will be provided or a sensible placeholder will be used until final brand assets are ready.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor sees the complete Coming Soon content (brand, heading, tagline, email) within 2 seconds on a standard broadband connection.
- **SC-002**: All four URL variants (`http(s)://[www.]viewlondonuk.com`) resolve to `https://viewlondonuk.com` with no more than one redirect hop each.
- **SC-003**: The TLS certificate is valid and trusted by all major browsers without warnings.
- **SC-004**: The page scores 90 or above on Lighthouse Performance, Accessibility, Best Practices, and SEO audits.
- **SC-005**: The page renders correctly (no layout breakage, all content visible) on the latest versions of Chrome, Safari, Firefox, and Edge, and on iOS Safari and Android Chrome.
- **SC-006**: The site remains available with no manual intervention for at least 30 consecutive days after initial deployment (certificate renewals occur automatically).
