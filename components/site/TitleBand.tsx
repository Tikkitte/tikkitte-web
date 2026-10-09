import SiteHeader from "./SiteHeader";
export default function TitleBand({
  title,
  intro,
  current,
  legal = false,
}: {
  title: string;
  intro: string;
  current?: "events";
  legal?: boolean;
}) {
  return (
    <header className={`tkh-band${legal ? " tkh-band--legal" : ""}`}>
      <SiteHeader variant="solid" current={current} />
      <div className="tkh-band-content">
        <div className="tkh-head">
          <h1
            className={`tk-section-heading__title !text-white tkh-band-title${legal ? " tkh-band-title--legal" : ""}`}
          >
            {title}
          </h1>
          <p className="tkh-band-intro">{intro}</p>
        </div>
      </div>
    </header>
  );
}
