const words = ['Concerts', 'Parties', 'Beach days', 'Game nights', 'Live bands', 'Comedy', 'Rooftops', 'Festivals']

function Track() {
  return (
    <span className="whitespace-nowrap font-anton font-normal text-2xl uppercase tracking-[0.08em] text-[#8a887c]">
      {words.map((w) => `${w}  ✦  `).join('')}
    </span>
  )
}

export default function Marquee() {
  return (
    <div className="overflow-hidden whitespace-nowrap border-y border-[#E7E2D4] py-[18px]">
      <div className="inline-flex animate-marquee">
        <Track />
        <Track />
      </div>
    </div>
  )
}
