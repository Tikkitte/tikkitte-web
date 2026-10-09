import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "tikkitte-ui";
import PosterCarousel from "./PosterCarousel";
type LineupPoster = {
  src: string;
  alt: string;
  sizes?: string;
};
const posters: LineupPoster[] = [
  {
    src: "/images/site/posters/robski-bellavino-photo.jpg",
    alt: "Robski performing on stage under colored lights at Bellavino",
  },
  {
    src: "/images/site/posters/dh-bellavino-photo.jpg",
    alt: "DH performing with a microphone on stage at Bellavino",
    // Load enough pixels for this landscape image's 3:4 cover crop.
    sizes: "(max-width: 640px) 152vw, (max-width: 1200px) 570px, 48vw",
  },
  {
    src: "/images/site/posters/gr8-night-with-dh-photo.jpg",
    alt: "A performer raising an arm above the crowd at A GR8 Night with DH",
  },
  {
    src: "/images/site/posters/saturday-night-lights.jpg",
    alt: "Poster for Saturday Night Lights",
  },
  {
    src: "/images/site/posters/r3wired-after-dark.jpg",
    alt: "Poster for R3WIRED: After Dark, Halloween edition",
  },
  {
    src: "/images/site/posters/cassa-loca.jpg",
    alt: "Poster for Cassa Loca Houseparty, Halloween edition",
  },
  {
    src: "/images/site/posters/greatest-show-on-earth.jpg",
    alt: "Poster for The Greatest Show on Earth, Halloween edition at Aria Clubhouse",
  },
];
export default function LineupWall() {
  return (
    <section
      className="tkh-layer"
      style={{
        background: "var(--tikkitte-cream)",
        padding: "clamp(64px, 8vw, 120px) 0 0",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px) clamp(32px, 4vw, 48px)",
        }}
      >
        <div
          className="tkh-head flex flex-wrap justify-between"
          style={{
            gap: "16px 48px",
          }}
        >
          <SectionHeading title="The nights we're behind" />
          <p
            style={{
              maxWidth: "380px",
              fontSize: "17px",
              lineHeight: "1.5",
              color: "var(--tikkitte-ink-soft)",
            }}
            className="m-0"
          >
            From club nights at Aria to live shows like The Bellavino
            Experience.
          </p>
        </div>
      </div>
      <PosterCarousel>
        {posters.map((poster) => (
          <article
            key={poster.src}
            className="tkh-poster relative overflow-hidden"
            style={{
              aspectRatio: "3 / 4",
              background: "#191917",
            }}
          >
            <Image
              src={poster.src}
              alt={poster.alt}
              fill
              draggable={false}
              sizes={poster.sizes ?? "(max-width: 640px) 64vw, 20vw"}
              className="block w-full h-full object-cover"
            />
          </article>
        ))}

        <Link
          className="tkh-nexttile flex-col justify-between"
          href="/signup"
          style={{
            aspectRatio: "3 / 4",
            padding: "clamp(22px, 2vw, 30px)",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--tikkitte-font-display)",
              fontSize: "clamp(44px, 4vw, 60px)",
              lineHeight: "0.92",
              textTransform: "uppercase",
            }}
          >
            Your night here
          </span>
          <span
            style={{
              gap: "8px",
              fontSize: "16px",
              fontWeight: "700",
            }}
            className="inline-flex items-center"
          >
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
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </span>
        </Link>
      </PosterCarousel>
    </section>
  );
}
