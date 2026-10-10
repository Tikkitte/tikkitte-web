import LiquidBackground from "./LiquidBackground";
import SiteFooter from "./SiteFooter";
export default function SitePage({
  children,
  hero,
}: {
  children: React.ReactNode;
  hero?: React.ReactNode;
}) {
  return (
    <div className="tkh-root">
      {hero ? (
        <>
          {hero}
          <div className="tkh-home-scroll">
            <LiquidBackground />
            {children}
            <SiteFooter />
          </div>
        </>
      ) : (
        <>
          <LiquidBackground />
          {children}
          <SiteFooter />
        </>
      )}
    </div>
  );
}
