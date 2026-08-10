import Image from 'next/image'
import Link from 'next/link'

type Props = {
  children: React.ReactNode
  heading: string
  description: string
}

export default function CreateAuthShell({ children, heading, description }: Props) {
  return (
    <main className="create-auth flex min-h-dvh bg-[var(--tikkitte-cream)]">
      <section className="relative hidden w-[46%] min-w-[520px] flex-col overflow-hidden bg-[#191917] p-12 text-white lg:flex" aria-label="Tikkitte Create">
        <Link href="/" className="create-focus flex items-center gap-2.5" aria-label="Tikkitte home">
          <Image src="/images/logo.png" alt="" width={44} height={30} priority className="h-[30px] w-auto" />
          <span className="create-display text-2xl text-white">Tikkitte</span>
          <span className="rounded-full bg-[#2e6fe6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Create</span>
        </Link>

        <div aria-hidden="true" className="absolute left-[53%] top-[19%] h-24 w-40 -rotate-6 rounded-xl bg-[#2e6fe6] shadow-2xl">
          <Image src="/images/logo.png" alt="" fill sizes="160px" className="object-contain p-4" />
        </div>
        <div aria-hidden="true" className="absolute left-[55%] top-[37%] h-36 w-36 -rotate-6 rounded-2xl bg-white p-3 shadow-2xl">
          <Image src="/images/create-redesign/qr-sticker.webp" alt="" fill sizes="144px" className="object-contain p-2" />
        </div>

        <div className="mt-auto max-w-[470px] pb-9">
          <p className="create-display text-[42px] leading-[1.04] text-white">Sell tickets.<br /><span className="text-[#2e6fe6]">Get paid directly.</span></p>
          <p className="mt-6 max-w-md text-[13.5px] leading-6 text-[#a7a59a]">The organizer platform built for Ghana&apos;s event scene. Manage events, track revenue, and connect with your fans, all in one place.</p>
        </div>
        <p className="text-xs text-[#6f6d65]">© {new Date().getFullYear()} Tikkitte</p>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10">
        <Link href="/" className="create-focus mb-8 flex items-center gap-2.5 lg:hidden">
          <Image src="/images/logo.png" alt="" width={42} height={28} priority className="h-7 w-auto" />
          <span className="create-display text-xl">Tikkitte</span>
          <span className="rounded-full bg-[#2e6fe6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">Create</span>
        </Link>
        <div className="w-full max-w-[380px] rounded-3xl bg-white p-7 shadow-[0_18px_44px_rgba(25,25,23,0.1)] sm:p-9">
          <h1 className="create-display text-[26px]">{heading}</h1>
          <p className="mb-7 mt-2 text-sm text-[var(--tikkitte-ink-soft)]">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}
