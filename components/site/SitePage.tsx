import LiquidBackground from "./LiquidBackground";
import SiteFooter from "./SiteFooter";
export default function SitePage({
  children,
  showLiquidBackground = true,
}: {
  children: React.ReactNode;
  showLiquidBackground?: boolean;
}) {
  return (
    <div className="tkh-root">
      {showLiquidBackground && <LiquidBackground />}
      {children}
      <SiteFooter />
    </div>
  );
}
