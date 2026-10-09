import type { Metadata } from "next";
import SitePage from "@/components/site/SitePage";
import Hero from "@/components/home/Hero";
import LineupWall from "@/components/home/LineupWall";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import SellItOut from "@/components/home/SellItOut";
const title = "Tikkitte | Sell tickets to your events in Ghana";
const description =
  "Tickets, check-in and payouts in one place. Built in Ghana for the promoters, venues and artists behind the night. List your event for free.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: { type: "website", title, description },
};
export default function Home() {
  return (
    <SitePage showLiquidBackground={false}>
      <Hero />
      <main className="tkh-home-content">
        <LineupWall />
        <HowItWorks />
        <Features />
        <SellItOut />
      </main>
    </SitePage>
  );
}
