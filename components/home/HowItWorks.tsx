import { SectionHeading } from "tikkitte-ui";
import SnapCarousel from "./SnapCarousel";
export default function HowItWorks() {
  return (
    <section
      id="how"
      className="tkh-layer"
      style={{
        background: "var(--tikkitte-white)",
        borderTop: "1px solid var(--tikkitte-cream-border)",
        padding: "clamp(64px, 8vw, 120px) 0",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px)",
          gap: "clamp(36px, 4.4vw, 60px)",
        }}
        className="flex flex-col"
      >
        <div
          className="tkh-head flex flex-wrap justify-between"
          style={{
            gap: "16px 48px",
          }}
        >
          <SectionHeading title="From flyer to front door" />
          <p
            style={{
              maxWidth: "380px",
              fontSize: "17px",
              lineHeight: "1.5",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            Five steps from your first idea to your first sale. No spreadsheets,
            no back and forth.
          </p>
        </div>
        <div className="relative">
          <div
            className="tkh-steps-line absolute"
            aria-hidden="true"
            style={{
              top: "23px",
              right: "0",
              left: "0",
              borderTop: "2px dashed #d6cfbd",
            }}
          ></div>
          <SnapCarousel
            className="tkh-carousel tkh-steps relative"
            style={{ listStyle: "none" }}
            as="ol"
          >
            <li
              className="tkh-step min-w-0 flex flex-col items-start"
              style={{
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "72px",
                  height: "48px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "#2565d0",
                  color: "#ffffff",
                  fontFamily: "var(--tikkitte-font-display)",
                  fontSize: "24px",
                  lineHeight: "1",
                }}
                className="relative flex items-center justify-center"
              >
                01
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    left: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    right: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
              </span>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  lineHeight: "1.25",
                }}
                className="m-0"
              >
                Request access
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                Sign up as an organizer. We review and approve you within 24
                hours.
              </p>
            </li>

            <li
              className="tkh-step min-w-0 flex flex-col items-start"
              style={{
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "72px",
                  height: "48px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "#2565d0",
                  color: "#ffffff",
                  fontFamily: "var(--tikkitte-font-display)",
                  fontSize: "24px",
                  lineHeight: "1",
                }}
                className="relative flex items-center justify-center"
              >
                02
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    left: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    right: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
              </span>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  lineHeight: "1.25",
                }}
                className="m-0"
              >
                Create your event
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                Name it, set the date and doors, and drop your poster.
              </p>
            </li>

            <li
              className="tkh-step min-w-0 flex flex-col items-start"
              style={{
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "72px",
                  height: "48px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "#2565d0",
                  color: "#ffffff",
                  fontFamily: "var(--tikkitte-font-display)",
                  fontSize: "24px",
                  lineHeight: "1",
                }}
                className="relative flex items-center justify-center"
              >
                03
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    left: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    right: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
              </span>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  lineHeight: "1.25",
                }}
                className="m-0"
              >
                Pin your venue
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                Search for your spot. Verified venues fill in the address for
                your buyers.
              </p>
            </li>

            <li
              className="tkh-step min-w-0 flex flex-col items-start"
              style={{
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "72px",
                  height: "48px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "#2565d0",
                  color: "#ffffff",
                  fontFamily: "var(--tikkitte-font-display)",
                  fontSize: "24px",
                  lineHeight: "1",
                }}
                className="relative flex items-center justify-center"
              >
                04
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    left: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    right: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
              </span>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  lineHeight: "1.25",
                }}
                className="m-0"
              >
                Set your tickets
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                Early bird, standard, VIP. Price it however you want.
              </p>
            </li>

            <li
              className="tkh-step min-w-0 flex flex-col items-start"
              style={{
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "72px",
                  height: "48px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "#2565d0",
                  color: "#ffffff",
                  fontFamily: "var(--tikkitte-font-display)",
                  fontSize: "24px",
                  lineHeight: "1",
                }}
                className="relative flex items-center justify-center"
              >
                05
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    left: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
                <span
                  aria-hidden="true"
                  style={{
                    top: "17px",
                    right: "-7px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--tkh-notch, #ffffff)",
                  }}
                  className="absolute"
                ></span>
              </span>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  lineHeight: "1.25",
                }}
                className="m-0"
              >
                Share and sell
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--tikkitte-ink-soft)",
                }}
                className="m-0"
              >
                Drop your link in your bio, stories and group chats. Sales show
                up live.
              </p>
            </li>
          </SnapCarousel>
        </div>
      </div>
    </section>
  );
}
