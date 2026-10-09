import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import HeroVideo, { HeroVideoControl } from "./HeroVideo";
export default function Hero() {
  return (
    <header
      style={{
        zIndex: "2",
        background: "#0d0c0b",
        color: "#ffffff",
      }}
      className="tkh-hero flex flex-col overflow-hidden"
    >
      <HeroVideo>
        <div
          aria-hidden="true"
          style={{
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            background: "#0d0c0b",
            opacity: "0.4",
          }}
          className="absolute"
        ></div>
        <div
          aria-hidden="true"
          style={{
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(13,12,11,0.5) 0%, rgba(13,12,11,0) 22%), linear-gradient(to top, rgba(13,12,11,0.5) 0%, rgba(13,12,11,0.35) 34%, rgba(13,12,11,0) 66%), linear-gradient(to right, rgba(13,12,11,0.3) 0%, rgba(13,12,11,0) 55%)",
          }}
          className="absolute"
        ></div>

        <SiteHeader variant="overlay" />

        <div
          style={{
            zIndex: "1",
            flex: "1 1 auto",
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "32px clamp(20px, 4vw, 56px) clamp(24px, 3.4vw, 48px)",
          }}
          className="relative w-full flex flex-col justify-end"
        >
          <div
            style={{
              alignSelf: "flex-start",
              gap: "24px",
              maxWidth: "1000px",
            }}
            className="flex flex-col items-start text-left"
          >
            <h1
              className="tk-section-heading__title !text-white m-0"
              style={{
                color: "#ffffff",
                fontSize: "clamp(42px, 8.4vw, 120px)",
                lineHeight: "0.93",
                letterSpacing: "-0.005em",
              }}
            >
              You bring
              <br />
              the night.
              <br />
              <span
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  background: "#2565d0",
                  color: "#ffffff",
                  padding: "0.06em 0.14em 0.02em",
                  marginTop: "0.08em",
                }}
              >
                We run the rest.
              </span>
            </h1>
            <p
              style={{
                maxWidth: "34em",
                fontSize: "clamp(16px, 1.45vw, 20px)",
                lineHeight: "1.5",
                color: "rgba(255,255,255,0.88)",
              }}
              className="m-0"
            >
              Tickets, check-in and payouts in one place. Built in Ghana for the
              promoters, venues and artists behind the night.
            </p>
            <div className="tkh-hero-cta" style={{ marginTop: "4px" }}>
              <Link
                href="/signup"
                className="tk-button tk-button--primary tk-button--lg"
              >
                List your event
              </Link>
            </div>
          </div>
          <div
            style={{
              gap: "16px",
              marginTop: "clamp(32px, 4vw, 56px)",
            }}
            className="flex flex-wrap items-center justify-between"
          >
            <Link
              className="tkh-textlink inline-flex items-center"
              href="/events"
              style={{
                gap: "8px",
                minHeight: "44px",
                fontSize: "15px",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Here for tickets?{" "}
              <span
                style={{
                  color: "#ffffff",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                Browse events
              </span>
              <svg
                width="16"
                height="16"
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
            <HeroVideoControl />
          </div>
        </div>
      </HeroVideo>
    </header>
  );
}
