# Data Quality & Reconciliation System

A recruiter-facing internal tool that demonstrates practical data-entry, data-cleaning,
validation, and order/payment reconciliation skills on a realistic e-commerce dataset.
Everything runs **entirely in the browser** — there is no backend, no database, and no
paid API calls.

## Project Purpose

This app simulates a real internal "data quality" tool a company might use to catch
messy order data before it causes downstream problems: duplicate orders, missing
contact info, malformed emails/phones, inconsistent dates, and orders whose payment
amount doesn't match what was actually charged. It's meant to show the full workflow —
import → validate → clean → reconcile → export — not just a single feature in isolation.

## Features

- **Overview dashboard** — total records, duplicates, missing/invalid values, payment
  mismatches, data quality score, clean vs. review-required counts, and charts.
- **Demo dataset** — a realistic 2,000-row order dataset with intentional issues
  (duplicates, missing/invalid emails & phones, inconsistent casing/spacing, mixed
  date formats, missing payment IDs, invalid payment statuses, amount mismatches).
  Loaded automatically on first visit, no upload required.
- **CSV import** — upload your own CSV (via Papa Parse), with malformed-row handling
  and an import summary.
- **Validation** — every field is checked and classified as `valid`, `missing`,
  `invalid`, `duplicate`, or `warning`.
- **Duplicate detection** — flags duplicate `Order_ID`s and duplicate full rows.
- **Data cleaning** — produces a separate cleaned dataset (trims whitespace,
  standardizes name casing, normalizes dates, drops exact duplicate rows) while the
  original raw import is never modified.
- **Error log** — a filterable table of every issue: row, field, issue type, original
  value, suggested action, status.
- **Order vs. payment reconciliation** — compares `Order_Amount` to `Payment_Amount`
  per order and classifies each as `Matched`, `Mismatch`, or `Missing Payment`.
- **Search & filters** — by Order ID, customer, payment status, validation status, and
  issue type.
- **CSV export** — cleaned data, error log, and reconciliation report.
- **Persistence** — imported/cleaned data and filters are cached in `localStorage`, so
  a refresh doesn't lose your session.

## A Note on "TanStack Start"

The original spec listed TanStack Start as the framework. This app intentionally uses
**Vite + TanStack Router** (client-only) instead. Reasoning:

- TanStack Start's value is SSR, server functions, and a Nitro server bundle for apps
  that own a backend or need server-rendered/crawlable pages.
- This app has **no backend, no auth, no API, and no SEO requirement** — every feature
  (CSV parsing, validation, cleaning, reconciliation, export) runs against data already
  in the browser, persisted to `localStorage`. There is nothing for a server to render
  or a server function to do.
- Adding TanStack Start here would mean shipping a Nitro server runtime and a
  deployment target purely to serve a static SPA — complexity with no functional
  payoff, and directly against the original brief's "do not over-engineer" instruction.
- TanStack Router (used alone) is exactly the "SPA routing upgrade" TanStack's own docs
  recommend when you're certain you won't need SSR/server functions — which is the case
  here.

If a future requirement needs SSR, auth, or a real backend, the route files are already
structured the way TanStack Start expects, so migrating later is a routing-plugin swap,
not a rewrite.

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [TanStack Router](https://tanstack.com/router) (file-based routing, client-side)
- [Vite](https://vitejs.dev/) as the build tool
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [Recharts](https://recharts.org/) for charts
- Browser `localStorage` for persistence — no backend or database

## How Validation Works

Each imported record is checked field-by-field in `src/lib/validation.ts`:

- **Missing** — required fields (`Order_ID`, `Customer_Name`, `Email`, etc.) that are
  blank or whitespace-only.
- **Invalid** — fields that fail a format check (malformed email, a phone number
  with too few or too many digits, unparseable date, non-numeric amount,
  unrecognized payment status, etc.).
- **Duplicate** — records that share an `Order_ID` with another record, or are exact
  duplicates of another full row.
- **Warning** — minor issues that don't block processing (e.g. extra whitespace,
  inconsistent capitalization) but are still surfaced for review.
- **Valid** — the field passed every check.

A record's `overallStatus` is the worst issue found across its fields. The
**Data Quality Score** is then:

```
Quality Score = (Records with overallStatus "valid" / Total Records) × 100
```

## How Reconciliation Works

`src/lib/reconciliation.ts` compares each order's `Order_Amount` against its
`Payment_Amount`:

- **Missing Payment** — no `Payment_ID` on the record (no payment was ever recorded).
- **Matched** — the absolute difference between order and payment amount is at
  most one cent (accounts for floating-point rounding on `qty × unit price`).
- **Mismatch** — both amounts exist and differ by more than a cent. `Difference`
  is stored as `Order_Amount − Payment_Amount`.

The reconciliation summary shows counts for each status plus the total dollar amount
across all mismatches.

## How to Run Locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`) in your browser.
The demo dataset loads automatically — no setup required.

## How to Build for Production

```bash
npm run build      # type-checks with tsc, then builds an optimized bundle to dist/
npm run preview    # serve the production build locally to sanity-check it
```

Other useful scripts:

```bash
npm run typecheck  # run TypeScript with no emit, for CI or a quick sanity check
```
