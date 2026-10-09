import Link from "next/link";
import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Tikkitte",
  description:
    "When Tikkitte issues refunds for tickets purchased through tikkitte.com.",
};
export default function Page() {
  return (
    <LegalLayout
      doc="refunds"
      title="Refund & Cancellation Policy"
      updated="July 13, 2026"
    >
      <div style={{ gap: "30px" }} className="flex flex-col">
        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.65",
            color: "var(--tikkitte-ink)",
          }}
          className="m-0"
        >
          This policy explains when you&apos;re entitled to a refund for a
          ticket purchased through Tikkitte (tikkitte.com), operated by
          FIRSTPASS EVENTS LTD.
        </p>
        <section style={{ gap: "10px" }} className="flex flex-col">
          <h2
            style={{
              fontSize: "21px",
              fontWeight: "700",
              lineHeight: "1.3",
              color: "var(--tikkitte-ink)",
            }}
            className="m-0"
          >
            If an organizer cancels an event
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            If an event organizer cancels an event, Tikkitte automatically
            refunds every ticket holder in full, to the original payment method
            used at checkout, via Paystack. The refund covers everything you
            paid, including the service fee. You don&apos;t need to request
            anything: the refund is initiated as soon as the event is marked
            cancelled, and you&apos;ll receive an email confirming it. Refunds
            are processed by Paystack in up to 10 business days, though the
            exact timing can depend on your bank or mobile money provider.
          </p>
        </section>
        <section style={{ gap: "10px" }} className="flex flex-col">
          <h2
            style={{
              fontSize: "21px",
              fontWeight: "700",
              lineHeight: "1.3",
              color: "var(--tikkitte-ink)",
            }}
            className="m-0"
          >
            All other sales are final
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Outside of an organizer cancelling an event, Tikkitte does not offer
            refunds or exchanges, including for change of mind, inability to
            attend, or purchasing the wrong ticket type. If an event is
            postponed or rescheduled rather than cancelled, your ticket remains
            valid for the new date; contact the organizer directly about any
            accommodation they may be willing to make.
          </p>
        </section>
        <section style={{ gap: "10px" }} className="flex flex-col">
          <h2
            style={{
              fontSize: "21px",
              fontWeight: "700",
              lineHeight: "1.3",
              color: "var(--tikkitte-ink)",
            }}
            className="m-0"
          >
            Questions about a refund
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            If you were expecting a refund from a cancelled event and
            haven&apos;t received it within 10 business days, contact us at{" "}
            <a className="tkh-inlink" href="mailto:admin@tikkitte.com">
              admin@tikkitte.com
            </a>{" "}
            or visit our{" "}
            <Link className="tkh-inlink" href="/contact">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
