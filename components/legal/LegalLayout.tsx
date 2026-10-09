import Link from "next/link";
import SitePage from "@/components/site/SitePage";
import TitleBand from "@/components/site/TitleBand";
const documents = [
  ["terms", "/terms", "Terms of Service"],
  ["privacy", "/privacy", "Privacy Policy"],
  ["refunds", "/refund-policy", "Refund & Cancellation Policy"],
] as const;
export default function LegalLayout({
  doc,
  title,
  updated,
  children,
}: {
  doc: "terms" | "privacy" | "refunds";
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <SitePage>
      <TitleBand title={title} intro={`Last updated ${updated}`} legal />
      <main className="tkh-layer tkh-page-main">
        <div className="tkh-container tkh-legal-body">
          <nav aria-label="Legal documents" className="tkh-legalnav">
            {documents.map(([key, href, label]) => (
              <Link
                key={key}
                href={href}
                className="tkh-tab"
                aria-current={doc === key ? "page" : undefined}
              >
                {label}
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
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </nav>
          <article className="tkh-legal-article">{children}</article>
        </div>
      </main>
    </SitePage>
  );
}
