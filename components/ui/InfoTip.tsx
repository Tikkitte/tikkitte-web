type Props = {
  text: string
  width?: string
}

export default function InfoTip({ text, width = 'w-52' }: Props) {
  return (
    <span className="group relative inline-flex cursor-default align-middle">
      <svg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-gray-300 transition-colors group-hover:text-gray-400"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" />
        <path d="M8 7.5v4" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 ${width} -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2.5 text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100`}
      >
        {text}
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  )
}
