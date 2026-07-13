const features = [
  { num: '01', title: 'Instant ticketing', body: 'Create your event, set ticket tiers, go live in minutes. No approval maze.' },
  { num: '02', title: 'QR at the door', body: 'Every ticket gets a unique QR code. Scan and go. Fast, secure, paperless.' },
  { num: '03', title: 'Real-time sales', body: 'Revenue, attendance, and ticket breakdown at a glance, updated live.' },
  { num: '04', title: 'Built for Ghana', body: 'Payments in cedis. No foreign currency confusion, no conversion fees.' },
  { num: '05', title: 'Automatic reminders', body: 'Attendees get nudged 24 hours and 1 hour before doors. Fewer no-shows.' },
  { num: '06', title: 'Built-in audience', body: 'Your event lands in front of people already looking for something to do.' },
]

export default function Features() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-[clamp(80px,12vh,130px)] lg:px-14">
      <div className="text-center">
        <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">Platform</div>
        <h2 className="mx-auto mt-4 max-w-[800px] font-anton text-[clamp(34px,5vw,64px)] uppercase leading-[1.02] text-[#191917]">
          Everything you need to run the door
        </h2>
      </div>
      <div className="mt-[52px] grid grid-cols-1 gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {features.map((f) => (
          <div key={f.num} className="rounded-[20px] border border-[#E4DFD1] bg-white p-7">
            <div className="font-anton text-[15px] tracking-[0.1em] text-[#2565D0]">{f.num}</div>
            <h3 className="mt-3 font-anton text-[23px] uppercase text-[#191917]">{f.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[#5F5D54]">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
