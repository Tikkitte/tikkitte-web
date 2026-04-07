import Reveal from './Reveal'

const founders = [
  {
    name: 'David Blankson-Hemans',
    role: 'Co-Founder',
    photo: null, // replace with '/images/david-bh.jpg' when ready
  },
  {
    name: 'David Poku',
    role: 'Co-Founder',
    photo: null, // replace with '/images/david-poku.jpg' when ready
  },
]

function PhotoPlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-end justify-center">
      {/* Person silhouette */}
      <svg
        viewBox="0 0 200 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full translate-y-[2px]"
        aria-hidden
      >
        {/* Head */}
        <ellipse cx="100" cy="72" rx="36" ry="40" fill="#D1D5DB" />
        {/* Body / shoulders */}
        <path
          d="M0 260 C0 180 40 155 100 155 C160 155 200 180 200 260 Z"
          fill="#D1D5DB"
        />
      </svg>
    </div>
  )
}

export default function AboutUs() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Header row */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16 pb-10 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
                The founders
              </span>
              <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Meet the team.
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-md leading-relaxed">
                Tikkitte was born out of frustration with how hard it is to discover and buy tickets in Ghana. We&apos;re fixing that.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Portrait row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
          {founders.map((founder, i) => (
            <Reveal key={founder.name} delay={i * 120}>
              <div className="group">

                {/* Photo */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-6">
                  {founder.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={founder.photo}
                      alt={founder.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <PhotoPlaceholder />
                  )}
                </div>

                {/* Name */}
                <p className="text-lg font-bold tracking-wide text-gray-900 uppercase">
                  {founder.name}
                </p>

                {/* Role */}
                <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase">
                  {founder.role}
                </p>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
