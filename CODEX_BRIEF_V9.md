# Dashboard/Login Performance — Fix Poor LCP on Flagged Routes (Codex Brief V9)

## Context

This brief covers several independent fixes, split into ordered tasks. Complete them in order. Run `npx tsc --noEmit && npm run lint` after each task.

**Stack:** Next.js 16.2.0 App Router, Supabase (Postgres + Auth via `@supabase/ssr`), Tailwind CSS, TypeScript strict mode. **This project runs Next.js 16, which has breaking changes from what most training data assumes — see `AGENTS.md` at the repo root. One of the fixes below (Task 5) exists specifically because of a Next 16 API deprecation; verify against `node_modules/next/dist/docs/` rather than assumed API shape.**

**The evidence (Vercel Speed Insights, Desktop, last 7 days, real user data):**

| Route | Visits | LCP | FCP | Rating |
|---|---|---|---|---|
| `/dashboard/events/[id]` | 19–20 | 6.3s | 6.39s | Poor |
| `/admin/organizers` | 8 | 5.6s | 5.6s | Poor |
| `/dashboard/settings` | 15 | 5.64s | 5.34s | Poor |
| `/login` | 25–26 | 5.32s | 5.68s | Poor |
| `/dashboard` | 40 | 4.41s | 3.68s | Poor |

("Poor" = LCP > 4s per Core Web Vitals. `/dashboard` has the most traffic of any of these, so it matters most in aggregate even though its per-visit number is the least bad.)

**Root cause 1 — redundant auth round trips on every request.** `lib/supabase/server.ts` builds a Supabase client from cookies; `supabase.auth.getUser()` is **not** a local cookie read — it's a network call to Supabase Auth to verify the JWT. There is no `middleware.ts` in this project to do this once and short-circuit. Every one of the flagged routes calls `getUser()` in its layout (to gate access) **and again** in the page itself, serially:

- `app/dashboard/layout.tsx:16` (layout) + `app/dashboard/page.tsx:35`, `app/dashboard/settings/page.tsx:9`, `app/dashboard/events/[id]/page.tsx:63` (pages) — each page re-verifies a user the layout already verified and would have redirected away if invalid.
- `app/admin/layout.tsx:7` — same pattern, one layer.

None of this is parallelizable with `Promise.all` because the layout's own profile/admin-row query depends on `user.id` from `getUser()` — the fix is deduping the repeated `getUser()` calls, not parallelizing them.

**Root cause 2 — `/dashboard/events/[id]` (worst offender, 6.3s) stacks 4 sequential round trips before its 7 parallel queries even start:** layout's `getUser()` + profile fetch (2 RTT) → page's redundant `getUser()` (`app/dashboard/events/[id]/page.tsx:63`) → `event` fetch alone, awaited before the `Promise.all` (`:66-71`) → the 7-query `Promise.all` (`:75-120`, already correctly parallel) → a further **sequential** RPC call gated on a client-computed condition (`:122-124`, `get_event_attendee_profiles`). That RPC (see `stealthstartup/supabase/migrations/20260702_attendee_profiles_for_organizer.sql`) does its own `event_id` + `auth.uid()`-based authorization check internally and doesn't depend on the JS-side `userTickets` result at all — the gate exists only to avoid calling it needlessly, so it's safe to move into the same parallel batch as the other 7 queries and just return an empty set when there are no attendees. The `event` fetch itself, however, stays a separate prerequisite stage ahead of that batch — see Task 3 for why (it's the only query of the eight actually scoped to `organizer_id`, and RLS coverage on two of the child tables it currently gates access to can't be confirmed from this repo).

**Root cause 3 — no loading/Suspense boundary on two of the five routes.** `/dashboard` and `/dashboard/events/[id]` each have a `loading.tsx` sibling, so Next can stream a skeleton immediately while the sequential chain above resolves. `/dashboard/settings` and everything under `/admin` (confirmed via `find app -maxdepth 3 -name loading.tsx`) have **no** `loading.tsx` — those routes render nothing at all, a blank page, for the full duration of root cause 1's chain.

**Root cause 4 — `/login` uses a deprecated Next 16 image API in a pattern the docs explicitly warn against.** `app/login/page.tsx` renders two separate logo pairs — one inside the desktop-only panel (`hidden lg:flex`, lines 9–13) and one inside the mobile-only panel (`lg:hidden`, lines 27–31) — and marks **all four** `<Image>` instances (`:11-12`, `:29-30`) with the `priority` prop. Per `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`: *"Starting with Next.js 16, the `priority` property has been deprecated in favor of the `preload` property"*, and preloading should specifically **not** be used *"when you have multiple images that could be considered the LCP element depending on the viewport"* — which is exactly this case. Both panels are in the SSR'd HTML regardless of the client's actual viewport, so both pairs get a `<link rel="preload">` in `<head>`, doubling preloaded image weight and contending with the real critical-path CSS/JS for early connection slots. The source files are also heavy for a ~30px-tall logo: `public/images/logo-create.png` is 414KB, `public/images/text-logo-create.png` is 174KB. (The identical duplicated-panel-with-`priority` pattern also exists in `app/signup/page.tsx`, `app/forgot-password/page.tsx`, and `app/reset-password/page.tsx` — out of scope for this brief since none of those were flagged by Speed Insights, but worth a follow-up brief later.)

---

## Task 1 — Request-deduped auth helper

**File:** `lib/supabase/server.ts`

Add a `cache()`-wrapped helper that memoizes the authenticated user for the lifetime of a single request/render pass, so calling it from both a layout and its page only hits Supabase Auth once:

```ts
import { cache } from 'react'
```

Add below the existing `createClient` export:

```ts
export const getAuthedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
```

`cache()` memoizes by the wrapped function having no arguments here — every call within the same request returns the same in-flight/resolved promise instead of issuing a new network call. It does not persist across requests.

---

## Task 2 — Use the deduped helper at all 5 call sites

Replace `const { data: { user } } = await supabase.auth.getUser()` with `const user = await getAuthedUser()` (and add `getAuthedUser` to the existing `@/lib/supabase/server` import) in:

- `app/dashboard/layout.tsx:16` — keep the subsequent `createClient()` call for the profile query; only the `getUser()` line changes.
- `app/dashboard/page.tsx:35`
- `app/dashboard/settings/page.tsx:9`
- `app/dashboard/events/[id]/page.tsx:63`
- `app/admin/layout.tsx:7`

In each case the surrounding `if (!user) redirect('/login')` line is unchanged. Do **not** touch the `getUser()` calls inside `*/actions.ts` Server Action files (e.g. `app/dashboard/settings/actions.ts:94`, `app/admin/organizers/actions.ts:16`) — those run in a separate request/invocation when a form is submitted, not during the page's initial render, so there's nothing to dedupe there.

---

## Task 3 — Collapse `/dashboard/events/[id]` to one parallel batch

**File:** `app/dashboard/events/[id]/page.tsx`

**Do not merge the `event` fetch into the same `Promise.all` as the child-table queries.** The `event` query is the only one of the eight that filters on `organizer_id` — it's what makes this an ownership check, not just an existence check. `ticket` has an explicit public-read policy (`create policy "Anyone can view ticket types" on public.ticket for select using (true)` — `20260313_rls_policies.sql:12`), and there is no `CREATE TABLE` or `CREATE POLICY` for `tracking_link` or `complimentary_ticket` anywhere in `stealthstartup/supabase/migrations/` (searched all `.sql` files — only `SECURITY DEFINER` RPCs restricted to `service_role` reference them). Since RLS coverage on those two tables can't be confirmed from this repo, the ownership check must stay a true prerequisite — run before any child-table query executes — rather than a same-batch check that only gates rendering after the fact via `notFound()`.

Replace lines 66–124 with: fetch `event` alone first (unchanged from the current code, still filtered by `organizer_id`), keep the `notFound()` gate immediately after it, and only then collapse the 7-query `Promise.all` plus the previously-gated RPC into one 8-query parallel batch:

```ts
const { data: event } = await supabase
  .from('event')
  .select('*')
  .eq('id', id)
  .eq('organizer_id', user.id)
  .maybeSingle()

if (!event) notFound()

const [
  { data: tickets },
  { data: userTickets },
  { data: compTickets },
  { data: trackingLinks },
  { data: payments },
  { data: freePayments },
  { data: payouts },
  { data: attendeeProfiles },
] = await Promise.all([
  supabase
    .from('ticket')
    .select('*')
    .eq('event_id', id)
    .order('type'),
  supabase
    .from('user_ticket')
    .select('*')
    .eq('event_id', id),
  supabase
    .from('complimentary_ticket')
    .select('*')
    .eq('event_id', id)
    .order('sent_at', { ascending: false }),
  supabase
    .from('tracking_link')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false }),
  supabase
    .from('payments')
    .select('*')
    .eq('event_id', id)
    .eq('status', 'success')
    .order('paid_at', { ascending: false }),
  supabase
    .from('payments')
    .select('*')
    .eq('event_id', id)
    .eq('status', 'free')
    .order('paid_at', { ascending: false }),
  supabase
    .from('payout')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false }),
  supabase.rpc('get_event_attendee_profiles', { p_event_id: id }),
])
```

This still removes one full sequential stage versus the original code (the RPC no longer waits for the 7-query batch to finish before it even starts — it now runs alongside them), it just keeps the ownership check as a hard gate instead of folding it into the same batch. `attendeeProfiles` keeps the same shape as before (`Array<{ user_id: string; email: string | null; name: string | null }> | null`) — the existing `profileMap` reduce below this block (currently around line 126) needs no changes, just confirm it still reads `attendeeProfiles ?? []` since the RPC can return `null` on error same as before. Removing the `(userTickets ?? []).length > 0` gate is safe: the RPC does its own `event_id` + `auth.uid()`-scoped lookup independent of the `userTickets` query and returns an empty set when there are no attendees, matching the previous fallback behavior.

**Follow-up worth its own investigation, out of scope here:** confirm whether `tracking_link` and `complimentary_ticket` actually have RLS enabled with organizer-scoped SELECT policies somewhere outside the tracked migrations (e.g. applied directly via the Supabase dashboard). If they don't, any authenticated user can currently read any organizer's tracking links and comp-ticket records directly via the Supabase client — independent of this page's code — since neither the old nor the new version of this page is what would be enforcing that boundary if RLS isn't doing it.

---

## Task 4 — Add missing `loading.tsx` boundaries

Match the existing skeleton pattern (`components/ui/Skeleton.tsx`'s `Sk` component, as used in `app/dashboard/loading.tsx`).

**File:** `app/dashboard/settings/loading.tsx` (new) — mirror the page's two-column layout (`max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-[1fr_460px]`):

```tsx
import { Sk } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-40" />
        <Sk className="mt-2 h-4 w-64" />
      </div>
      <div className="max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-[1fr_460px] lg:items-start">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <Sk className="h-5 w-32" />
          <Sk className="h-10 w-full" />
          <Sk className="h-10 w-full" />
          <Sk className="h-24 w-full" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <Sk className="h-5 w-40" />
          <Sk className="h-16 w-full" />
        </div>
      </div>
    </div>
  )
}
```

**File:** `app/admin/organizers/loading.tsx` (new) — mirror a simple list:

```tsx
import { Sk } from '@/components/ui/Skeleton'

export default function AdminOrganizersLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-40" />
        <Sk className="mt-2 h-4 w-56" />
      </div>
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-4">
            <Sk className="h-10 w-10 rounded-lg" />
            <Sk className="h-4 w-48" />
            <Sk className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

Also check whether `app/admin/payouts/` has the same missing-`loading.tsx` gap while you're in this directory — if so, add one following the same pattern (not flagged by Speed Insights yet, but it shares `app/admin/layout.tsx`'s same 2-round-trip gate, so it will have the same issue).

**Small additional fix while touching this file — `app/admin/organizers/page.tsx:7-10`:** the `organizer_profile` query has no `.limit()`, pulling the entire table unbounded on every load. Add `.limit(200)` after `.order('created_at', { ascending: false })` as a defensive cap (this table is currently small, so it's not the dominant cause of the 5.6s LCP today — root cause 1's double-auth-check on `app/admin/layout.tsx` is — but it will become one as organizers grow, and it's a one-line fix while already in this file).

---

## Task 5 — `/login`: fix deprecated `priority` / duplicate-viewport preload

**File:** `app/login/page.tsx`

Remove the deprecated `priority` prop from all four `<Image>` instances (lines 11, 12, 29, 30) and replace with `loading="eager"`, per the Next 16 docs guidance quoted in Context (don't preload when multiple images could be the LCP element depending on viewport — use `loading="eager"` instead in that case):

```tsx
{/* Left panel — desktop only */}
<Image src="/images/logo-create.png" alt="" width={42} height={28} loading="eager" className="h-7 w-auto" />
<Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} loading="eager" className="h-8 w-auto" />
...
{/* Right panel — mobile only */}
<Image src="/images/logo-create.png" alt="" width={42} height={28} loading="eager" className="h-6 w-auto" />
<Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} loading="eager" className="h-7 w-auto" />
```

This removes the duplicate `<link rel="preload">` pair that was always inserted regardless of which panel is actually visible at the client's viewport, without introducing lazy-loading distance-from-viewport delay (`loading="eager"` still loads immediately, it just doesn't compete with critical-path CSS/JS via a `<head>` preload).

Note for whoever picks this up next: the source PNGs (`public/images/logo-create.png` at 414KB, `public/images/text-logo-create.png` at 174KB) are large for a ~30px-tall logo and are worth re-exporting at a smaller max dimension — that's an asset-editing task outside what this code-only brief covers.

---

## Verification checklist

- [ ] `npx tsc --noEmit` — no new type errors
- [ ] `npm run lint` — no new ESLint errors
- [ ] `npm run build` — `/dashboard`, `/dashboard/settings`, `/dashboard/events/[id]`, `/admin/organizers`, `/login` all still build
- [ ] Sign in as an approved organizer, load `/dashboard` — page still shows the same earnings/payout/events data as before
- [ ] Load `/dashboard/settings` — profile form and payout accounts still populate correctly; a skeleton now shows briefly instead of a blank page
- [ ] Open any event's detail page (`/dashboard/events/[id]`) — all tabs (tickets, tracking links, comp tickets, attendees) still show correct data, including the attendee list (verifies the RPC merge in Task 3 didn't break the empty-attendees case or the populated case)
- [ ] Sign in as an admin, load `/admin/organizers` — list still populates; skeleton now shows briefly instead of a blank page
- [ ] Load `/login` on both a narrow (mobile) and wide (desktop) viewport in devtools — correct logo pair still shows in each, no layout shift
- [ ] Inspect `/login` rendered HTML or the devtools Network tab — the logo images should load eagerly but emit 0 image preload links in `<head>`
- [ ] After this deploys, re-check Vercel Speed Insights in a few days once new RUM data comes in for these 5 routes — this brief can't be verified with a synthetic Lighthouse run alone since the underlying issue is real-user network latency to Supabase Auth, not a static asset problem
