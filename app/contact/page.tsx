import { SITE_LINKS } from "@/components/site/siteLinks";
import Link from "next/link";
import SitePage from "@/components/site/SitePage";
import TitleBand from "@/components/site/TitleBand";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact | Tikkitte",
  description: "Get in touch with the Tikkitte team.",
};
export default function Page() {
  return (
    <SitePage>
      <TitleBand
        title="Contact us"
        intro="Questions about an order, a refund or your event listing? We're happy to help."
      />
      <main
        className="tkh-layer"
        style={{ padding: "clamp(40px, 5vw, 80px) 0 clamp(72px, 9vw, 128px)" }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 56px)",
          }}
        >
          <div className="tkh-cgrid">
            <section
              style={{
                gap: "14px",
                padding: "clamp(24px, 2.4vw, 32px)",
                borderRadius: "20px",
                background: "#ffffff",
              }}
              className="flex flex-col min-w-0"
            >
              <span
                aria-hidden="true"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#d9e4fa",
                  color: "#2565d0",
                }}
                className="flex items-center justify-center"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 7l9 6 9-6"></path>
                </svg>
              </span>
              <h2
                style={{
                  margin: "4px 0 0",
                  fontSize: "21px",
                  fontWeight: "700",
                  lineHeight: "1.3",
                }}
              >
                General support
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                For ticket, refund or account questions, email us. We aim to
                respond within 1 to 2 business days.
              </p>
              <a
                className="tkh-mail"
                href={SITE_LINKS.email}
                style={{
                  marginTop: "auto",
                  paddingTop: "8px",
                  fontSize: "22px",
                  fontWeight: "700",
                  textDecoration: "none",
                  overflowWrap: "anywhere",
                }}
              >
                admin@tikkitte.com
              </a>
            </section>
            <section
              style={{
                gap: "14px",
                padding: "clamp(24px, 2.4vw, 32px)",
                borderRadius: "20px",
                background: "#ffffff",
              }}
              className="flex flex-col min-w-0"
            >
              <span
                aria-hidden="true"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#d9e4fa",
                  color: "#2565d0",
                }}
                className="flex items-center justify-center"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                  <path d="M16 3v4"></path>
                  <path d="M8 3v4"></path>
                  <path d="M3 10h18"></path>
                </svg>
              </span>
              <h2
                style={{
                  margin: "4px 0 0",
                  fontSize: "21px",
                  fontWeight: "700",
                  lineHeight: "1.3",
                }}
              >
                Event-specific questions
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                For questions about a specific event, like its schedule, venue
                or accessibility, contact the organizer listed on the event
                page. Tikkitte is the ticketing platform; the organizer runs the
                event.
              </p>
              <Link
                className="tkh-mail inline-flex items-center"
                href="/events"
                style={{
                  marginTop: "auto",
                  paddingTop: "8px",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#2565d0",
                  textDecoration: "none",
                }}
              >
                Browse events
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14"></path>
                  <path d="M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </section>
            <section
              style={{
                gap: "14px",
                padding: "clamp(24px, 2.4vw, 32px)",
                borderRadius: "20px",
                background: "#191917",
                color: "#f4f2ec",
              }}
              className="flex flex-col min-w-0"
            >
              <span
                aria-hidden="true"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                }}
                className="flex items-center justify-center"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
                  <path d="M16 9h2a2 2 0 0 1 2 2v10"></path>
                  <path d="M8 7h4"></path>
                  <path d="M8 11h4"></path>
                  <path d="M8 15h4"></path>
                  <path d="M3 21h18"></path>
                </svg>
              </span>
              <h2
                style={{
                  margin: "4px 0 0",
                  fontSize: "21px",
                  fontWeight: "700",
                  lineHeight: "1.3",
                  color: "#ffffff",
                }}
              >
                Business
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#c9c6ba",
                }}
                className="m-0"
              >
                Tikkitte is operated by{" "}
                <strong style={{ fontWeight: "700", color: "#ffffff" }}>
                  FIRSTPASS EVENTS LTD.
                </strong>
              </p>
              <address
                style={{
                  fontStyle: "normal",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#c9c6ba",
                }}
              >
                GZ-150-7297
                <br />
                House Number 7, Russel Street
                <br />
                Near Ghana International Mall, Spintex
                <br />
                Ledzokuku, Accra
                <br />
                Greater Accra, Ghana
              </address>
              <div
                style={{
                  gap: "4px",
                  marginTop: "auto",
                  paddingTop: "8px",
                }}
                className="flex flex-col"
              >
                <a
                  className="tkh-tel"
                  href={SITE_LINKS.phones[0]}
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                >
                  +233 53 951 1236
                </a>
                <a
                  className="tkh-tel"
                  href={SITE_LINKS.phones[1]}
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                >
                  +233 26 798 7076
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </SitePage>
  );
}
