import Image from "next/image";
type Brand = {
  name: string;
  src: string;
  // Natural size of the file, used for its aspect ratio.
  width: number;
  height: number;
  // Rendered height in px, tuned per mark so wide wordmarks and compact
  // symbols carry similar visual weight.
  displayHeight: number;
};
const brands: Brand[] = [
  {
    name: "Airport West Hotel",
    src: "/images/site/brands/airport-west-hotel.png",
    width: 808,
    height: 240,
    displayHeight: 46,
  },
  {
    name: "Aria",
    src: "/images/site/brands/aria.png",
    width: 197,
    height: 66,
    displayHeight: 34,
  },
  {
    name: "Enzo",
    src: "/images/site/brands/enzo.png",
    width: 306,
    height: 234,
    displayHeight: 44,
  },
  {
    name: "GR8",
    src: "/images/site/brands/gr8.png",
    width: 159,
    height: 240,
    displayHeight: 54,
  },
  {
    name: "Bellavino",
    src: "/images/site/brands/bellavino.png",
    width: 459,
    height: 205,
    displayHeight: 44,
  },
  {
    name: "YGE Live",
    src: "/images/site/brands/yge-live.png",
    width: 801,
    height: 198,
    displayHeight: 40,
  },
  {
    name: "Club House",
    src: "/images/site/brands/clubhouse.png",
    width: 319,
    height: 240,
    displayHeight: 52,
  },
  {
    name: "R3WIRED",
    src: "/images/site/brands/r3wired.png",
    width: 908,
    height: 240,
    displayHeight: 40,
  },
  {
    name: "Volaré",
    src: "/images/site/brands/volare.png",
    width: 345,
    height: 240,
    displayHeight: 50,
  },
  {
    name: "Sabatani",
    src: "/images/site/brands/sabatani.png",
    width: 508,
    height: 240,
    displayHeight: 46,
  },
];
function BrandGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="tkh-brands-group"
      role="list"
      aria-hidden={duplicate || undefined}
    >
      {brands.map((brand) => (
        <li key={brand.name} className="flex items-center">
          <Image
            src={brand.src}
            alt={duplicate ? "" : brand.name}
            width={Math.round((brand.displayHeight * brand.width) / brand.height)}
            height={brand.displayHeight}
            // Lazy loading waits until a mark scrolls out from under the
            // overflow clip, so drifting logos would pop in blank.
            loading="eager"
            draggable={false}
            style={
              {
                "--tkh-brand-h": `${brand.displayHeight}px`,
              } as React.CSSProperties
            }
          />
        </li>
      ))}
    </ul>
  );
}
export default function TrustedBy() {
  return (
    <section
      className="tkh-layer"
      aria-label="Organizers we've ticketed for"
      style={{
        background: "var(--tikkitte-white)",
        borderTop: "1px solid var(--tikkitte-cream-border)",
        padding: "clamp(44px, 5vw, 72px) 0",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px)",
          gap: "clamp(28px, 3.4vw, 44px)",
        }}
        className="flex flex-col items-center"
      >
        <p
          style={{
            fontSize: "17px",
            lineHeight: "1.5",
            color: "var(--tikkitte-ink-soft)",
            textAlign: "center",
            textWrap: "balance",
          }}
          className="m-0"
        >
          Promoters, venues and brands we&apos;ve ticketed for.
        </p>
        <div className="tkh-brands">
          <div className="tkh-brands-track">
            <BrandGroup />
            <BrandGroup duplicate />
          </div>
        </div>
      </div>
    </section>
  );
}
