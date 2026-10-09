import SitePage from "@/components/site/SitePage";
import TitleBand from "@/components/site/TitleBand";
import { Sk } from "@/components/ui/Skeleton";
export default function Loading() {
  return (
    <SitePage>
      <TitleBand
        current="events"
        title="What's on"
        intro="Buy tickets in seconds, right in your browser. No account needed."
      />
      <main
        className="tkh-layer tkh-page-main"
        aria-busy="true"
        aria-label="Loading events"
      >
        <div className="tkh-container">
          <div className="tkh-evgrid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="tkh-event-link">
                <div className="tkh-ev">
                  <div className="tkh-ev-poster">
                    <Sk className="h-full w-full" />
                  </div>
                  <div className="tkh-ev-stub">
                    <div className="tkh-ev-date">
                      <Sk className="h-4 w-1/2" />
                    </div>
                    <div className="tkh-ev-title">
                      <Sk className="h-full w-4/5" />
                    </div>
                    <div className="tkh-ev-bottom">
                      <Sk className="h-4 w-20" />
                      <Sk className="h-11 w-28 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </SitePage>
  );
}
