'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type EventWorkspaceTab = 'overview' | 'tickets' | 'tables' | 'payout' | 'marketing' | 'attendees'

type Props = {
  hasTables: boolean
  counts: Partial<Record<EventWorkspaceTab, number>>
  panels: Record<EventWorkspaceTab, React.ReactNode>
}

const baseTabs: { id: EventWorkspaceTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tickets', label: 'Tickets & sales' },
  { id: 'tables', label: 'Tables' },
  { id: 'payout', label: 'Payout' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'attendees', label: 'Attendees' },
]

function tabFromLocation(validTabs: EventWorkspaceTab[]): EventWorkspaceTab {
  if (typeof window === 'undefined') return 'overview'
  const candidate = new URLSearchParams(window.location.search).get('tab') as EventWorkspaceTab | null
  return candidate && validTabs.includes(candidate) ? candidate : 'overview'
}

export default function EventWorkspace({ hasTables, counts, panels }: Props) {
  const tabs = useMemo(() => baseTabs.filter((tab) => hasTables || tab.id !== 'tables'), [hasTables])
  const validTabs = useMemo(() => tabs.map((tab) => tab.id), [tabs])
  const [activeTab, setActiveTab] = useState<EventWorkspaceTab>('overview')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    const sync = () => setActiveTab(tabFromLocation(validTabs))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [validTabs])

  const selectTab = (tab: EventWorkspaceTab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    if (tab === 'overview') url.searchParams.delete('tab')
    else url.searchParams.set('tab', tab)
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else return
    event.preventDefault()
    const next = tabs[nextIndex]
    selectTab(next.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div>
      <div className="mb-5 overflow-x-auto border-b border-[var(--tikkitte-cream-border)]" role="tablist" aria-label="Event management">
        <div className="flex min-w-max items-end gap-2 pb-3 sm:gap-4">
          {tabs.map((tab, index) => {
            const active = tab.id === activeTab
            const count = counts[tab.id]
            return (
              <button
                key={tab.id}
                ref={(node) => { tabRefs.current[index] = node }}
                type="button"
                role="tab"
                id={`event-tab-${tab.id}`}
                aria-controls={`event-panel-${tab.id}`}
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={`create-focus inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors ${active ? 'bg-[#2e6fe6] text-white' : 'text-[var(--tikkitte-ink-soft)] hover:bg-white'}`}
              >
                {tab.label}
                {typeof count === 'number' && <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-[var(--tikkitte-cream-border)] text-[var(--tikkitte-ink-soft)]'}`}>{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {tabs.map((tab) => (
        <section key={tab.id} role="tabpanel" id={`event-panel-${tab.id}`} aria-labelledby={`event-tab-${tab.id}`} hidden={activeTab !== tab.id}>
          {panels[tab.id]}
        </section>
      ))}
    </div>
  )
}
