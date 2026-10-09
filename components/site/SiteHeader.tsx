import SectionLink from "./SectionLink";
import Link from "next/link";
import Image from "next/image";

export default function SiteHeader({
  variant,
  current,
}: {
  variant: "solid" | "overlay";
  current?: "events";
}) {
  return (
    <nav aria-label="Main" className={`tkh-nav tkh-nav--${variant}`}>
      <div className="tkh-nav-inner">
        <Link href="/" aria-label="Tikkitte home" className="tkh-brand">
          <Image
            src="/images/site/logo-ticket.png"
            alt=""
            width={225}
            height={150}
            style={{ height: 34, width: "auto" }}
          />
          <Image
            className="tkh-wordmark"
            src="/images/site/wordmark-white.png"
            alt=""
            width={584}
            height={84}
            style={{ height: 19, width: "auto" }}
          />
        </Link>
        <ul className="tkh-navlinks">
          <li>
            <SectionLink section="how">How it works</SectionLink>
          </li>
          <li>
            <SectionLink section="features">Features</SectionLink>
          </li>
          <li>
            <Link
              href="/events"
              aria-current={current === "events" ? "page" : undefined}
            >
              Browse events
            </Link>
          </li>
        </ul>
        <div className="tkh-nav-actions">
          <span className="tkh-signin tkh-ondark">
            <Link
              href="/login"
              className="tk-button tk-button--secondary tk-button--md"
            >
              Sign in
            </Link>
          </span>
          <Link className="tkh-signin-text tkh-textlink" href="/login">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="tk-button tk-button--primary tk-button--md"
          >
            List your event
          </Link>
        </div>
      </div>
    </nav>
  );
}
