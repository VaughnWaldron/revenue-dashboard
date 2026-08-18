# Revenue Reports

A revenue-performance reporting application for information-product businesses. Two experiences, one app:

- **`/admin`** — private, password-gated editor for building and publishing reports.
- **`/report/:slug`** — a clean, read-only, screen-recording-ready presentation view. No admin chrome, no editable fields, no way to tell it can be edited.

Built with React, TypeScript, Vite, Tailwind CSS, Recharts, and Netlify Functions + Netlify Blobs for storage.

---

## 1. Architecture

```
src/
  lib/
    types.ts          Shared data model (ReportRecord, Rep, DailyDataPoint, Benchmarks…)
    calculations.ts    Single source of truth for every derived metric + validation
    demoData.ts        Seed data for the sample report
    api.ts             Typed fetch client for the Netlify Functions
    useAuth.ts          Session-check hook used by /admin
  components/
    ui/                Design-system primitives (Card, MetricTile, Badge, Field…)
    report/            Read-only report sections (shared by /report and the admin preview)
    admin/             Editor-only controls (Smart Calculator, Manual Override, Reps, Daily Data…)
  routes/
    AdminApp.tsx        /admin/* — auth gate + nested routes
    ReportView.tsx       /report/:slug — public, read-only

netlify/
  functions/           One function per endpoint (v2, path-routed — no redirect rules needed)
  lib/
    auth.ts             HttpOnly signed-cookie session helpers
    store.ts             Netlify Blobs persistence
```

**Single source of truth:** both the admin editor and the public report call the same
`computeMetrics()` in [`src/lib/calculations.ts`](src/lib/calculations.ts). The admin's Manual
Override panel writes into `report.overrides`; `computeMetrics` applies those overrides last, so
the two experiences can never disagree about a number.

---

## 2. Local development

### Prerequisites
- Node.js 18+
- A Netlify account (free tier is fine) — only needed for `netlify dev` to emulate Blobs locally and for deployment later.

### Setup

```bash
cd revenue-dashboard
npm install
cp .env.example .env
```

Edit `.env` and set:

```
ADMIN_PASSWORD=choose-a-strong-password
SESSION_SECRET=$(openssl rand -base64 32)
```

### Run

Functions (auth + storage) require the Netlify dev runtime, not plain `vite dev`:

```bash
npm run dev:netlify
```

This starts Vite and the Netlify Functions together at **http://localhost:8888**. Netlify Blobs
runs in a local, filesystem-backed emulation automatically — no external database needed for local
dev.

Visit:
- `http://localhost:8888/admin` — sign in with `ADMIN_PASSWORD`
- `http://localhost:8888/report/<slug>` — the public view of a published report

The empty-state "Load Sample Demo Report" button in `/admin` creates a fully-populated,
self-consistent demo report so you can see the whole app immediately.

> Running plain `npm run dev` (Vite only, no functions) will load the UI but every API call will
> 404 — use `npm run dev:netlify` for real testing.

---

## 3. Data model & calculation model

Primary inputs (entered directly, either via Smart Calculator or by hand):

`newCash`, `installmentCash`, `monthlyGoal`, `avgNewCashPerClose`, `totalBookedCalls`,
`conductedCalls`, `showUps`, `totalCloses`, `currentDay`, `daysInMonth`, plus per-rep and
per-day breakdowns.

Everything else is derived (`src/lib/calculations.ts`):

| Field | Formula |
|---|---|
| Total cash | `newCash + installmentCash` |
| No-shows | `conductedCalls - showUps` |
| Show rate | `showUps / conductedCalls` |
| Close rate | `totalCloses / showUps` |
| % of goal | `totalCash / monthlyGoal` |
| Gap | `monthlyGoal - totalCash` |
| Closes required | `ceil(gap / avgNewCashPerClose)` |
| Daily run rate | `totalCash / currentDay` |
| Required daily run rate | `gap / daysRemaining` |
| Projected month-end | `dailyRunRate × daysInMonth` |
| Cash per show | `totalCash / showUps` |
| Calls per close | `conductedCalls / totalCloses` |

All divisions are safe (return `0` instead of `NaN`/`Infinity` on a zero denominator).

**Manual Override** (admin-only tab): any derived field above can be pinned to a specific number.
Overridden fields are tagged with an "Override" pill inside `/admin` only — the public report
renders the final number with no indication it was overridden.

**Validation** (`validateReport`): advisory, non-blocking warnings shown in the admin editor when
rep totals, daily-data totals, or basic sanity checks (show-ups ≤ conducted calls, closes ≤
show-ups, current day ≤ days in month, etc.) don't reconcile.

---

## 4. Data status labels

Every report carries one of three statuses, shown as a small, restrained pill in the header —
never a banner:

- **Verified Performance** — real, audited client numbers.
- **Network Case Study** — real numbers from a case study relationship.
- **Modeled Benchmark** — a constructed/aspirational scenario.

---

## 5. Storage schema (Netlify Blobs)

Two blob stores:

- **`reports`** — one JSON blob per report, keyed by `id` (a UUID). Shape is `ReportRecord` from
  `src/lib/types.ts`. Listing scans all blobs in the store (fine at the scale of an agency's
  report library; swap for Supabase — see below — if you need query/filter at larger scale).
- **`logo-assets`** — one binary blob per uploaded logo, keyed by a UUID, served back through
  `GET /api/assets/:id`.

### Swapping in Supabase instead

The persistence layer is isolated to `netlify/lib/store.ts`. To use Supabase instead of Blobs,
replace that file's functions with Supabase client calls against a `reports` table:

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  status text not null,
  data jsonb not null,           -- the rest of ReportRecord
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table logo_assets (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  data bytea not null
);
```

Nothing outside `netlify/lib/store.ts` needs to change — every function file imports from it.

---

## 6. Authentication

`/admin` is gated by a single shared password (`ADMIN_PASSWORD`), never shipped to the browser.

- `POST /api/auth/login` — Netlify Function compares the submitted password against
  `ADMIN_PASSWORD` (timing-safe comparison) and, on success, sets an **HttpOnly, SameSite=Lax**
  cookie containing an HMAC-signed session token (signed with `SESSION_SECRET`, 7-day expiry).
  `Secure` is added automatically whenever the request is HTTPS (i.e. always in production).
- `GET /api/auth/check` — used by `/admin` on load to decide whether to show the login screen.
- `POST /api/auth/logout` — clears the cookie.

The password and secret never touch client-side JavaScript — only the two environment variables
on the Netlify Function runtime.

---

## 7. Deploying to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket (or use `netlify deploy` directly from the CLI).
2. In the Netlify dashboard: **Add new site → Import an existing project**, pick the repo, and
   set the base directory to `revenue-dashboard` if it's nested inside a larger repo.
3. Build settings (already encoded in `netlify.toml`, no changes needed):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **Site settings → Environment variables**, add:
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
5. **Site settings → Blobs** — no setup required; Netlify provisions a Blobs store automatically
   per site the first time a function calls `getStore()`.
6. Deploy. Visit `https://<your-site>.netlify.app/admin` and sign in.

### Custom domain

1. **Site settings → Domain management → Add a domain** (e.g. `reports.example.com`).
2. Point your DNS at Netlify per their on-screen instructions (usually a `CNAME` to
   `<your-site>.netlify.app`, or Netlify DNS if you delegate the zone).
3. Netlify auto-provisions an SSL certificate once DNS propagates.
4. Your two experiences become:
   - `https://reports.example.com/admin`
   - `https://reports.example.com/report/client-name-march-2026`

No code changes are needed for a custom domain — cookies and routes are all relative.

---

## 8. QA checklist

See [`QA_CHECKLIST.md`](QA_CHECKLIST.md).
