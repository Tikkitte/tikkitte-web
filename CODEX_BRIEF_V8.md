# Legal Entity Disclosure — Terms, Privacy, Footer (Codex Brief V8)

## Context

**Stack:** Next.js App Router, Tailwind CSS, TypeScript strict mode. Static marketing pages — no client interactivity needed, so no `'use client'`.

**Why this brief exists:** Apple Developer / App Store Connect organization enrollment requires that the enrolling entity's domain be "publicly available and functional, and its domain name must be associated with your organization." The enrollment is under the legal entity **FIRSTPASS EVENTS LTD**, but `tikkitte.com` currently has no public, crawlable text anywhere connecting the two — the footer just says "© {year} Tikkitte," and there is no Terms of Service or Privacy Policy page (`/terms` and `/privacy` both 404 today — confirmed via `find app -iname "*terms*" -o -iname "*privacy*"`, no matches). A reviewer looking at the live site has no way to verify the domain belongs to FIRSTPASS EVENTS LTD.

This brief adds that association in the two places a reviewer is most likely to check: the footer (present on every page) and a Privacy Policy page (the conventional place a company discloses its legal name). It also adds a minimal Terms of Service page for consistency, since a site with a Privacy Policy but no Terms tends to look unfinished to the same kind of reviewer.

**Design reference:** Follow `app/about/page.tsx` for page shell (`Nav` + header block + content + `Footer`). Header block pattern: `bg-white` wrapper, `max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-20`, eyebrow label `text-xs font-semibold tracking-widest text-[#3B82F6] uppercase`, `h1` as `text-4xl sm:text-5xl font-bold text-gray-900 leading-tight`, subhead `text-lg text-gray-500`. Body copy on these two pages should use a plain `prose`-style layout — no existing prose component in this repo, so hand-roll with `max-w-2xl` text blocks: headings `text-xl font-semibold text-gray-900 mt-10 mb-3`, paragraphs `text-sm text-gray-600 leading-relaxed`.

**Legal disclaimer for whoever runs this brief:** the boilerplate text below is deliberately generic (contact info, no data-sale, standard disclaimers) and is meant to satisfy "a functioning, crawlable Terms/Privacy page exists and names the operating entity" — it is not reviewed legal advice. Flag to the site owner that a lawyer should check these before they're treated as binding, especially the Privacy Policy given Ghana Data Protection Act (Act 843) obligations for a Ghana-focused ticketing product that handles payment and personal data.

---

## Task 1 — Privacy Policy page

**File:** `app/privacy/page.tsx` (new)

```tsx
import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Tikkitte',
  description: 'How Tikkitte, operated by FIRSTPASS EVENTS LTD, collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="flex flex-col min-h-full">
      <Nav />

      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-20">
          <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
            Legal
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-lg">
            Last updated July 8, 2026
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-20">
          <div className="max-w-2xl">
            <p className="text-sm text-gray-600 leading-relaxed">
              Tikkitte (tikkitte.com) is operated by <strong>FIRSTPASS EVENTS LTD</strong>, a company
              providing event ticketing services in Ghana. This policy explains what information we
              collect when you use Tikkitte to discover, buy, or sell tickets, and how we use it.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">Information we collect</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              When you create an account, buy a ticket, or register as an organizer, we collect
              information such as your name, email address, and payment details necessary to process
              transactions. We also collect basic usage data (pages visited, device/browser type) to
              keep the service reliable and secure.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">How we use it</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We use your information to create and manage your account, process ticket purchases and
              payouts, send transactional emails (confirmations, verification codes, receipts), and
              prevent fraud. We do not sell your personal information to third parties.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">Payment processing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Payments are handled by third-party payment processors. Tikkitte does not store full card
              or mobile money credentials on its own servers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">Data sharing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We share the minimum information necessary with event organizers (so they can honor your
              ticket) and with service providers who help us operate Tikkitte (hosting, payments,
              email delivery), under agreements that restrict them from using your data for anything
              else.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">Your rights</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You can request access to, correction of, or deletion of your personal data by contacting
              us at the address below. We will respond within a reasonable timeframe.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Questions about this policy or your data can be sent to{' '}
              <a href="mailto:admin@tikkitte.com" className="text-[#3B82F6] hover:underline">
                admin@tikkitte.com
              </a>
              . Tikkitte is operated by FIRSTPASS EVENTS LTD.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
```

---

## Task 2 — Terms of Service page

**File:** `app/terms/page.tsx` (new)

Same shell pattern as Task 1. Use eyebrow "Legal", `h1` "Terms of Service", subhead "Last updated July 8, 2026". Body sections (same paragraph/heading classes as Task 1):

- Opening paragraph: "These Terms govern your use of Tikkitte (tikkitte.com), operated by **FIRSTPASS EVENTS LTD**. By creating an account or purchasing a ticket, you agree to these Terms."
- **Account** — users are responsible for keeping login credentials secure and for activity under their account.
- **Tickets and purchases** — tickets are sold on behalf of event organizers; refund/exchange policy is set per-event by the organizer unless an event is cancelled, in which case Tikkitte facilitates refunds per its standard process.
- **Organizers** — organizers are responsible for the accuracy of event listings and for delivering the event as described; Tikkitte is a ticketing platform, not the event host.
- **Prohibited use** — no fraud, no reselling tickets in violation of an organizer's stated policy, no attempting to circumvent platform fees.
- **Limitation of liability** — standard "Tikkitte provided as-is, not liable for indirect damages" language.
- **Contact** — same `admin@tikkitte.com` line, close with "Tikkitte is operated by FIRSTPASS EVENTS LTD."

Write the actual JSX file analogous to Task 1's structure — don't leave this as a stub; Codex should produce full, valid TSX matching the established pattern.

---

## Task 3 — Footer: entity name + legal links

**File:** `components/landing/Footer.tsx`

Replace the closing copyright block (lines 83–87):

```tsx
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} FIRSTPASS EVENTS LTD. Tikkitte is a trading name of FIRSTPASS EVENTS LTD.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
```

No other changes to this file — `Link` is already imported at the top.

---

## Task 4 — Sitemap

**File:** `app/sitemap.ts`

Add `/terms` and `/privacy` to `staticRoutes` alongside the existing entries:

```ts
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/events',
    '/organizers',
    '/about',
    '/terms',
    '/privacy',
  ].map((path) => ({
```

---

## Verification checklist

- [ ] `npx tsc --noEmit` — no new type errors
- [ ] `npm run lint` — no new ESLint errors
- [ ] `/terms` and `/privacy` render, are reachable via footer links on every page, and are not blocked by `robots.ts` (check `app/robots.ts` — should not disallow these paths)
- [ ] The string "FIRSTPASS EVENTS LTD" appears in the rendered HTML of: the footer (every page), `/privacy`, and `/terms` — verify with `curl localhost:3000/privacy | grep "FIRSTPASS EVENTS LTD"` after `npm run build && npm start` (dev mode SSR output also works for a quick check)
- [ ] Footer layout doesn't break on mobile widths (the new bottom row uses `flex-col` under `sm:`, stacking copyright above the Terms/Privacy links)
- [ ] `/terms` and `/privacy` appear in `/sitemap.xml` after the change

## After deploying

Once this is live on tikkitte.com, follow up with Apple referencing D-U-N-S number 933998709 and point them to `tikkitte.com/privacy` (and the footer) as documentation that the domain is operated by FIRSTPASS EVENTS LTD.
