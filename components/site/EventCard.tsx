import Link from "next/link";
import Image from "next/image";
import PosterPlaceholder from "@/components/PosterPlaceholder";
import { formatEventPrice, type EventWithPrice } from "@/lib/events";
import { formatDateShort, formatTime } from "@/lib/format";
import TicketCard from "./TicketCard";
export default function EventCard({ event }: { event: EventWithPrice }) {
  const href = `/e/${event.slug ?? event.id}`;
  const poster = event.image?.[0];
  const price = event.startingPrice;
  return (
    <Link
      href={href}
      className="tkh-event-link"
      aria-label={`Get tickets for ${event.name}`}
    >
      <TicketCard
        className="tkh-lift"
        poster={
          <div className="tkh-ev-poster" aria-hidden="true">
            {poster ? (
              <Image
                src={poster}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 116px, (max-width: 1080px) 50vw, 33vw"
              />
            ) : (
              <PosterPlaceholder className="h-full w-full" />
            )}
          </div>
        }
      >
        <div className="tkh-ev-date">
          {[formatDateShort(event.date), formatTime(event.time)]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <h2 className="tkh-ev-title">{event.name}</h2>
        <div className="tkh-ev-bottom">
          <span>
            {price !== null && price > 0 ? (
              <>
                From <strong>{formatEventPrice(price)}</strong>
              </>
            ) : (
              <strong>{price === 0 ? "Free" : "TBA"}</strong>
            )}
          </span>
          <span className="tk-button tk-button--primary tk-button--md">
            Get tickets
          </span>
        </div>
      </TicketCard>
    </Link>
  );
}
