# Voltaze Web Folder Architecture (Endpoint-Aligned)

## 1) Product Purpose and App Flow

Voltaze has three role-centric journeys:

- Public buyer: discover events -> view event details -> checkout -> payment result
- Attendee user: manage own orders/passes/sessions/account
- Host/Admin operator: create/manage events, tiers, attendees, check-ins, orders, payments

The frontend should therefore be organized by:

- Route flow (Next.js app routes)
- Domain features (UI blocks that wire existing hooks/services)
- Cross-cutting shared UI and state utilities

## 2) Backend Endpoint Domains

These backend domains should map one-to-one to frontend feature folders:

- /auth
- /events
- /attendees
- /orders
- /tickets
- /passes
- /check-ins
- /payments

## 3) Recommended Web Architecture

```text
apps/web/src/
  app/
    layout.tsx
    globals.css

    (public)/
      layout.tsx
      page.tsx                         # Landing
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
      privacy/page.tsx
      terms/page.tsx
      refund/page.tsx

      events/
        page.tsx                       # Public event listing
        [slug]/
          page.tsx                     # Event details + tier selection
          checkout/
            page.tsx                   # Attendee details + payment initiation
            success/page.tsx
            failure/page.tsx

    (auth)/
      layout.tsx                       # Auth guard + role-aware shell

      dashboard/page.tsx               # Shared role dashboard

      orders/
        page.tsx                       # USER/HOST/ADMIN filtered by role
        [id]/page.tsx

      passes/
        page.tsx
        [id]/page.tsx

      settings/
        page.tsx                       # Profile + password + security
        sessions/page.tsx              # /auth/sessions

      host/
        events/
          page.tsx                     # Host-owned event list
          new/page.tsx
          [id]/page.tsx                # Event workspace summary
          [id]/tiers/page.tsx          # Tier CRUD
          [id]/attendees/page.tsx      # Event attendees
          [id]/orders/page.tsx         # Event orders
          [id]/check-ins/page.tsx      # Scan/manual check-ins

      admin/  
        analytics/page.tsx
        users/page.tsx
        payments/page.tsx

  features/
    auth/
      hooks/
      services/
      components/
        auth-guard/
        login-form/
        register-form/
        forgot-password-form/
        reset-password-form/
        change-password-form/
        session-list/
      sections/
        auth-header/

    events/
      hooks/
      services/
      components/
        event-card/
        event-list/
        event-filters/
        event-hero/
        event-summary/
        tier-card/
        tier-list/
        tier-form/
      sections/
        host-event-editor/
        host-event-overview/

    attendees/
      hooks/
      services/
      components/
        attendee-table/
        attendee-filters/
        attendee-form/
        attendee-badge/

    orders/
      hooks/
      services/
      components/
        order-table/
        order-status-badge/
        order-summary/
        order-actions/

    tickets/
      hooks/
      services/
      components/
        ticket-list/
        ticket-card/

    passes/
      hooks/
      services/
      components/
        pass-card/
        pass-qr/
        pass-status-badge/
        pass-validation-result/

    check-ins/
      hooks/
      services/
      components/
        check-in-table/
        check-in-stats/
        check-in-scanner/
        manual-check-in-form/

    payments/
      hooks/
      services/
      components/
        checkout-summary/
        razorpay-button/
        payment-status-badge/
        refund-action/

    dashboard/
      components/
        metric-card/
        role-quick-actions/
        recent-activity/

  shared/
    providers/
    hooks/
      use-role-access.ts
      use-pagination-state.ts
    lib/
      api-client.ts
      api-error.ts
      query-client.ts
    types/
      api.ts
    utils/
      format-date.ts
      format-currency.ts
    ui/
      app-shell/
      page-header/
      data-table/
      empty-state/
      error-state/
      loading-state/
      confirm-dialog/
```

## 4) Endpoint-to-UI Ownership Matrix

### Auth (/auth)

- Pages: public auth pages + authenticated settings/sessions
- Feature ownership: features/auth
- Key components: login/register forms, session list, password forms, guard

### Events (/events)

- Pages: public events list/detail, host event workspaces
- Feature ownership: features/events
- Key components: event cards/list, tier list, tier form, event editor

### Attendees (/attendees)

- Pages: host event attendees, checkout attendee capture
- Feature ownership: features/attendees
- Key components: attendee table, attendee form, filters

### Orders (/orders)

- Pages: /orders and /orders/[id], host event orders
- Feature ownership: features/orders
- Key components: order table/detail summary/action panel

### Tickets (/tickets)

- Pages: mostly embedded in checkout/order/event detail pages
- Feature ownership: features/tickets
- Key components: ticket list/cards

### Passes (/passes)

- Pages: /passes and /passes/[id], host pass validation surfaces
- Feature ownership: features/passes
- Key components: pass QR, status badge, validation state

### Check-ins (/check-ins)

- Pages: host event check-in console
- Feature ownership: features/check-ins
- Key components: scanner, manual check-in form, check-in table/stats

### Payments (/payments)

- Pages: checkout, checkout success/failure, admin payments
- Feature ownership: features/payments
- Key components: checkout summary, payment CTA, refund actions

## 5) Component Conventions

For each UI component folder:

- index.ts                    # barrel export
- <name>.tsx                  # view
- <name>.types.ts             # UI-only props and local models (optional)
- <name>.test.tsx             # tests (when added)

Example:

```text
features/orders/components/order-table/
  index.ts
  order-table.tsx
  order-table.types.ts
```

## 6) Route Composition Rule

Keep pages thin and compose from feature components:

- app/**/page.tsx: orchestration only (params, role gate, layout composition)
- features/**/components: rendering and user interaction wiring
- features/**/hooks/services: data and mutations (already implemented)

## 7) Implementation Sequence (UI-Only)

1. Build shared UI primitives in shared/ui (table, empty/error/loading states, headers).
2. Build public flow pages and components (events list/detail/checkout).
3. Build attendee self-service pages (orders, passes, settings/sessions).
4. Build host event workspace pages (events, tiers, attendees, orders, check-ins).
5. Build admin surfaces (analytics, users, payments).
6. Standardize role guards and page-level access checks.

This order mirrors conversion-critical user journeys first, then operator workflows.
