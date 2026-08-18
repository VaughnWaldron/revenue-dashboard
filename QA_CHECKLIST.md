# QA Checklist

Run through this before sharing a report link or handing the site to a client-facing team.

## Admin authentication
- [ ] Visiting `/admin` while signed out shows the login screen, not the dashboard.
- [ ] Wrong password shows an inline error and does not create a session.
- [ ] Correct password signs in and lands on the report list.
- [ ] Refreshing `/admin` after signing in stays signed in (session cookie persists).
- [ ] "Sign Out" clears the session; refreshing returns to the login screen.
- [ ] The admin password never appears in browser dev tools (Network/Sources/JS bundle).

## Report creation & editing
- [ ] "New Report" creates a draft and opens the editor.
- [ ] Agency name, client name, month, year, data status, and slug all save correctly.
- [ ] Logo upload accepts PNG/JPG/SVG under 2MB and renders in the header preview.
- [ ] Logo upload rejects oversized or unsupported files with a clear error.
- [ ] "Duplicate" creates an independent copy — editing the copy never changes the original.
- [ ] "Archive" removes a report from the default published state; "Unarchive" restores it.
- [ ] "Delete" requires confirmation and permanently removes the report.

## Smart Calculator
- [ ] Entering the primary inputs (new cash, installments, goal, calls, etc.) immediately updates
      every derived stat in the "Derived Automatically" panel.
- [ ] Changing "Current Day" or "Days in Month" updates pacing metrics live.
- [ ] Zero-value denominators (e.g. 0 show-ups) do not produce `NaN`/`Infinity` anywhere.

## Manual Override
- [ ] Toggling "Override" on a derived field freezes it at its current value and marks it with an
      "Override" pill.
- [ ] Editing an overridden field's value updates only that field — nothing else recalculates from it.
- [ ] "Reset" removes the override and the field returns to the live calculated value.
- [ ] Override pills are visible only inside `/admin` — never on `/report/:slug` or in "Preview".

## Report persistence
- [ ] "Save Draft" persists changes and reloading the editor shows the saved state.
- [ ] "Publish" changes status to Published and makes the report reachable at `/report/:slug`.
- [ ] Un-publishing (Archive) makes `/report/:slug` return the "unavailable" error state.

## Read-only report URLs
- [ ] `/report/:slug` loads with no Edit/Share/Reset/Generate controls anywhere on the page.
- [ ] View source / inspector shows no admin-only data (e.g. `internalNotes`) in the API response.
- [ ] An invalid or archived slug shows the polished error state, not a raw 404 or stack trace.
- [ ] The data-status pill (Verified / Case Study / Modeled) is present but visually restrained.

## Mathematical consistency
- [ ] Rep totals (new cash, installments, calls, shows, closes) matching the primary inputs shows
      "no inconsistencies detected."
- [ ] Deliberately mismatching a rep total surfaces the correct warning message in `/admin`.
- [ ] Daily data totals matching new cash/closes shows no warning; mismatching does.
- [ ] Show-ups > conducted calls, closes > show-ups, and current day > days in month all raise
      errors in the validation panel.

## Responsiveness
- [ ] `/report/:slug` and `/admin` are usable at 375px (mobile), 768px (tablet), and 1440px
      (desktop) widths — no horizontal scroll, no overlapping text.
- [ ] Rep leaderboard table scrolls horizontally on narrow viewports instead of breaking layout.

## Desktop Loom-recording layout
- [ ] At 1440×900, the full report is legible without excessive scrolling per section.
- [ ] No layout shift or flashing after the initial count-up animation settles.
- [ ] Charts render with readable axis labels and tooltips at that viewport.

## Print / PDF
- [ ] Browser print preview (`Ctrl/Cmd+P`) on `/report/:slug` hides any `no-print` elements.
- [ ] Sections avoid being split awkwardly across page breaks.
- [ ] Colors and borders remain legible in the printed/PDF output (light background preserved).

## No admin leakage in presentation mode
- [ ] No button, tooltip, or hidden element on `/report/:slug` hints the data is editable.
- [ ] No admin navigation, sign-out control, or report-list link appears on `/report/:slug`.
- [ ] Network tab on `/report/:slug` shows only the public `/api/report/:slug` call — no calls to
      `/api/admin/*`.
