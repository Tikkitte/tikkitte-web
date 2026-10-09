import Link from "next/link";
export default function EventListingTile() {
  return (
    <Link className="tkh-nexttile tkh-event-nexttile" href="/signup">
      <span>Your event belongs on this page.</span>
      <span>
        List your event
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
      </span>
    </Link>
  );
}
