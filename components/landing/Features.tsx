const features = [
  {
    icon: '🎟️',
    title: 'Instant ticketing',
    description: 'Create your event, set your ticket tiers, and go live in minutes. No lengthy approval process.',
  },
  {
    icon: '📱',
    title: 'QR code scanning',
    description: 'Every ticket gets a unique QR code. Scan at the door — fast, secure, no paper needed.',
  },
  {
    icon: '📊',
    title: 'Real-time sales',
    description: 'Watch tickets sell in real time. See revenue, attendance, and ticket breakdown at a glance.',
  },
  {
    icon: '🇬🇭',
    title: 'Built for Ghana',
    description: 'Payments in cedis via Paystack. No foreign currency confusion, no international fees.',
  },
  {
    icon: '🔔',
    title: 'Automatic reminders',
    description: 'Attendees get push notifications 24 hours and 1 hour before your event. Fewer no-shows.',
  },
  {
    icon: '📣',
    title: 'Built-in audience',
    description: 'Your event appears directly in the Tikkitte app to people actively looking for things to do.',
  },
]

export default function Features() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
          Everything you need to run your event
        </h2>
        <p className="text-gray-500 text-center text-lg mb-14 max-w-xl mx-auto">
          No spreadsheets, no manual transfers. Just a clean dashboard and happy attendees.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
