import SectionLink from "./SectionLink";
import Link from "next/link";
import Image from "next/image";
import { SITE_LINKS } from "@/components/site/siteLinks";
export default function SiteFooter() {
  return (
    <footer
      className="tk-footer tkh-layer"
      style={{
        fontFamily: "var(--tikkitte-font-body)",
        color: "var(--tikkitte-ink)",
      }}
    >
      <div className="tk-footer__top">
        <div className="tk-footer__brand-col">
          <Link
            href="/"
            aria-label="Tikkitte home"
            style={{
              gap: "10px",
              textDecoration: "none",
            }}
            className="flex items-center"
          >
            <Image
              src="/images/site/logo-ticket.png"
              alt=""
              style={{ height: "30px", width: "auto" }}
              width={225}
              height={150}
              className="block"
            />
            <Image
              src="/images/site/wordmark-blue.png"
              alt=""
              style={{ height: "17px", width: "auto" }}
              width={584}
              height={84}
              className="block"
            />
          </Link>
          <p
            className="tk-footer__tagline"
            style={{ color: "var(--tikkitte-ink-soft)" }}
          >
            The events platform for Ghana.
          </p>
        </div>
        <div className="tk-footer__columns">
          <div className="tk-footer__col">
            <p
              className="tk-footer__col-title"
              style={{ color: "var(--tikkitte-ink-soft)" }}
            >
              Organizers
            </p>
            <Link href="/signup">List your event</Link>
            <SectionLink section="how">How it works</SectionLink>
            <Link href="/login">Organizer sign in</Link>
          </div>
          <div className="tk-footer__col">
            <p
              className="tk-footer__col-title"
              style={{ color: "var(--tikkitte-ink-soft)" }}
            >
              Explore
            </p>
            <Link href="/events">Browse events</Link>
            <Link href="/about">About us</Link>
          </div>
          <div className="tk-footer__col">
            <p
              className="tk-footer__col-title"
              style={{ color: "var(--tikkitte-ink-soft)" }}
            >
              Contact
            </p>
            <Link href="/contact">Contact us</Link>
            <a href={SITE_LINKS.email}>admin@tikkitte.com</a>
            <a
              href={SITE_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="tk-footer__legal">
        <p
          className="tk-footer__legal-text"
          style={{ color: "var(--tikkitte-ink-soft)" }}
        >
          © {new Date().getFullYear()} FIRSTPASS EVENTS LTD. Tikkitte is a
          trading name of FIRSTPASS EVENTS LTD.
        </p>
        <div className="tk-footer__legal-links">
          <Link href="/terms" style={{ color: "var(--tikkitte-ink-soft)" }}>
            Terms
          </Link>
          <Link href="/privacy" style={{ color: "var(--tikkitte-ink-soft)" }}>
            Privacy
          </Link>
          <Link
            href="/refund-policy"
            style={{ color: "var(--tikkitte-ink-soft)" }}
          >
            Refunds
          </Link>
        </div>
      </div>
    </footer>
  );
}
