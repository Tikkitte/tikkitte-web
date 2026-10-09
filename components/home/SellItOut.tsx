import Link from "next/link";
export default function SellItOut() {
  return (
    <section
      className="tkh-mosaic"
      style={{
        background: "#2565d0",
        color: "#ffffff",
        padding: "clamp(72px, 9vw, 136px) 0",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px)",
          gap: "24px",
        }}
        className="flex flex-col items-start"
      >
        <h2
          className="tk-section-heading__title !text-white m-0"
          style={{
            color: "#ffffff",
            fontSize: "clamp(56px, 10vw, 160px)",
            lineHeight: "0.9",
          }}
        >
          Let&apos;s sell <span style={{ whiteSpace: "nowrap" }}>it out.</span>
        </h2>
        <p
          style={{
            maxWidth: "32em",
            fontSize: "clamp(17px, 1.5vw, 20px)",
            lineHeight: "1.5",
            color: "#ffffff",
          }}
          className="m-0"
        >
          List your event for free. We&apos;ll review and approve you within 24
          hours.
        </p>
        <div
          className="tkh-cta-row flex-wrap"
          style={{ gap: "12px", marginTop: "8px" }}
        >
          <Link
            href="/signup"
            className="tk-button tk-button--dark tk-button--lg"
          >
            List your event
          </Link>
        </div>
      </div>
    </section>
  );
}
