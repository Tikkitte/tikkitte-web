export default function AdminPageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="mb-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Platform operations</p>
      <h1 className="create-display mt-1 text-[34px] sm:text-[40px]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--tikkitte-ink-soft)]">{description}</p>
    </header>
  )
}
