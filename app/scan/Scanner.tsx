'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'

// ─── Types ───────────────────────────────────────────────────────────────────

type CachedTicket = {
  reference: string
  used: boolean
  ticket_type: string
  quantity: number
}

type SessionInfo = {
  eventId: string
  pin: string
  eventName: string
}

type ScanResult =
  | { status: 'success'; ticketType: string; quantity: number }
  | { status: 'already_used'; scannedAt: string | null }
  | { status: 'ticket_not_found' }
  | { status: 'event_not_found' }
  | { status: 'error'; message: string }

type QueueItem = { reference: string; eventId: string; pin: string; ts: number }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cacheKey(eventId: string) {
  return `scan_cache_${eventId}`
}

function getCache(eventId: string): Map<string, CachedTicket> {
  try {
    const raw = localStorage.getItem(cacheKey(eventId))
    if (!raw) return new Map()
    const arr: CachedTicket[] = JSON.parse(raw)
    return new Map(arr.map(t => [t.reference, t]))
  } catch {
    return new Map()
  }
}

function saveCache(eventId: string, tickets: CachedTicket[]) {
  localStorage.setItem(cacheKey(eventId), JSON.stringify(tickets))
}

function getCacheList(eventId: string): CachedTicket[] {
  return Array.from(getCache(eventId).values())
}

function markCacheUsed(eventId: string, reference: string) {
  const cache = getCache(eventId)
  const ticket = cache.get(reference)
  if (ticket) {
    ticket.used = true
    saveCache(eventId, Array.from(cache.values()))
  }
}

function getQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem('scan_queue') ?? '[]')
  } catch {
    return []
  }
}

function enqueue(item: QueueItem) {
  const q = getQueue()
  q.push(item)
  localStorage.setItem('scan_queue', JSON.stringify(q))
}

function clearQueue() {
  localStorage.removeItem('scan_queue')
}

function formatScannedAt(iso: string | null) {
  if (!iso) return 'earlier'
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'earlier'
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Scanner() {
  const [phase, setPhase] = useState<'pin' | 'scanning'>('pin')
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [cameraError, setCameraError] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRefRef = useRef<string | null>(null)

  const supabase = createClient()

  // Online/offline tracking
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    setIsOnline(navigator.onLine)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Flush offline queue when coming back online
  useEffect(() => {
    if (!isOnline || !session) return
    const queue = getQueue()
    if (!queue.length) return
    ;(async () => {
      for (const item of queue) {
        try {
          await supabase.rpc('scan_ticket', {
            p_reference: item.reference,
            p_event_id: item.eventId,
            p_pin: item.pin,
          })
        } catch {
          // best-effort — leave remaining for next reconnect
        }
      }
      clearQueue()
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  // ── PIN submit ──────────────────────────────────────────────────────────────

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pinInput.length !== 4) return
    setPinLoading(true)
    setPinError('')

    // Look up event by PIN, then fetch all tickets for offline cache
    const { data: events, error: eventErr } = await supabase
      .from('event')
      .select('id, name')
      .eq('scanner_pin', pinInput)
      .limit(1)

    if (eventErr || !events || events.length === 0) {
      setPinError('Invalid PIN. Please check with your organizer.')
      setPinLoading(false)
      return
    }

    const event = events[0]

    const { data: tickets, error: cacheErr } = await supabase.rpc('get_event_tickets_for_cache', {
      p_event_id: event.id,
      p_pin: pinInput,
    })

    if (cacheErr) {
      setPinError('Could not load ticket data. Try again.')
      setPinLoading(false)
      return
    }

    saveCache(event.id, tickets as CachedTicket[])
    setSession({ eventId: event.id, pin: pinInput, eventName: event.name })
    setPhase('scanning')
    setPinLoading(false)
  }

  // ── Camera + QR scanning (zxing — works on iOS Safari too) ─────────────────

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError('')
    if (!videoRef.current) return
    try {
      const reader = new BrowserQRCodeReader()
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, error) => {
          if (result) handleQRCode(result.getText())
          // errors are non-fatal (no QR in frame) — zxing fires them continuously
          void error
        }
      )
      controlsRef.current = controls
    } catch {
      setCameraError('Camera access denied. Please allow camera access and reload.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase === 'scanning') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── QR handling ─────────────────────────────────────────────────────────────

  async function handleQRCode(raw: string) {
    if (!session) return

    let payload: { reference?: string; event_id?: string }
    try {
      payload = JSON.parse(raw)
    } catch {
      showResult({ status: 'error', message: 'Invalid QR code' })
      return
    }

    const reference = payload.reference
    if (!reference) {
      showResult({ status: 'error', message: 'Invalid QR code' })
      return
    }

    // Debounce — ignore same ref within 3s
    if (lastRefRef.current === reference) {
      return
    }
    lastRefRef.current = reference
    setTimeout(() => { lastRefRef.current = null }, 3000)

    if (!isOnline) {
      handleOfflineScan(reference)
      return
    }

    try {
      const { data } = await supabase.rpc('scan_ticket', {
        p_reference: reference,
        p_event_id: session.eventId,
        p_pin: session.pin,
      })

      const res = data as {
        ok: boolean
        error?: string
        ticket_type?: string
        quantity?: number
        buyer_name?: string
        scanned_at?: string
      }

      if (res.ok) {
        markCacheUsed(session.eventId, reference)
        showResult({ status: 'success', ticketType: res.ticket_type!, quantity: res.quantity! })
      } else if (res.error === 'already_used') {
        showResult({ status: 'already_used', scannedAt: res.scanned_at ?? null })
      } else if (res.error === 'ticket_not_found') {
        showResult({ status: 'ticket_not_found' })
      } else if (res.error === 'event_not_found') {
        showResult({ status: 'event_not_found' })
      } else {
        showResult({ status: 'error', message: res.error ?? 'Unknown error' })
      }
    } catch {
      // Network failure mid-request — fall back to offline
      handleOfflineScan(reference)
    }
  }

  function handleOfflineScan(reference: string) {
    if (!session) return
    const cache = getCache(session.eventId)
    const ticket = cache.get(reference)

    if (!ticket) {
      showResult({ status: 'ticket_not_found' })
      return
    }
    if (ticket.used) {
      showResult({ status: 'already_used', scannedAt: null })
      return
    }

    markCacheUsed(session.eventId, reference)
    enqueue({ reference, eventId: session.eventId, pin: session.pin, ts: Date.now() })
    showResult({ status: 'success', ticketType: ticket.ticket_type, quantity: ticket.quantity })
  }

  function showResult(r: ScanResult) {
    setResult(r)
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    resultTimerRef.current = setTimeout(() => {
      setResult(null)
    }, 2500)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (phase === 'pin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#151718' }}>
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#2a2a2a' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3M20 14v2M14 20v3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#ECEDEE' }}>Ticket Scanner</h1>
            <p className="text-sm" style={{ color: '#9BA1A6' }}>Enter the event PIN from your organizer</p>
            <a
              href="/scan/help"
              className="inline-block mt-3 text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: '#9BA1A6' }}
            >
              How does this work?
            </a>
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              placeholder="4-digit PIN"
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                setPinError('')
              }}
              className="w-full text-center text-3xl font-mono tracking-[0.5em] rounded-2xl px-6 py-5 outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-lg placeholder:text-base"
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                color: '#ECEDEE',
              }}
              autoFocus
            />

            {pinError && (
              <p className="text-sm text-center" style={{ color: '#f87171' }}>{pinError}</p>
            )}

            <button
              type="submit"
              disabled={pinInput.length !== 4 || pinLoading}
              className="w-full font-semibold py-4 rounded-2xl transition-colors text-base disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#3569bd', color: '#fff' }}
            >
              {pinLoading ? 'Connecting…' : 'Start scanning'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Scanning phase ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#151718' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 z-20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate max-w-[200px]" style={{ color: '#ECEDEE' }}>
            {session?.eventName}
          </span>
          {!isOnline && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#facc15' }}>
              offline
            </span>
          )}
        </div>
        <button
          onClick={() => {
            stopCamera()
            setSession(null)
            setPinInput('')
            setResult(null)
            setPhase('pin')
          }}
          className="text-xs font-medium transition-colors px-3 py-1.5 rounded-full"
          style={{ backgroundColor: '#2a2a2a', color: '#9BA1A6' }}
        >
          Change event
        </button>
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {cameraError ? (
          <div className="relative z-10 text-center px-8">
            <p className="text-sm" style={{ color: '#f87171' }}>{cameraError}</p>
          </div>
        ) : (
          /* Viewfinder */
          <div className="relative z-10 w-64 h-64">
            <div className="absolute inset-0 rounded-2xl" style={{ border: '1px solid rgba(155,161,166,0.2)' }} />
            {/* Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-xl" style={{ borderTop: '3px solid #ECEDEE', borderLeft: '3px solid #ECEDEE' }} />
            <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-xl" style={{ borderTop: '3px solid #ECEDEE', borderRight: '3px solid #ECEDEE' }} />
            <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-xl" style={{ borderBottom: '3px solid #ECEDEE', borderLeft: '3px solid #ECEDEE' }} />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-xl" style={{ borderBottom: '3px solid #ECEDEE', borderRight: '3px solid #ECEDEE' }} />
          </div>
        )}

        <p className="absolute bottom-8 left-0 right-0 text-center text-sm z-10" style={{ color: '#9BA1A6' }}>
          Point camera at ticket QR code
        </p>
      </div>

      {/* Result overlay */}
      {result && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center"
          style={{
            backgroundColor: result.status === 'success'
              ? 'rgba(22,101,52,0.97)'
              : 'rgba(127,29,29,0.97)',
          }}
        >
          {result.status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#ECEDEE' }}>Valid</p>
              <p className="text-lg font-medium mb-1" style={{ color: 'rgba(236,237,238,0.8)' }}>{result.ticketType}</p>
              <p className="text-sm" style={{ color: 'rgba(236,237,238,0.5)' }}>
                {result.quantity > 1 ? `×${result.quantity} tickets` : '×1 ticket'}
              </p>
            </>
          )}

          {result.status === 'already_used' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#ECEDEE' }}>Already scanned</p>
              {result.scannedAt && (
                <p className="text-base" style={{ color: 'rgba(236,237,238,0.65)' }}>
                  Used at {formatScannedAt(result.scannedAt)}
                </p>
              )}
            </>
          )}

          {result.status === 'ticket_not_found' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
                </svg>
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#ECEDEE' }}>Not found</p>
              <p className="text-base" style={{ color: 'rgba(236,237,238,0.65)' }}>Ticket not valid for this event</p>
            </>
          )}

          {(result.status === 'event_not_found' || result.status === 'error') && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#ECEDEE' }}>Error</p>
              <p className="text-base" style={{ color: 'rgba(236,237,238,0.65)' }}>
                {'message' in result ? result.message : 'Could not verify ticket'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
