import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
export default function NotFound() {
  return (
    <div
      className="tkh-root flex flex-col overflow-hidden"
      style={{
        minHeight: "100vh",
        background: "#0d0c0b",
        color: "#ffffff",
        fontFamily: "var(--tikkitte-font-body)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header>
        <SiteHeader variant="solid" />
      </header>
      <main
        style={{
          flex: "1 1 auto",
          padding:
            "clamp(24px, 4vw, 56px) clamp(20px, 4vw, 56px) clamp(56px, 7vw, 96px)",
        }}
        className="flex items-center justify-center"
      >
        <div
          style={{
            gap: "clamp(40px, 6vw, 96px)",
            maxWidth: "1200px",
          }}
          className="flex flex-wrap items-center justify-center"
        >
          <div
            aria-hidden="true"
            style={{
              transform: "rotate(-5deg)",
              filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
            }}
            className="flex"
          >
            <div
              className="tkh-404t-main flex flex-col"
              style={{
                gap: "12px",
                padding: "clamp(22px, 2.6vw, 34px) clamp(24px, 3vw, 40px)",
                borderRadius: "22px 0 0 22px",
                background: "#ffffff",
                color: "#191917",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#2565d0",
                }}
              >
                Tikkitte
              </span>
              <span
                style={{
                  fontFamily: "var(--tikkitte-font-display)",
                  fontSize: "clamp(104px, 13vw, 190px)",
                  lineHeight: "0.82",
                  color: "#191917",
                }}
              >
                404
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                Admit none
              </span>
            </div>
            <div
              className="tkh-404t-stub flex items-center justify-center"
              style={{
                width: "clamp(84px, 8vw, 116px)",
                borderLeft: "2px dashed rgba(255,255,255,0.55)",
                borderRadius: "0 22px 22px 0",
                background: "#2565d0",
              }}
            >
              <svg
                width="56"
                height="116"
                viewBox="0 0 56 116"
                fill="#ffffff"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="56" height="6"></rect>
                <rect x="0" y="8" width="56" height="4"></rect>
                <rect x="0" y="14" width="56" height="8"></rect>
                <rect x="0" y="24" width="56" height="2"></rect>
                <rect x="0" y="32" width="56" height="4"></rect>
                <rect x="0" y="38" width="56" height="6"></rect>
                <rect x="0" y="46" width="56" height="4"></rect>
                <rect x="0" y="58" width="56" height="2"></rect>
                <rect x="0" y="64" width="56" height="2"></rect>
                <rect x="0" y="72" width="56" height="2"></rect>
                <rect x="0" y="76" width="56" height="4"></rect>
                <rect x="0" y="86" width="56" height="2"></rect>
                <rect x="0" y="92" width="56" height="2"></rect>
                <rect x="0" y="102" width="56" height="4"></rect>
                <rect x="0" y="108" width="56" height="6"></rect>
              </svg>
            </div>
          </div>
          <div
            style={{
              gap: "20px",
              maxWidth: "460px",
            }}
            className="flex flex-col items-start"
          >
            <h1
              className="tk-section-heading__title !text-white m-0"
              style={{
                color: "#ffffff",
                fontSize: "clamp(48px, 6vw, 88px)",
                lineHeight: "0.93",
              }}
            >
              Page not found
            </h1>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.55",
                color: "rgba(255,255,255,0.8)",
              }}
              className="m-0"
            >
              This page doesn&apos;t exist. It may have moved, or the link is
              broken.
            </p>
            <div
              style={{
                gap: "12px",
                marginTop: "8px",
              }}
              className="flex flex-wrap items-center"
            >
              <Link
                href="/"
                className="tk-button tk-button--primary tk-button--lg"
              >
                Back to Tikkitte
              </Link>
              <span className="tkh-ondark inline-flex">
                <Link
                  href="/events"
                  className="tk-button tk-button--secondary tk-button--lg"
                >
                  Browse events
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
