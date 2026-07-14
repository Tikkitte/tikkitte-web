import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  headline: ReactNode
  ctaLabel: string
  ctaHref: string
  size?: 'lg' | 'xl'
}

export default function FinalCTA({ headline, ctaLabel, ctaHref, size = 'xl' }: Props) {
  const headlineSize = size === 'xl' ? 'text-[clamp(44px,7.5vw,104px)]' : 'text-[clamp(40px,6.5vw,92px)]'

  return (
    <section className="px-5 py-[clamp(90px,14vh,160px)] text-center">
      <h2 className={`mx-auto font-anton font-normal uppercase leading-[0.98] text-[#191917] ${headlineSize}`}>
        {headline}
      </h2>
      <Link
        href={ctaHref}
        className="mt-9 inline-block rounded-full bg-[#2565D0] px-10 py-[18px] text-lg font-bold text-white transition-colors hover:bg-[#1E56B5]"
      >
        {ctaLabel}
      </Link>
    </section>
  )
}
