import Link from 'next/link'
import Reveal from './Reveal'

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
    <section id="how-it-works" className="bg-gray-50 py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        <Reveal>
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
              Getting started
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Up and running in three steps.
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              No technical setup required. If you can fill out a form, you can list an event.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                <span className="text-4xl font-bold text-gray-100 leading-none">{step.number}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <Link
            href="/signup"
            className="inline-flex bg-[#3B82F6] text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-[#2563EB] hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
          >
            Get started for free →
          </Link>
        </Reveal>

      </div>
    </section>
  )
}
