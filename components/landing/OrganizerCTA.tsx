import Link from 'next/link'

export default function OrganizerCTA() {
  return (
    <section className="bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Want to sell tickets?
        </h2>
        <p className="text-gray-600 dark:text-slate-300 max-w-lg mx-auto mb-8">
          List your event on Tikkitte and reach thousands of people looking for things to do in Ghana. Set up in minutes.
        </p>
        <Link
          href="/organizers"
          className="inline-flex bg-[#1d67ba] text-white text-base font-semibold px-8 py-3.5 rounded-xl hover:bg-[#1555a0] transition-colors shadow-sm"
        >
          Learn more
        </Link>
      </div>
    </section>
  )
}
