import type { Metadata } from "next";
import SitePage from "@/components/site/SitePage";
import TitleBand from "@/components/site/TitleBand";
import EventCard from "@/components/site/EventCard";
import EventListingTile from "@/components/site/EventListingTile";
import { getUpcomingEvents } from "@/lib/events";
export const metadata: Metadata = {
  title: "Upcoming Events | Tikkitte",
  description: "Browse upcoming events in Ghana and buy tickets instantly.",
};
export const revalidate = 30;
export default async function EventsPage() {
  const events = await getUpcomingEvents(100);
  return (
    <SitePage>
      <TitleBand
        current="events"
        title="What's on"
        intro="Buy tickets in seconds, right in your browser. No account needed."
      />
      <main className="tkh-layer tkh-page-main">
        <div className="tkh-container">
          <div className="tkh-evgrid">
            {events.length ? (
              events.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <div className="tkh-empty">
                <h2>No upcoming events right now</h2>
                <p>Check back soon. New events are added all the time.</p>
              </div>
            )}
            <EventListingTile />
          </div>
        </div>
      </main>
    </SitePage>
  );
}
