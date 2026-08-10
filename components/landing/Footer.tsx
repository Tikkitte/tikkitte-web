import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-[#E7E2D4] bg-[#F4F2EC] font-grotesk">
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,4vw,56px)] pb-8 pt-12">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="" width={54} height={36} unoptimized style={{ height: '28px', width: 'auto' }} />
              <Image src="/images/text-logo-web.png" alt="Tikkitte" width={120} height={20} unoptimized style={{ height: '18px', width: 'auto' }} />
            </Link>
            <p className="text-sm text-[#8a887c]">Event ticketing for Ghana.</p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div className="flex flex-col gap-2.5">
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#8a887c]">Explore</p>
              <Link href="/events" className="text-sm text-[#5F5D54] hover:text-[#191917]">Browse events</Link>
              <Link href="/organizers" className="text-sm text-[#5F5D54] hover:text-[#191917]">Sell tickets</Link>
              <Link href="/about" className="text-sm text-[#5F5D54] hover:text-[#191917]">About us</Link>
              <Link href="/login" className="text-sm text-[#5F5D54] hover:text-[#191917]">Organizer sign in</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#8a887c]">Contact</p>
              <Link href="/contact" className="text-sm text-[#5F5D54] hover:text-[#191917]">Contact us</Link>
              <a href="mailto:admin@tikkitte.com" className="text-sm text-[#5F5D54] hover:text-[#191917]">admin@tikkitte.com</a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#E7E2D4] pt-6">
          <p className="text-[13px] text-[#8a887c]">
            © {new Date().getFullYear()} FIRSTPASS EVENTS LTD. Tikkitte is a trading name of FIRSTPASS EVENTS LTD.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[13px] text-[#8a887c] hover:text-[#191917]">Terms</Link>
            <Link href="/privacy" className="text-[13px] text-[#8a887c] hover:text-[#191917]">Privacy</Link>
            <Link href="/refund-policy" className="text-[13px] text-[#8a887c] hover:text-[#191917]">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
