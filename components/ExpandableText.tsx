'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export default function ExpandableText({ text, className = '' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [truncated, setTruncated] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  // Collapse blank paragraph breaks in the collapsed preview so the 2-line
  // clamp shows two lines of actual content instead of spending a line on
  // the organizer's paragraph spacing. The full text (blank lines and all)
  // still shows once expanded.
  const previewText = useMemo(() => text.trim().replace(/\n{2,}/g, '\n'), [text])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => setTruncated(el.scrollHeight > el.clientHeight + 1)
    measure()

    // Re-measure on layout changes (responsive breakpoints, rotation) and
    // once web fonts finish swapping in — either can change how many words
    // fit per line without the effect's [previewText] dependency re-firing.
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)
    document.fonts?.ready.then(measure).catch(() => {})

    return () => resizeObserver.disconnect()
  }, [previewText])

  return (
    <div className={className}>
      <p ref={ref} className={`whitespace-pre-line ${expanded ? '' : 'line-clamp-2'}`}>
        {expanded ? text : previewText}
      </p>
      {(truncated || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="-mx-2 -mt-2 inline-flex min-h-11 items-center rounded px-2 text-sm font-semibold text-[#2565D0] hover:bg-[#2565D0]/5 hover:text-[#1E56B5]"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  )
}
