import Link from "next/link";
import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
export const metadata: Metadata = {
  title: "Terms of Service | Tikkitte",
  description:
    "Terms governing use of Tikkitte, operated by FIRSTPASS EVENTS LTD.",
};
export default function Page() {
  return (
    <LegalLayout doc="terms" title="Terms of Service" updated="July 13, 2026">
      <div style={{ gap: "30px" }} className="flex flex-col">
        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.65",
            color: "var(--tikkitte-ink)",
          }}
          className="m-0"
        >
          These Terms govern your use of Tikkitte (tikkitte.com), operated by
          FIRSTPASS EVENTS LTD. By creating an account or purchasing a ticket,
          you agree to these Terms.
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
            Account
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            You are responsible for keeping your login credentials secure and
            for all activity that occurs under your account. If you believe your
            account has been accessed without permission, contact us promptly.
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
            Tickets and purchases
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Tickets are sold on behalf of event organizers. If an organizer
            cancels an event, Tikkitte automatically refunds every ticket holder
            in full to their original payment method via Paystack. Outside of an
            organizer cancellation, all ticket sales are final: Tikkitte does
            not offer refunds for change of mind. See our{" "}
            <Link href="/refund-policy" className="tkh-inlink">
              Refund & Cancellation Policy
            </Link>{" "}
            for details.
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
            Organizers
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Organizers are responsible for the accuracy of event listings and
            for delivering the event as described. Tikkitte is a ticketing
            platform and is not the host or producer of organizer-run events.
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
            Prohibited use
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            You may not use Tikkitte for fraud, resell tickets in violation of
            an organizer&apos;s stated policy, attempt to circumvent platform
            fees, interfere with platform security, or use the service in a way
            that violates applicable law.
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
            Limitation of liability
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Tikkitte is provided as-is and as available. To the maximum extent
            permitted by law, Tikkitte is not liable for indirect, incidental,
            special, consequential, or punitive damages arising from your use of
            the service.
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
            Questions about these Terms can be sent to{" "}
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
