import type { ReactNode } from 'react'
import { Card } from 'tikkitte-ui'

// Shared pieces of the edit event page (design: docs/handoff/BUILD-SPEC.md).

// 16px text on phones stops iOS Safari zooming in when a field is focused.
const fieldBase = 'w-full min-w-0 rounded-[14px] border border-[var(--tikkitte-cream-border)] px-4 text-base outline-none transition-[border-color,box-shadow] placeholder:text-[var(--tikkitte-ink-faint)] focus-visible:border-[var(--tikkitte-blue-bright)] focus-visible:shadow-[0_0_0_3px_var(--tikkitte-blue-tint-soft)] sm:text-[15px]'
// inputClass has no height, for fields that need their own; fieldClass is the standard 48px.
export const inputClass = `${fieldBase} bg-white text-[var(--tikkitte-ink)]`
// Vertical padding as well as the height: iOS Safari top-aligns date and time
// values inside a fixed height but respects padding.
export const fieldClass = `${inputClass} h-12 py-3`
export const lockedFieldClass = `${fieldBase} h-12 cursor-not-allowed py-3 bg-[#f8f6f1] pr-10 text-[var(--tikkitte-ink-soft)]`
export const textareaClass = `${fieldBase} resize-y bg-white py-3.5 leading-normal text-[var(--tikkitte-ink)]`
export const iconButtonClass = 'create-focus inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--tikkitte-cream-border)] bg-white text-[var(--tikkitte-ink-soft)] transition-colors hover:border-[var(--tikkitte-ink)] hover:text-[var(--tikkitte-ink)]'
export const dashedButtonClass = 'create-focus border-[1.5px] border-dashed border-[#c9c2ad] font-bold text-[var(--tikkitte-ink)] transition-colors hover:border-[var(--tikkitte-ink-soft)]'
export const dangerTextButtonClass = 'create-focus inline-flex min-h-11 items-center px-1 text-sm font-bold text-[#b42318] transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-45 disabled:no-underline'

export const ACCENTS = {
  details: { color: '#2565d0', tint: '#e4ecfa' },
  image: { color: '#b0436a', tint: '#f7e4eb' },
  media: { color: '#a8661a', tint: '#f8ecd9' },
  scanner: { color: '#1f7a5c', tint: '#dcefe6' },
  tickets: { color: '#c4532a', tint: '#f9e5dc' },
  status: { color: '#191917', tint: '#ebe8df' },
} as const

export function Section({ id, title, icon, accent, aside, children }: {
  id: string
  title: string
  icon: ReactNode
  accent: (typeof ACCENTS)[keyof typeof ACCENTS]
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8">
      <Card variant="bordered">
        <div className="p-5 sm:p-8">
          <div className="mb-5 flex items-center gap-3.5 sm:mb-7">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11" style={{ background: accent.tint, color: accent.color }}>
              {icon}
            </span>
            <h2 id={`${id}-title`} className="create-display min-w-0 flex-1 truncate text-2xl tracking-[0.01em] sm:text-[28px]">{title}</h2>
            {aside}
          </div>
          {children}
        </div>
      </Card>
    </section>
  )
}

export function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-[var(--tikkitte-ink)]">
      {children}
      {required && <span aria-hidden="true" className="text-[#c8372d]"> *</span>}
    </label>
  )
}

// One line of helper text with a leading icon.
export function Note({ icon, tone = 'soft', children, className = '' }: { icon: ReactNode; tone?: 'soft' | 'ink' | 'warn' | 'danger'; children: ReactNode; className?: string }) {
  const color = { soft: 'text-[var(--tikkitte-ink-soft)]', ink: 'text-[var(--tikkitte-ink)]', warn: 'text-[#8a5a12]', danger: 'text-[#c8372d]' }[tone]
  return (
    <p className={`flex items-start gap-2 text-[13.5px] leading-[1.45] ${color} ${className}`}>
      <span className="mt-px flex shrink-0">{icon}</span>
      <span className="min-w-0">{children}</span>
    </p>
  )
}

export function Pill({ tone, children }: { tone: 'green' | 'muted'; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-bold ${tone === 'green' ? 'bg-[#dcefe6] text-[#1f7a5c]' : 'bg-[#efece4] text-[var(--tikkitte-ink-soft)]'}`}>
      {children}
    </span>
  )
}

function Svg({ size = 16, strokeWidth = 1.8, className, children }: { size?: number; strokeWidth?: number; className?: string; children: ReactNode }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  )
}

type IconProps = { size?: number; strokeWidth?: number; className?: string }

export const DocumentIcon = (p: IconProps) => <Svg size={22} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></Svg>
export const ImageIcon = (p: IconProps) => <Svg size={22} {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L6 21" /></Svg>
export const PlayFrameIcon = (p: IconProps) => <Svg size={22} {...p}><rect x="2.5" y="4" width="19" height="16" rx="3" /><path d="M10 9.2v5.6l4.8-2.8z" /></Svg>
export const ScanFrameIcon = (p: IconProps) => <Svg size={22} {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M20 16v2a2 2 0 0 1-2 2h-2" /><path d="M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M4 12h16" /></Svg>
export const TicketIcon = (p: IconProps) => <Svg size={22} {...p}><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" /><path d="M14 6v2" /><path d="M14 11v2" /><path d="M14 16v2" /></Svg>
export const GlobeIcon = (p: IconProps) => <Svg size={22} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></Svg>
export const ArrowLeftIcon = (p: IconProps) => <Svg {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></Svg>
export const CalendarIcon = (p: IconProps) => <Svg size={15} {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /></Svg>
export const PinIcon = (p: IconProps) => <Svg size={15} {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>
export const ChevronDownIcon = (p: IconProps) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
export const LockIcon = (p: IconProps) => <Svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>
export const VerifiedIcon = (p: IconProps) => <Svg {...p}><path d="M12 3 14.4 5l3.1-.2.8 3 2.6 1.7-1.2 2.9 1.2 2.9-2.6 1.7-.8 3-3.1-.2L12 21l-2.4-2-3.1.2-.8-3L3.1 14.5l1.2-2.9-1.2-2.9 2.6-1.7.8-3L9.6 5z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>
export const CloseIcon = (p: IconProps) => <Svg size={14} strokeWidth={2.2} {...p}><path d="M6 6l12 12" /><path d="M18 6 6 18" /></Svg>
export const PlusIcon = (p: IconProps) => <Svg size={20} strokeWidth={2} {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>
export const PencilIcon = (p: IconProps) => <Svg {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /></Svg>
export const CheckIcon = (p: IconProps) => <Svg size={15} strokeWidth={2.2} {...p}><path d="m5 12 5 5 9-10" /></Svg>
export const LinkIcon = (p: IconProps) => <Svg size={15} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></Svg>
export const TrashIcon = (p: IconProps) => <Svg {...p}><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /><path d="M9 7V4h6v3" /></Svg>
export const CheckCircleIcon = (p: IconProps) => <Svg size={17} {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></Svg>
export const InfoIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>
export const MoreIcon = (p: IconProps) => <Svg size={18} {...p}><circle cx="5.5" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="18.5" cy="12" r="1.3" fill="currentColor" /></Svg>
export const UploadIcon = (p: IconProps) => <Svg size={24} {...p}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></Svg>
