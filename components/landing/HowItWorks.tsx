import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Request access',
    description: 'Sign up with your email. We review requests and approve organizers within 24 hours.',
  },
  {
    number: '02',
    title: 'Create your event',
    description: 'Add your event details, upload a photo, and set your ticket tiers with prices and capacity.',
  },
  {
    number: '03',
    title: 'Go live on the app',
    description: 'Your event appears instantly in the Tikkitte app. Attendees buy tickets, you get paid.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
          Up and running in three steps
        </h2>
        <p className="text-gray-500 text-center text-lg mb-16 max-w-xl mx-auto">
          No technical setup required. If you can fill out a form, you can list an event.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                <span className="text-[#1d67ba] text-xl font-extrabold">{step.number}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute mt-7 ml-48 w-16 h-px bg-gray-200" />
              )}
              <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/signup"
            className="inline-block bg-[#1d67ba] text-white text-base font-semibold px-10 py-4 rounded-xl hover:bg-[#1555a0] transition-colors shadow-sm"
          >
            Get started for free →
          </Link>
        </div>
      </div>
    </section>
  )
}
