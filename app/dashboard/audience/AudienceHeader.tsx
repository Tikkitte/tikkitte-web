import AudienceTabs from './AudienceTabs'

export default function AudienceHeader() {
  return (
    <header className="mb-6">
      <h1 className="create-display text-[34px]">Audience</h1>
      <p className="mt-1 text-sm text-[var(--tikkitte-ink-soft)]">People who have successfully purchased tickets to your events.</p>
      <div className="mt-4">
        <AudienceTabs />
      </div>
    </header>
  )
}
