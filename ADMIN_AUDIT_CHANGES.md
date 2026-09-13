# Admin Frontend Audit — Changes

Scope: frontend only, under `src/app/admin/**`, `src/components/admin/**`,
and the client-side fetch layer in `src/lib/api/**`. No backend code
(API routes, `src/lib/services/**`, `src/lib/validation/**`, `src/db/**`,
`src/lib/auth/**`) was touched.

Sandbox note: this environment has no `node_modules` and no network
access, so `npm run lint` / `npx tsc --noEmit` / `npm run build` could
not actually be executed here. Every change below was reviewed by hand
for type-correctness and brace/paren balance was verified programmatically
across all touched files. **Please run the three validation commands
after applying this patch, before merging.**

---

## 1. Critical — infinite refetch loop (`src/components/admin/useAdminList.ts`)

**The single highest-impact bug in the codebase.** Every admin list page —
projects, articles, experience, education, technologies, skills,
achievements, certifications, social links, timeline, learning,
principles, contact messages (14 screens total) — calls `useAdminList`
with an inline callback:

```ts
const { data, status } = useAdminList<RawSkill>(async () => {
  const rows = await skillsAdmin.list();
  return { data: rows.data };
});
```

That inline function is a **new identity on every render**. The hook's
`useEffect` had `fetchPage` in its dependency array, so:

1. Effect runs, fetch resolves, `setData`/`setStatus` fire → re-render.
2. Re-render creates a brand-new `fetchPage` function reference.
3. The effect's dependency changed → effect fires again.
4. Another fetch → another render → another new reference → forever.

This meant **every admin list screen was continuously hammering its API
endpoint** in an infinite loop from the moment it mounted, never
settling. This is the underlying cause of most of the "loading states
that never terminate correctly" / "duplicate requests" class of bug the
audit asked to check for.

**Fix:** `fetchPage` is now stored in a `useRef` that's reassigned on
every render (a plain assignment, not a `useEffect`, so it doesn't itself
trigger anything or need to be a dependency). The effect body reads
`fetchPageRef.current(page)` and only depends on `[page, reloadToken]`,
which are the only two things that should ever cause a refetch. This
single-file fix resolves the bug on all 14 list screens simultaneously.

---

## 2. Errors silently swallowed on delete (`src/components/admin/ConfirmDialog.tsx`)

`ConfirmDialog` backs every delete button in the admin app. Previously,
if `onConfirm()` (the DELETE request) rejected, the `finally` block reset
the pending state but **nothing told the user anything failed** — no
toast, no inline message, just a modal that quietly stayed open. This
violates "do not silently swallow errors" / "errors are shown" for every
single destructive action in the app (projects, articles, experience,
education, skills, technologies, achievements, certifications, social
links, timeline entries, contact messages, and architecture
layers/nodes/connections).

**Fix:**
- Failures now call the shared `useToast()` (`notify(message, "error")`)
  and additionally render the message inline inside the dialog
  (`role="alert"`), so it's visible even if the toast is missed.
- Added basic modal accessibility that was missing: focus moves to the
  Cancel button on open, `Escape` closes the dialog (unless a delete is
  in flight), and `aria-labelledby` ties the dialog to its heading.

---

## 3. Validation errors showed as generic "Invalid request" (`src/lib/api/fetcher.ts`)

The API returns 422s with a Zod `flattenError()`-shaped `details` object
(`{ fieldErrors, formErrors }`), but the fetch layer only ever read
`error.message` — which the server hardcodes to `"Invalid request"` for
validation failures — and discarded `details` entirely. Every one of the
~14 admin forms renders that single string as its only error feedback, so
a validation failure gave the user zero indication of which field was
wrong.

**Fix:** `request()` in `fetcher.ts` now folds `fieldErrors`/`formErrors`
into the thrown `ApiError`'s message (e.g. `title: Title is required;
slug: Must be lowercase and hyphenated`). Since every form already
displays `ApiError.message` verbatim, this fixes actionable validation
feedback everywhere with one change, no form-by-form edits needed.

Also added: a 401 from any `/api/admin/*` endpoint (almost always an
expired session cookie on a stale tab, since the server-side auth guard
in `(dashboard)/layout.tsx` only re-runs on navigation) now surfaces as
"Your session has expired. Please sign in again." instead of a bare
"Unauthorized" that reads like a permissions bug.

---

## 4. Dashboard died completely if any one stat failed (`src/app/admin/(dashboard)/page.tsx`)

The dashboard fetched four things with `Promise.all` — project count,
article count, unread-message count, profile. A failure in *any one*
(e.g. a transient hiccup on the unread-messages count) threw the whole
page into the error boundary, losing the other three pieces of data that
had already loaded successfully. Directly contradicts the audit
requirement: "Avoid making the entire dashboard unusable because one
small API request fails."

**Fix:** switched to `Promise.allSettled`. Each stat card now renders
independently — a failed card shows "Unable to load" in place, the
others render normally. The profile-based welcome message degrades
similarly instead of crashing.

---

## 5. Missing admin-scoped error/not-found boundaries (new files)

There was no `error.tsx` or `not-found.tsx` anywhere under
`src/app/admin/(dashboard)/`. Consequences:

- Any rethrown server error in an admin page (a DB hiccup, any
  non-`NotFoundError` exception from the dozen `[id]` edit pages that all
  do `.catch((err) => { if (err instanceof NotFoundError) notFound();
  throw err; })`) fell through to the **root** `src/app/error.tsx`, which
  replaces the whole app shell — the admin sidebar/nav disappeared and
  the person landed on the public-site "Something went wrong / Go home"
  screen with no path back into the admin panel.
- Every `notFound()` call (project/article/experience/.../contact-message
  not found — same dozen pages) fell through to the **root**
  `src/app/not-found.tsx`, same problem: sidebar gone, "Go home" points
  at the public marketing site.

**Fix:** added `src/app/admin/(dashboard)/error.tsx` and
`src/app/admin/(dashboard)/not-found.tsx`. Because the parent
`(dashboard)/layout.tsx` has already rendered successfully by the time a
page-level error/not-found occurs, these boundaries replace only the
broken page content — the sidebar, nav, and "back to dashboard" links
stay intact. The error boundary also has a "Try again" button.

---

## 6. Sidebar nav: wrong item shown as active (`src/components/admin/AdminShell.tsx`)

```ts
const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
```

For the "Dashboard" nav item (`href: "/admin"`), `pathname.startsWith("/admin/")`
is true for **every other admin route** (`/admin/projects`,
`/admin/profile`, `/admin/contact/abc123`, ...). So "Dashboard" rendered
as the highlighted/active nav item on literally every single admin page,
not just the dashboard — while the actual current section was never
highlighted correctly whenever it happened to also be a prefix of
another route. This is exactly the "route matching does not accidentally
match unrelated routes" failure mode called out in the audit.

**Fix:** added a dedicated `isActive()` helper — exact match, or (for
non-root items only) the next path segment boundary — plus `aria-current="page"`
on the active link for assistive tech.

**Also fixed in the same file:** there was no mobile nav at all — the
sidebar just stacked full-width above the page content with no way to
collapse it, per the audit's "Mobile behavior" / "Sidebar collapse/expand"
checks. Added a `lg:hidden` header bar with a Menu/Close toggle button
(`aria-expanded`, `aria-controls`, `aria-label`) that shows/hides the nav
on small screens; the nav also auto-closes on navigation. Desktop layout
is byte-for-byte unchanged (`lg:` breakpoints untouched).

---

## 7. No retry affordance on list-load failure (`src/components/admin/DataTable.tsx`)

`DataTable` already correctly distinguished loading / error / empty /
loaded (this part of the audit passed already), but the error state was
a dead end — no way to recover short of a full page reload.

**Fix:** added an optional `onRetry` prop; when provided, the error state
renders a "Retry" button. Wired `onRetry={reload}` (the same `reload()`
already used after successful mutations) into all 13 pages that render a
`DataTable`. Also added `aria-busy="true"` on the loading state and
`role="alert"` on the error state for assistive tech.

---

## 8. Accessibility pass on form fields (`src/components/admin/fields.tsx`, all 14 resource forms, login page)

- `fields.tsx`: `TextField`/`TextAreaField`/`NumberField`/`SelectField`
  now generate a stable id (`useId`) for their error text and wire
  `aria-invalid` + `aria-describedby` to it, so a validation error is
  actually announced and associated with its input for screen-reader
  users (previously the error text was purely visual). This is additive
  and backward-compatible — no existing caller needs to change.
- All 14 resource forms (`ProjectForm`, `ArticleForm`, `ExperienceForm`,
  `EducationForm`, `TechnologyForm`, `SkillForm`, `LearningTopicForm`,
  `AchievementForm`, `CertificationForm`, `SocialLinkForm`,
  `TimelineEntryForm`, `PrincipleForm`, `ProfileForm`,
  `ArchitectureEditor`) plus the login page had the identical
  `{error && <p className="text-sm text-red-400">{error}</p>}` pattern
  for their top-level submit error — none of them had `role="alert"`, so
  a failed save wasn't announced to assistive tech. Added `role="alert"`
  to all 15 occurrences.

Confirmed **not** an issue elsewhere: no icon-only buttons exist anywhere
in the admin UI (every action is a labeled text button/link), so there
was nothing to add `aria-label`s to there.

---

## What was checked and found already correct (no change needed)

- Every resource form (`ProjectForm` and its ~13 siblings) already:
  guards against duplicate submission (`if (submitting) return`),
  disables its submit button while pending, shows a "Saving…" label,
  and — importantly — does **not** clear user-entered data on a failed
  submission (inputs are uncontrolled with `defaultValue`, so a failed
  submit leaves exactly what the user typed).
- No `any`, no `@ts-ignore`, no array-index React keys anywhere in the
  admin surface.
- Only two `useEffect` calls exist in the entire admin component tree
  outside of the one fixed in `useAdminList`
  (`ContactMessageActions`'s "mark as read on view", which already
  correctly no-ops on failure since it's a best-effort background call
  and doesn't block rendering) — no other effect-dependency bugs found.
- `(dashboard)/layout.tsx` already does a proper server-side session
  check with `redirect()` before rendering any admin HTML, so direct URL
  access, refreshing a nested route, and normal auth protection all
  already work correctly.
- No file-upload inputs exist (images are URL fields), so there was no
  upload-progress state to audit.
- `DataTable` itself already correctly separates loading / error / empty
  / loaded and never shows "no data" while a request is in flight.

## Deliberately left out of scope (flagging for follow-up, not fixed)

- The contact-messages API supports `?status=` filtering
  (`contactAdmin.list({ status })`), but the list page has no filter UI
  for it. This isn't a regression — there was never a filter control —
  and adding one cleanly requires extending `useAdminList` to support a
  filter-triggered refetch-and-reset-to-page-1, which is a larger,
  separate change. Recommend as a follow-up rather than bundling it into
  this bug-fix pass.
- Per-field (as opposed to whole-form) validation error display: the
  `aria-invalid`/`aria-describedby` wiring is now in place in
  `fields.tsx`, but no form currently passes a per-field `error` prop —
  they all rely on one form-level error string (now much more
  informative per fix #3 above). Wiring real per-field errors through
  would mean changing the `catch` block and JSX of all ~14 forms to
  parse and distribute `ApiError`'s structured detail; left as a
  follow-up given the size of that change relative to the value already
  delivered by fix #3.
