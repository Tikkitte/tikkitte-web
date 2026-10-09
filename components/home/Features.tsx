import { SectionHeading, StatTile } from "tikkitte-ui";
import SnapCarousel from "./SnapCarousel";
export default function Features() {
  return (
    <section
      id="features"
      className="tkh-layer"
      style={{
        background: "var(--tikkitte-cream)",
        padding: "clamp(64px, 8vw, 120px) 0",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px)",
          gap: "clamp(32px, 4vw, 48px)",
        }}
        className="flex flex-col"
      >
        <div
          style={{
            gap: "14px",
          }}
          className="flex flex-col items-start"
        >
          <SectionHeading title="One platform. The whole night." />
          <p
            style={{
              maxWidth: "440px",
              fontSize: "17px",
              lineHeight: "1.5",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            More than a ticket link. Tikkitte runs your night from the first
            sale to the last scan.
          </p>
        </div>
        <SnapCarousel className="tkh-bento tkh-carousel relative" as="div">
          <article
            className="tkh-darkcard tkh-span-a relative flex flex-col"
            style={{
              gap: "24px",
              padding: "clamp(24px, 3vw, 36px)",
              background: "#191917",
              color: "#f4f2ec",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
          >
            <div
              className="tkh-dash-copy flex flex-col"
              style={{ gap: "24px" }}
            >
              <div
                style={{
                  gap: "10px",
                }}
                className="flex flex-col"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7ea6f3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 20h18"></path>
                  <path d="M6 16v-4"></path>
                  <path d="M11 16V6"></path>
                  <path d="M16 16V9"></path>
                  <path d="M21 16v-6"></path>
                </svg>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    lineHeight: "1.2",
                    color: "#ffffff",
                  }}
                  className="m-0"
                >
                  Live sales dashboard
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.55",
                    color: "#c9c6ba",
                  }}
                  className="m-0"
                >
                  Watch every ticket land in real time, by tier and by day. Know
                  exactly where your night stands before doors open.
                </p>
              </div>
              <div className="tkh-ph-hide flex-col" style={{ gap: "10px" }}>
                <StatTile
                  label="Tickets sold"
                  value="412"
                  valueUnit="/500"
                  caption="82% of capacity"
                />
                <StatTile
                  label="Gross collected"
                  value="GHS 61,800"
                  caption="Across all tiers"
                />
                <StatTile
                  label="Early bird"
                  value="Sold out"
                  caption="Standard on sale now"
                />
              </div>
            </div>
            <div
              className="tkh-ph-hide absolute items-end"
              aria-hidden="true"
              style={{
                top: "clamp(24px, 3vw, 36px)",
                right: "calc(clamp(24px, 3vw, 36px) + 36px)",
                bottom: "clamp(24px, 3vw, 36px)",
                width: "34%",
                gap: "10px",
              }}
            >
              <span
                style={{
                  flex: "1 1 0",
                  height: "12%",
                  background: "#2565d0",
                  borderRadius: "6px 6px 0 0",
                }}
              ></span>
              <span
                style={{
                  flex: "1 1 0",
                  height: "18%",
                  background: "#2565d0",
                  borderRadius: "6px 6px 0 0",
                }}
              ></span>
              <span
                style={{
                  flex: "1 1 0",
                  height: "25%",
                  background: "#2565d0",
                  borderRadius: "6px 6px 0 0",
                }}
              ></span>
              <span
                style={{
                  flex: "1 1 0",
                  height: "33%",
                  background: "#2565d0",
                  borderRadius: "6px 6px 0 0",
                }}
              ></span>
              <span
                style={{
                  flex: "1 1 0",
                  height: "43%",
                  background: "#2565d0",
                  borderRadius: "6px 6px 0 0",
                }}
              ></span>
              <span
                style={{
                  flex: "1 1 0",
                  height: "78%",
                  background: "#2565d0",
                  borderRadius: "6px 6px 0 0",
                }}
              ></span>
              <span
                style={{
                  zIndex: "2",
                  flex: "1 1 0",
                  alignSelf: "stretch",
                }}
                className="relative"
              >
                <svg
                  width="90"
                  height="120"
                  viewBox="0 0 90 120"
                  style={{
                    top: "calc(-1 * clamp(24px, 3vw, 36px) - 72px)",
                    right: "100%",
                    marginRight: "-2px",
                    overflow: "visible",
                  }}
                  className="absolute"
                >
                  <path
                    d="M46 73L50 65L55 69L60 58L66 66L71 55L77 63L82 51L92 47L92 73Z"
                    fill="#191917"
                  ></path>
                  <path d="M60 34L69 30L68 40L61 41Z" fill="#191917"></path>
                  <path d="M42 47L50 43L49 52Z" fill="#191917"></path>
                  <path d="M72 14L79 11L78 19Z" fill="#191917"></path>
                  <path d="M30 27L37 24L36 31Z" fill="#191917"></path>
                  <path d="M52 5L57 3L56 9Z" fill="#191917"></path>
                  <path d="M20 52L26 50L25 56Z" fill="#191917"></path>
                  <path d="M80 35L85 33L84 38Z" fill="#191917"></path>
                  <path d="M82 -26L87 -29L87 -22Z" fill="#191917"></path>
                  <circle cx="64" cy="24" r="1.8" fill="#7ea6f3"></circle>
                  <circle cx="38" cy="40" r="1.5" fill="#7ea6f3"></circle>
                  <circle cx="84" cy="6" r="1.5" fill="#7ea6f3"></circle>
                  <circle cx="88" cy="-38" r="1.5" fill="#7ea6f3"></circle>
                  <path
                    d="M88 75L78 85L82 93L66 108L70 119"
                    fill="none"
                    stroke="#5a554a"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M82 93L92 101"
                    fill="none"
                    stroke="#5a554a"
                    strokeWidth="1.2"
                  ></path>
                  <path
                    d="M66 108L54 113"
                    fill="none"
                    stroke="#5a554a"
                    strokeWidth="1.2"
                  ></path>
                </svg>
                <svg
                  width="90"
                  height="120"
                  viewBox="0 0 90 120"
                  style={{
                    top: "calc(-1 * clamp(24px, 3vw, 36px) - 72px)",
                    left: "100%",
                    marginLeft: "-2px",
                    overflow: "visible",
                  }}
                  className="absolute"
                >
                  <path
                    d="M44 73L40 65L35 69L30 58L24 66L19 55L13 63L8 51L-2 47L-2 73Z"
                    fill="#191917"
                  ></path>
                  <path d="M30 33L21 29L22 39L29 40Z" fill="#191917"></path>
                  <path d="M48 47L40 43L41 52Z" fill="#191917"></path>
                  <path d="M18 14L11 11L12 19Z" fill="#191917"></path>
                  <path d="M60 27L53 24L54 31Z" fill="#191917"></path>
                  <path d="M38 5L33 3L34 9Z" fill="#191917"></path>
                  <path d="M70 52L64 50L65 56Z" fill="#191917"></path>
                  <path d="M10 35L5 33L6 38Z" fill="#191917"></path>
                  <path d="M8 -30L3 -27L4 -23Z" fill="#191917"></path>
                  <circle cx="26" cy="24" r="1.8" fill="#7ea6f3"></circle>
                  <circle cx="52" cy="40" r="1.5" fill="#7ea6f3"></circle>
                  <circle cx="6" cy="6" r="1.5" fill="#7ea6f3"></circle>
                  <path
                    d="M2 75L12 85L8 93L24 108L20 119"
                    fill="none"
                    stroke="#5a554a"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M8 93L-2 101"
                    fill="none"
                    stroke="#5a554a"
                    strokeWidth="1.2"
                  ></path>
                  <path
                    d="M24 108L36 113"
                    fill="none"
                    stroke="#5a554a"
                    strokeWidth="1.2"
                  ></path>
                </svg>
                <span
                  style={{
                    zIndex: "1",
                    top: "calc(-1 * clamp(24px, 3vw, 36px) - 96px)",
                    right: "0",
                    bottom: "0",
                    left: "0",
                    background: "#2565d0",
                    borderRadius: "6px 6px 0 0",
                  }}
                  className="absolute"
                ></span>
              </span>
            </div>
          </article>

          <article
            className="tkh-checkout flex flex-col"
            style={{
              gap: "12px",
              padding: "clamp(24px, 3vw, 32px)",
              background: "var(--tikkitte-white)",
              border: "1px solid var(--tikkitte-cream-border)",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2565d0"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="6" y="2.5" width="12" height="19" rx="2.5"></rect>
              <path d="M10.5 18h3"></path>
            </svg>
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "700",
                lineHeight: "1.25",
              }}
              className="m-0"
            >
              Checkout in seconds
            </h3>
            <p
              style={{
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "var(--tikkitte-ink-soft)",
              }}
              className="m-0"
            >
              No app, no account. Buyers pay the way they like and get a QR
              ticket straight to their phone.
            </p>
            <div
              className="tkh-ph-hide items-center"
              aria-hidden="true"
              style={{
                marginTop: "auto",
                gap: "16px",
                padding: "16px",
                background: "var(--tikkitte-cream)",
                border: "1px solid var(--tikkitte-cream-border)",
                borderRadius: "16px",
              }}
            >
              <svg
                width="72"
                height="72"
                viewBox="-1 -1 23 23"
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  padding: "6px",
                }}
                fill="#191917"
                className="shrink-0"
              >
                <path d="M0 0h7v1h-7zM8 0h2v1h-2zM11 0h1v1h-1zM14 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h2v1h-2zM11 1h2v1h-2zM14 1h1v1h-1zM20 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h3v1h-3zM12 2h1v1h-1zM14 2h1v1h-1zM16 2h3v1h-3zM20 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h1v1h-1zM12 3h1v1h-1zM14 3h1v1h-1zM16 3h3v1h-3zM20 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h1v1h-1zM11 4h2v1h-2zM14 4h1v1h-1zM16 4h3v1h-3zM20 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h2v1h-2zM11 5h1v1h-1zM14 5h1v1h-1zM20 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h7v1h-7zM9 7h1v1h-1zM11 7h2v1h-2zM0 8h1v1h-1zM2 8h2v1h-2zM5 8h3v1h-3zM10 8h1v1h-1zM15 8h1v1h-1zM17 8h2v1h-2zM20 8h1v1h-1zM1 9h1v1h-1zM7 9h1v1h-1zM11 9h1v1h-1zM14 9h1v1h-1zM16 9h1v1h-1zM0 10h2v1h-2zM3 10h6v1h-6zM10 10h3v1h-3zM14 10h2v1h-2zM20 10h1v1h-1zM0 11h2v1h-2zM4 11h2v1h-2zM7 11h2v1h-2zM11 11h4v1h-4zM0 12h1v1h-1zM5 12h4v1h-4zM10 12h11v1h-11zM10 13h5v1h-5zM17 13h1v1h-1zM19 13h2v1h-2zM0 14h7v1h-7zM8 14h2v1h-2zM11 14h2v1h-2zM15 14h1v1h-1zM17 14h1v1h-1zM0 15h1v1h-1zM6 15h1v1h-1zM9 15h3v1h-3zM15 15h2v1h-2zM0 16h1v1h-1zM2 16h3v1h-3zM6 16h1v1h-1zM10 16h1v1h-1zM12 16h5v1h-5zM19 16h1v1h-1zM0 17h1v1h-1zM2 17h3v1h-3zM6 17h1v1h-1zM10 17h5v1h-5zM18 17h1v1h-1zM0 18h1v1h-1zM2 18h3v1h-3zM6 18h1v1h-1zM8 18h1v1h-1zM13 18h2v1h-2zM16 18h1v1h-1zM19 18h2v1h-2zM0 19h1v1h-1zM6 19h1v1h-1zM10 19h3v1h-3zM15 19h1v1h-1zM19 19h1v1h-1zM0 20h7v1h-7zM8 20h2v1h-2zM14 20h1v1h-1zM17 20h4v1h-4z"></path>
              </svg>
              <div
                style={{
                  gap: "4px",
                }}
                className="flex flex-col min-w-0"
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--tikkitte-ink-soft)",
                  }}
                >
                  Your ticket
                </span>
                <span
                  style={{
                    fontFamily: "var(--tikkitte-font-display)",
                    fontSize: "22px",
                    lineHeight: "1.02",
                    textTransform: "uppercase",
                    color: "var(--tikkitte-ink)",
                  }}
                >
                  Saturday Night Lights
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--tikkitte-ink-soft)",
                  }}
                >
                  General admission · Aria
                </span>
              </div>
            </div>
            <div
              className="tkh-ph-hide flex-wrap"
              aria-hidden="true"
              style={{ paddingTop: "4px", gap: "8px" }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "6px 12px",
                  background: "var(--tikkitte-cream)",
                  border: "1px solid var(--tikkitte-cream-border)",
                  borderRadius: "999px",
                }}
              >
                Mobile Money
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "6px 12px",
                  background: "var(--tikkitte-cream)",
                  border: "1px solid var(--tikkitte-cream-border)",
                  borderRadius: "999px",
                }}
              >
                Card
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "6px 12px",
                  background: "var(--tikkitte-cream)",
                  border: "1px solid var(--tikkitte-cream-border)",
                  borderRadius: "999px",
                }}
              >
                Apple Pay
              </span>
            </div>
          </article>

          <article
            style={{
              gap: "12px",
              padding: "clamp(24px, 3vw, 32px)",
              background: "var(--tikkitte-white)",
              border: "1px solid var(--tikkitte-cream-border)",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
            className="flex flex-col"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2565d0"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8"></path>
              <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8"></path>
              <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16"></path>
              <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"></path>
              <path d="M4 12h16"></path>
            </svg>
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "700",
                lineHeight: "1.25",
              }}
              className="m-0"
            >
              Fast entry at the door
            </h3>
            <p
              style={{
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "var(--tikkitte-ink-soft)",
              }}
              className="m-0"
            >
              Scan QR tickets at the door for quick, secure check-in. No paper
              lists, no screenshots.
            </p>
          </article>

          <article
            style={{
              gap: "12px",
              padding: "clamp(24px, 3vw, 32px)",
              background: "var(--tikkitte-white)",
              border: "1px solid var(--tikkitte-cream-border)",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
            className="flex flex-col"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2565d0"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3.5"></path>
              <path d="M3 7.5V18a2 2 0 0 0 2 2h15V8.5H5.5A2.5 2.5 0 0 1 3 6"></path>
              <circle cx="16" cy="14.25" r="1.25"></circle>
            </svg>
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "700",
                lineHeight: "1.25",
              }}
              className="m-0"
            >
              Paid in cedis, directly
            </h3>
            <p
              style={{
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "var(--tikkitte-ink-soft)",
              }}
              className="m-0"
            >
              Ticket money is paid out in cedis, straight to your account,
              through Paystack.
            </p>
          </article>

          <article
            style={{
              gap: "12px",
              padding: "clamp(24px, 3vw, 32px)",
              background: "var(--tikkitte-white)",
              border: "1px solid var(--tikkitte-cream-border)",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
            className="flex flex-col"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2565d0"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "700",
                lineHeight: "1.25",
              }}
              className="m-0"
            >
              Tickets by email
            </h3>
            <p
              style={{
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "var(--tikkitte-ink-soft)",
              }}
              className="m-0"
            >
              Buyers receive their tickets by email, ready to show at the door.
              No app or account needed.
            </p>
          </article>

          <article
            style={{
              gap: "12px",
              padding: "clamp(24px, 3vw, 32px)",
              background: "var(--tikkitte-white)",
              border: "1px solid var(--tikkitte-cream-border)",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
            className="flex flex-col"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2565d0"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"></path>
              <path d="M3.5 4v5h5"></path>
            </svg>
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "700",
                lineHeight: "1.25",
              }}
              className="m-0"
            >
              Refunds, handled
            </h3>
            <p
              style={{
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "var(--tikkitte-ink-soft)",
              }}
              className="m-0"
            >
              If you have to cancel, ticket holders are refunded automatically.
              No spreadsheets, no awkward DMs.
            </p>
          </article>

          <article
            className="tkh-span-g flex flex-col"
            style={{
              gap: "12px",
              padding: "clamp(24px, 3vw, 32px)",
              background: "var(--tikkitte-blue-tint-soft)",
              border: "1px solid var(--tikkitte-blue-tint)",
              borderRadius: "var(--tikkitte-radius-card-lg)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1e56b5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="8" r="3"></circle>
              <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20"></path>
              <path d="M16 5.2a3 3 0 0 1 0 5.6"></path>
              <path d="M18 14.2a4.5 4.5 0 0 1 2.5 4.1V20"></path>
            </svg>
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "700",
                lineHeight: "1.25",
              }}
              className="m-0"
            >
              Tables and a door team for big nights
            </h3>
            <p
              style={{
                maxWidth: "40em",
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "var(--tikkitte-ink-soft)",
              }}
              className="m-0"
            >
              Let guests reserve tables when they buy. For the big ones, bring
              in a Tikkitte team to run check-in and gate sales on the night.
            </p>
            <div
              className="tkh-ph-hide flex-wrap"
              aria-hidden="true"
              style={{
                marginTop: "auto",
                paddingTop: "8px",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "6px 12px",
                  background: "var(--tikkitte-white)",
                  border: "1px solid var(--tikkitte-blue-tint)",
                  borderRadius: "999px",
                }}
              >
                Table reservations
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "6px 12px",
                  background: "var(--tikkitte-white)",
                  border: "1px solid var(--tikkitte-blue-tint)",
                  borderRadius: "999px",
                }}
              >
                Gate sales
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "6px 12px",
                  background: "var(--tikkitte-white)",
                  border: "1px solid var(--tikkitte-blue-tint)",
                  borderRadius: "999px",
                }}
              >
                On-site check-in
              </span>
            </div>
          </article>
        </SnapCarousel>
      </div>
    </section>
  );
}
