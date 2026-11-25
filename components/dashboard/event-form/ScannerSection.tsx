'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from 'tikkitte-ui'
import { useScannerAccess } from '../ScannerAccess'
import { ACCENTS, LinkIcon, LockIcon, MoreIcon, Note, Pill, ScanFrameIcon, Section, dangerTextButtonClass, iconButtonClass } from './ui'

const MASK = ['•••••', '•••••']

// Phones keep the button row to one line: the two rare actions move into
// this menu. It opens upwards so the card's rounded clipping never cuts it.
function MoreActions({ busy, onRegenerate, onDisable }: { busy: boolean; onRegenerate: () => void; onDisable: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOutside = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const closeOnEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const item = 'create-focus flex min-h-11 w-full items-center px-4 text-left text-sm font-bold hover:bg-[var(--tikkitte-cream)] disabled:opacity-50'
  return (
    <div ref={ref} className="relative ml-auto sm:hidden">
      <button type="button" aria-label="More scanner options" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)} className={iconButtonClass}>
        <MoreIcon />
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full right-0 z-30 mb-2 w-52 overflow-hidden rounded-2xl border border-[var(--tikkitte-cream-border)] bg-white py-1.5 shadow-[0_12px_32px_rgba(25,25,23,0.16)]">
          <button type="button" role="menuitem" disabled={busy} onClick={() => { setOpen(false); onRegenerate() }} className={`${item} text-[var(--tikkitte-ink)]`}>Regenerate code</button>
          <button type="button" role="menuitem" disabled={busy} onClick={() => { setOpen(false); onDisable() }} className={`${item} text-[#b42318]`}>Disable access</button>
        </div>
      )}
    </div>
  )
}

export default function ScannerSection({ eventId, approved }: { eventId: string; approved: boolean }) {
  const { enabled, code, link, busy, message, update, copy } = useScannerAccess(approved ? eventId : null)
  const groups = code ? [code.slice(0, 5), code.slice(5)] : MASK

  return (
    <Section
      id="scanner"
      title="Scanner access"
      icon={<ScanFrameIcon />}
      accent={ACCENTS.scanner}
      aside={!approved
        ? <Pill tone="muted"><LockIcon size={14} />Locked</Pill>
        : enabled ? <Pill tone="green"><span aria-hidden="true" className="size-[7px] rounded-full bg-[#1f9d6f]" />Active</Pill> : null}
    >
      {!approved && <Note icon={<LockIcon />} tone="ink" className="mb-4">Scanner access unlocks once your account is approved.</Note>}

      <div className={`rounded-[14px] bg-[var(--tikkitte-cream)] px-[18px] py-4 ${approved ? '' : 'opacity-50'}`}>
        <p className="mb-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Scanner code</p>
        <p
          className={`select-all text-2xl font-bold tracking-[0.06em] tabular-nums ${code ? 'text-[var(--tikkitte-ink)]' : 'text-[var(--tikkitte-ink-faint)]'}`}
          aria-label={code ? `Scanner code ${code.split('').join(' ')}` : 'Scanner code hidden'}
        >
          {groups.map((group, i) => <span key={i} className="mr-2.5 inline-block">{group}</span>)}
        </p>
        <p className="mt-2.5 flex items-start gap-1.5 text-[13.5px] text-[var(--tikkitte-ink-soft)]">
          <span className="mt-0.5 flex shrink-0"><LinkIcon /></span>
          {link
            ? <a href={link} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all font-medium text-[var(--tikkitte-ink)] underline decoration-[var(--tikkitte-cream-border)] underline-offset-2 hover:decoration-current">{link.replace(/^https?:\/\//, '')}</a>
            : 'tikkitte.com/scan'}
        </p>
      </div>

      {approved ? (
        <>
          <div className="mt-4 flex items-center gap-2 sm:flex-wrap sm:gap-2.5">
            {code ? (
              <>
                <Button type="button" variant="dark" size="sm" onClick={() => copy(true)}>Copy link</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => copy()}>Copy code</Button>
                {/* Wider screens show the rare actions in the row; phones use the menu. */}
                <span className="hidden sm:contents">
                  <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => update('rotate')}>{busy ? 'Updating…' : 'Regenerate code'}</Button>
                  <span className="flex-1" />
                  <button type="button" disabled={busy} onClick={() => update('revoke')} className={dangerTextButtonClass}>Disable access</button>
                </span>
                <MoreActions busy={busy} onRegenerate={() => update('rotate')} onDisable={() => update('revoke')} />
              </>
            ) : (
              <>
                <Button type="button" variant={enabled === false ? 'dark' : 'secondary'} size="sm" disabled={busy || enabled === null} onClick={() => update('rotate')}>
                  {busy ? 'Updating…' : enabled ? 'Regenerate code' : 'Generate code'}
                </Button>
                <span className="flex-1" />
                {enabled && <button type="button" disabled={busy} onClick={() => update('revoke')} className={dangerTextButtonClass}>Disable access</button>}
              </>
            )}
          </div>
          <p role="status" className="mt-3 text-[13px] leading-[1.45] text-[var(--tikkitte-ink)] empty:hidden">
            {message || (enabled && !code ? 'Regenerate to see the code.' : '')}
          </p>
          <p className="mt-3 text-[13px] leading-[1.45] text-[var(--tikkitte-ink-soft)]">Sessions last 24 hours. Regenerating or disabling ends active sessions.</p>
        </>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button type="button" variant="dark" size="sm" disabled>Generate code</Button>
          <Button type="button" variant="secondary" size="sm" disabled>Copy link</Button>
        </div>
      )}
    </Section>
  )
}
