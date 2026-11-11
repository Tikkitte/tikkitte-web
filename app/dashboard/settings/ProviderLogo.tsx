'use client'

import Image from 'next/image'
import { useState } from 'react'

const PROVIDER_LOGOS: Record<string, string> = {
  'MTN': '/images/providers/mtn.svg',
  'Telecel Cash': '/images/providers/telecel-cash.webp',
  'AirtelTigo Money': '/images/providers/airteltigo-money.jpg',
  'Absa Bank': '/images/providers/absa-bank.svg',
  'Access Bank': '/images/providers/access-bank.png',
  'Agricultural Development Bank': '/images/providers/agricultural-development-bank.png',
  'Cal Bank': '/images/providers/cal-bank.png',
  'Consolidated Bank Ghana': '/images/providers/consolidated-bank-ghana.png',
  'Ecobank': '/images/providers/ecobank.svg',
  'Fidelity Bank': '/images/providers/fidelity-bank.png',
  'First Atlantic Bank': '/images/providers/first-atlantic-bank.png',
  'First National Bank': '/images/providers/fnb.svg',
  'GCB Bank': '/images/providers/gcb-bank.svg',
  'GT Bank': '/images/providers/gt-bank.svg',
  'NIB Bank': '/images/providers/nib-bank.jpg',
  'OmniBSIC Bank': '/images/providers/omnibsic-bank.png',
  'Prudential Bank': '/images/providers/prudential-bank.png',
  'Republic Bank': '/images/providers/republic-bank.svg',
  'Societe Generale': '/images/providers/societe-generale.svg',
  'Stanbic Bank': '/images/providers/stanbic-bank.png',
  'Standard Chartered': '/images/providers/standard-chartered.svg',
  'UBA': '/images/providers/uba.svg',
  'Universal Merchant Bank': '/images/providers/universal-merchant-bank.png',
  'Zenith Bank': '/images/providers/zenith-bank.svg',
}

function BankFallbackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 9 5H3l9-5Z" />
      <path d="M4 10v8M9 10v8M15 10v8M20 10v8" />
      <path d="M3 21h18" />
    </svg>
  )
}

// Square artwork with a solid background. In the round size these fill the
// circle; fitted inside it they read as a square floating in a white disc.
// Every other logo is fitted inside the circle and never cropped, which keeps
// wide wordmarks (Societe Generale is about 5:1, UBA 3:1) and tall marks
// (Access is 3:4) intact.
const FULL_BLEED_LOGOS = new Set([
  'Consolidated Bank Ghana',
  'First Atlantic Bank',
  'GT Bank',
  'Republic Bank',
  'Universal Merchant Bank',
])

export default function ProviderLogo({ provider, size = 'md' }: { provider: string; size?: 'sm' | 'md' }) {
  const key = Object.keys(PROVIDER_LOGOS).find((name) => name.toLowerCase() === provider.trim().toLowerCase())
  const logo = key ? PROVIDER_LOGOS[key] : undefined
  const [failed, setFailed] = useState(false)
  const small = size === 'sm'
  const fill = small && key !== undefined && FULL_BLEED_LOGOS.has(key)

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-gray-100 bg-white ${small ? 'h-8 w-8 rounded-full' : 'h-10 w-10 rounded-lg'}`}>
      {logo && !failed ? (
        <Image
          src={logo}
          alt=""
          fill
          sizes={small ? '32px' : '40px'}
          onError={() => setFailed(true)}
          className={fill ? 'object-cover' : `object-contain ${small ? 'p-[3px]' : 'p-1.5'}`}
        />
      ) : (
        <BankFallbackIcon className={small ? 'h-4 w-4 text-gray-400' : 'text-gray-300'} />
      )}
    </div>
  )
}
