export type Hype = 'selling-fast' | 'almost-sold-out'

export default function HypeBadge({ hype }: { hype: Hype }) {
  const sellingFast = hype === 'selling-fast'
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full pl-[7px] pr-[9px] text-[11px] font-bold leading-none text-white ${
        sellingFast ? 'bg-[#2565D0]' : 'bg-[#191917]'
      }`}
    >
      {sellingFast ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-[#F5A524]" aria-hidden="true">
          <path d="M6 2h12M6 22h12M17 2v4.2a2 2 0 0 1-.6 1.4L12 12l-4.4-4.4A2 2 0 0 1 7 6.2V2M7 22v-4.2a2 2 0 0 1 .6-1.4L12 12l4.4 4.4a2 2 0 0 1 .6 1.4V22" />
        </svg>
      )}
      {sellingFast ? 'Selling fast' : 'Almost sold out'}
    </span>
  )
}
