import Image from 'next/image'

const PROVIDER_LOGOS: Record<string, string> = {
  'MTN': '/images/providers/mtn.svg',
  'Vodafone Cash': '/images/providers/vodafone-cash.svg',
  'AirtelTigo Money': '/images/providers/airteltigo-money.svg',
  'Absa Bank': '/images/providers/absa-bank.svg',
  'Access Bank': '/images/providers/access-bank.png',
  'Cal Bank': '/images/providers/cal-bank.png',
  'Ecobank': '/images/providers/ecobank.svg',
  'Fidelity Bank': '/images/providers/fidelity-bank.png',
  'FNB': '/images/providers/fnb.svg',
  'GCB Bank': '/images/providers/gcb-bank.svg',
  'GT Bank': '/images/providers/gt-bank.svg',
  'NIB Bank': '/images/providers/nib-bank.jpg',
  'Prudential Bank': '/images/providers/prudential-bank.png',
  'Republic Bank': '/images/providers/republic-bank.svg',
  'Societe Generale': '/images/providers/societe-generale.svg',
  'Stanbic Bank': '/images/providers/stanbic-bank.png',
  'Standard Chartered': '/images/providers/standard-chartered.svg',
  'UBA': '/images/providers/uba.svg',
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

export default function ProviderLogo({ provider }: { provider: string }) {
  const logo = PROVIDER_LOGOS[provider]

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
      {logo ? (
        <Image src={logo} alt="" fill sizes="40px" className="object-contain p-1.5" />
      ) : (
        <BankFallbackIcon className="text-gray-300" />
      )}
    </div>
  )
}
