import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
export const metadata: Metadata = {
  title: "Privacy Policy | Tikkitte",
  description:
    "How Tikkitte, operated by FIRSTPASS EVENTS LTD, collects, uses, and protects your data.",
};
export default function Page() {
  return (
    <LegalLayout doc="privacy" title="Privacy Policy" updated="July 8, 2026">
      <div style={{ gap: "30px" }} className="flex flex-col">
        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.65",
            color: "var(--tikkitte-ink)",
          }}
          className="m-0"
        >
          Tikkitte (tikkitte.com) is operated by FIRSTPASS EVENTS LTD, a company
          providing event ticketing services in Ghana. This policy explains what
          information we collect when you use Tikkitte to discover, buy, or sell
          tickets, and how we use it.
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
            Information we collect
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            When you create an account, buy a ticket, or register as an
            organizer, we collect information such as your name, email address,
            and payment details necessary to process transactions. We also
            collect basic usage data (pages visited, device/browser type) to
            keep the service reliable and secure.
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
            How we use it
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            We use your information to create and manage your account, process
            ticket purchases and payouts, send transactional emails
            (confirmations, verification codes, receipts), and prevent fraud. We
            do not sell your personal information to third parties.
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
            Payment processing
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Payments are handled by third-party payment processors. Tikkitte
            does not store full card or mobile money credentials on its own
            servers.
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
            Data sharing
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            We share the minimum information necessary with event organizers (so
            they can honor your ticket) and with service providers who help us
            operate Tikkitte (hosting, payments, email delivery), under
            agreements that restrict them from using your data for anything
            else.
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
            Your rights
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            You can request access to, correction of, or deletion of your
            personal data by contacting us at the address below. We will respond
            within a reasonable timeframe.
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
            Contact
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Questions about this policy or your data can be sent to{" "}
            <a className="tkh-inlink" href="mailto:admin@tikkitte.com">
              admin@tikkitte.com
            </a>
            . Tikkitte is operated by FIRSTPASS EVENTS LTD.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
