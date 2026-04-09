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
      <svg
        viewBox="0 0 200 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full translate-y-[2px]"
        aria-hidden
      >
        <ellipse cx="100" cy="72" rx="36" ry="40" fill="#D1D5DB" />
        <path d="M0 260 C0 180 40 155 100 155 C160 155 200 180 200 260 Z" fill="#D1D5DB" />
      </svg>
    </div>
  )
}

export default function AboutUs() {
  return (
    <section className="bg-white py-16 sm:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Quote + founders side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Story pull-quote */}
          <Reveal>
            <p className="text-2xl sm:text-3xl font-light text-gray-700 leading-relaxed italic border-l-2 border-[#3B82F6] pl-6">
              &ldquo;Ghana&apos;s event scene is thriving — but getting tickets has always been an afterthought.
              We started Tikkitte to give organisers a real platform and give fans a way to show up without the hassle.&rdquo;
            </p>
          </Reveal>

          {/* Portrait grid */}
          <div className="grid grid-cols-2 gap-6">
          {founders.map((founder, i) => (
            <Reveal key={founder.name} delay={i * 150}>
              <div className="group">

                {/* Photo — slides up + fades on scroll, image scales on hover */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-5 shadow-sm group-hover:shadow-md transition-shadow duration-500">
                  {founder.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={founder.photo}
                      alt={founder.name}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <PhotoPlaceholder />
                  )}

                  {/* Blue tint on hover */}
                  <div className="absolute inset-0 bg-[#3B82F6] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                </div>

                {/* Name */}
                <p className="text-xl font-bold text-gray-900 group-hover:text-[#3B82F6] transition-colors duration-300">
                  {founder.name}
                </p>

                {/* Role */}
                <p className="mt-1 text-sm font-medium text-gray-400">
                  {founder.role}
                </p>

              </div>
            </Reveal>
          ))}
          </div>

        </div>

      </div>
    </section>
  )
}
