import Image from "next/image";
import TicketCard from "@/components/site/TicketCard";
import SitePage from "@/components/site/SitePage";
import TitleBand from "@/components/site/TitleBand";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About Us | Tikkitte",
  description:
    "Meet the team behind Tikkitte, Ghana's home for live event ticketing.",
};
type Founder = {
  name: string;
  initials: string;
  photo?: string;
};
const founders: Founder[] = [
  {
    name: "David Blankson-Hemans",
    initials: "DB",
  },
  {
    name: "Sadique Wumbei",
    initials: "SW",
  },
];
export default function Page() {
  return (
    <SitePage>
      <TitleBand
        title="About Tikkitte"
        intro="Built in Ghana, for Ghana. We're making it easier to discover, buy and sell tickets to live events."
      />
      <main
        className="tkh-layer"
        style={{ padding: "clamp(48px, 6vw, 96px) 0 clamp(72px, 9vw, 128px)" }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 56px)",
            gap: "clamp(48px, 6vw, 88px)",
          }}
          className="flex flex-col"
        >
          <figure
            style={{
              maxWidth: "1080px",
              gap: "8px",
            }}
            className="m-0 flex flex-col"
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--tikkitte-font-display)",
                fontSize: "clamp(96px, 10vw, 150px)",
                lineHeight: "0.7",
                color: "#2565d0",
              }}
            >
              “
            </span>
            <blockquote
              style={{
                fontSize: "clamp(26px, 3vw, 44px)",
                lineHeight: "1.22",
                fontWeight: "500",
                letterSpacing: "-0.01em",
                color: "var(--tikkitte-ink)",
                textWrap: "pretty",
              }}
              className="m-0"
            >
              Ghana&apos;s event scene is thriving, but getting tickets has
              always been an afterthought. We started Tikkitte to give
              organisers a real platform and give fans a way to show up without
              the hassle.
            </blockquote>
          </figure>
          <div className="tkh-team">
            {founders.map((founder) => (
              <TicketCard
                key={founder.name}
                className="tkh-person"
                poster={
                  <div
                    className="tkh-ev-poster"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#2565d0",
                    }}
                  >
                    {founder.photo ? (
                      <Image
                        src={founder.photo}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 116px, 288px"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: "var(--tikkitte-font-display)",
                          fontSize: "clamp(64px, 6vw, 96px)",
                          lineHeight: "1",
                          color: "#ffffff",
                        }}
                      >
                        {founder.initials}
                      </span>
                    )}
                  </div>
                }
              >
                <h2
                  style={{
                    fontFamily: "var(--tikkitte-font-display)",
                    fontWeight: "400",
                    fontSize: "28px",
                    lineHeight: "1",
                    textTransform: "uppercase",
                    color: "var(--tikkitte-ink)",
                  }}
                  className="m-0"
                >
                  {founder.name}
                </h2>
                <p
                  style={{
                    fontSize: "15px",
                    color: "var(--tikkitte-ink-soft)",
                  }}
                  className="m-0"
                >
                  Co-Founder
                </p>
              </TicketCard>
            ))}
          </div>
        </div>
      </main>
    </SitePage>
  );
}
