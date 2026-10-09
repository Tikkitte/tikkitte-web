export default function TicketCard({
  poster,
  children,
  className = "",
}: {
  poster: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`tkh-ev ${className}`}>
      {poster}
      <div className="tkh-ev-stub">{children}</div>
    </article>
  );
}
