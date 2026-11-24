'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { detectQRCode } from '@/lib/scan/decode'
import { clearScannerSession, restoreScannerSession, saveScannerSession, takeScannerCode, isInvalidScannerSession, type ScannerSession } from '@/lib/scan/session'

// ─── Types ───────────────────────────────────────────────────────────────────

type CachedTicket = {
  ticket_id: string
  used: boolean
  ticket_type: string
  quantity: number
  table_code: string | null
  buyer_name: string | null
}

type SessionInfo = ScannerSession

// What door staff see for a known ticket, whether it is valid or already used.
type TicketDetails = { ticketType: string; quantity: number; tableCode: string | null; buyerName: string | null }

type TicketScanResult =
  | ({ status: 'success' } & TicketDetails)
  | ({ status: 'already_used'; scannedAt: string | null } & TicketDetails)
  | { status: 'ticket_not_found' }
  | { status: 'wrong_event' }
  | { status: 'event_not_found' }
  | { status: 'error'; message: string }

type QueueItem = { ticketId: string; eventId: string; ts: number }

type ScanLogEntry = {
  id: string
  ts: number
  status: TicketScanResult['status']
  title: string
  detail: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cacheKey(eventId: string) {
  return `scan_cache_v2_${eventId}`
}

function getCache(eventId: string): Map<string, CachedTicket> {
  try {
    const raw = localStorage.getItem(cacheKey(eventId))
    if (!raw) return new Map()
    const arr: CachedTicket[] = JSON.parse(raw)
    return new Map(arr.map(t => [t.ticket_id, t]))
  } catch {
    return new Map()
  }
}

function saveCache(eventId: string, tickets: CachedTicket[]) {
  localStorage.setItem(cacheKey(eventId), JSON.stringify(tickets))
}

function markCacheUsed(eventId: string, ticketId: string) {
  const cache = getCache(eventId)
  const ticket = cache.get(ticketId)
  if (ticket) {
    ticket.used = true
    saveCache(eventId, Array.from(cache.values()))
  }
}

function getQueue(): QueueItem[] {
  try {
    const items: QueueItem[] = JSON.parse(localStorage.getItem('scan_queue_v2') ?? localStorage.getItem('scan_queue') ?? '[]')
    return items.map(({ ticketId, eventId, ts }) => ({ ticketId, eventId, ts }))
  } catch {
    return []
  }
}

function enqueue(item: QueueItem) {
  const q = getQueue()
  q.push(item)
  localStorage.setItem('scan_queue_v2', JSON.stringify(q))
}

function removeQueued(item: QueueItem) {
  const remaining = getQueue().filter(q => !(q.ticketId === item.ticketId && q.eventId === item.eventId && q.ts === item.ts))
  localStorage.setItem('scan_queue_v2', JSON.stringify(remaining))
}

// Two-tone feedback so door staff can tell a scan's outcome without staring
// at the screen — a loud, dark venue where they're watching the crowd, not
// the phone. iOS Safari has never implemented the Vibration API, so audio
// is the primary channel here; navigator.vibrate is best-effort for Android.
function playFeedbackTone(kind: 'success' | 'reject', ctx: AudioContext) {
  const notes = kind === 'success' ? [880, 1318.5] : [329.6, 233.1]
  const noteDuration = 0.09
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = kind === 'success' ? 'sine' : 'square'
    osc.frequency.value = freq
    const start = ctx.currentTime + i * noteDuration
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.2, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + noteDuration)
  })
}

function ticketDetails(fields: { ticket_type?: string | null; quantity?: number | null; table_code?: string | null; buyer_name?: string | null }): TicketDetails {
  return {
    ticketType: fields.ticket_type?.trim() || 'Ticket',
    quantity: fields.quantity ?? 1,
    tableCode: fields.table_code ?? null,
    buyerName: fields.buyer_name?.trim() || null,
  }
}

function admitLine(t: TicketDetails) {
  if (t.tableCode) return `Table ${t.tableCode} · Admit ${t.quantity} guests`
  return t.quantity > 1 ? `×${t.quantity} tickets` : '×1 ticket'
}

function formatScannedAt(iso: string | null) {
  if (!iso) return 'earlier'
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'earlier'
  }
}

function formatLogTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const SCAN_LOG_LIMIT = 50

// One-line summary for the last-scan strip and the scan history.
function scanSummary(r: TicketScanResult): { title: string; detail: string } {
  switch (r.status) {
    case 'success':
      return { title: r.ticketType, detail: [r.buyerName, admitLine(r)].filter(Boolean).join(' · ') }
    case 'already_used':
      return {
        title: r.ticketType,
        detail: [`Already used${r.scannedAt ? ` at ${formatScannedAt(r.scannedAt)}` : ''}`, r.buyerName, admitLine(r)]
          .filter(Boolean).join(' · '),
      }
    case 'ticket_not_found':
      return { title: 'Not found', detail: 'Ticket not valid for this event' }
    case 'wrong_event':
      return { title: 'Wrong event', detail: 'This ticket is for a different event' }
    case 'event_not_found':
      return { title: 'Error', detail: 'Event not found' }
    case 'error':
      return { title: 'Error', detail: r.message }
  }
}

function logEntryFromResult(r: TicketScanResult): ScanLogEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now(), status: r.status, ...scanSummary(r) }
}

// Ticket type first, then the holder's name and what the ticket admits.
// Valid and already used tickets show the same details.
function TicketDetailLines({ details }: { details: TicketDetails }) {
  return (
    <>
      <p className="text-xl font-semibold mb-1 truncate max-w-full" style={{ color: '#ECEDEE' }}>
        {details.ticketType}
      </p>
      {details.buyerName && (
        <p className="text-lg font-medium mb-1 truncate max-w-full" style={{ color: 'rgba(236,237,238,0.8)' }}>
          {details.buyerName}
        </p>
      )}
      <p className="text-sm" style={{ color: 'rgba(236,237,238,0.5)' }}>
        {admitLine(details)}
      </p>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Scanner() {
  const [phase, setPhase] = useState<'pin' | 'scanning'>('pin')
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [result, setResult] = useState<TicketScanResult | null>(null)
  const [lastResult, setLastResult] = useState<TicketScanResult | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [cameraError, setCameraError] = useState('')
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([])
  const [showLog, setShowLog] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanningRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRefRef = useRef<string | null>(null)
  // Keep a stable ref to session so doScan can read it without stale closure
  const sessionRef = useRef<SessionInfo | null>(null)
  const isOnlineRef = useRef(true)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Scanner authorization uses only the event token. In particular, never
  // let an account-auth client interpret #code as a PKCE sign-in callback.
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false } },
  ))

  function invalidateSession(message: string) {
    const previous=sessionRef.current
    clearScannerSession(localStorage)
    if (previous) localStorage.removeItem(cacheKey(previous.eventId))
    sessionRef.current=null
    scanningRef.current=false
    streamRef.current?.getTracks().forEach(track=>track.stop())
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    setSession(null)
    setPhase('pin')
    setResult(null)
    setPinInput('')
    setPinError(message)
  }

  useEffect(() => {
    const code=takeScannerCode(window.location, window.history)
    if (code!==null) {
      clearScannerSession(localStorage)
      void startSession(code)
      return
    }
    const stored=restoreScannerSession(localStorage)
    if (stored) {
      sessionRef.current=stored
      setSession(stored)
      setPhase('scanning')
      if (navigator.onLine) {
        void supabase.rpc('get_event_tickets_for_cache', {p_event_id:stored.eventId,p_session_token:stored.token})
          .then(({data,error})=>{
            if (sessionRef.current?.token!==stored.token) return
            if (isInvalidScannerSession(error)) invalidateSession('Scanner access expired or was disabled. Ask your organizer for a current code.')
            else if (data) {
              const pending=new Set(getQueue().filter(item=>item.eventId===stored.eventId).map(item=>item.ticketId))
              const cached=getCache(stored.eventId)
              saveCache(stored.eventId,(data as CachedTicket[]).map(ticket=>pending.has(ticket.ticket_id) || cached.get(ticket.ticket_id)?.used ? {...ticket,used:true} : ticket))
            }
          })
      }
    }
  // Restore once; a fragment must be consumed before any session request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll while scanning so the camera view never scrolls
  useEffect(() => {
    if (phase === 'scanning') {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [phase])

  // Online/offline tracking
  useEffect(() => {
    const onOnline = () => { setIsOnline(true); isOnlineRef.current = true }
    const onOffline = () => { setIsOnline(false); isOnlineRef.current = false }
    setIsOnline(navigator.onLine)
    isOnlineRef.current = navigator.onLine
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Keep sessionRef in sync
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  // Remove old caches containing payment references; preserve pending ticket IDs
  // without retaining the compromised legacy PINs in the offline queue.
  useEffect(() => {
    try {
      const pending = getQueue()
      localStorage.setItem('scan_queue_v2', JSON.stringify(pending))
      localStorage.removeItem('scan_queue')
      Object.keys(localStorage).filter(key => key.startsWith('scan_cache_') && !key.startsWith('scan_cache_v2_'))
        .forEach(key => localStorage.removeItem(key))
    } catch { /* Storage may be unavailable; session start reports cache failures. */ }
  }, [])

  // Keep failures queued and reconcile only the event authorized by the current
  // session. Re-entering a code also retries work left by an expired session.
  useEffect(() => {
    if (!isOnline || !session) return
    let cancelled = false
    ;(async () => {
      for (const item of getQueue().filter(q => q.eventId === session.eventId)) {
        if (cancelled) break
        const { data, error } = await supabase.rpc('scan_ticket', {
          p_ticket_id: item.ticketId,
          p_event_id: item.eventId,
          p_session_token: session.token,
        })
        if (cancelled || sessionRef.current?.token!==session.token) break
        if (isInvalidScannerSession(error) || isInvalidScannerSession(data)) {
          invalidateSession('Scanner access expired or was disabled. Enter your code again.')
          break
        }
        if (error || !data) {
          showResult({ status: 'error', message: 'Offline scans are still pending. Reconnect to retry.' })
          break
        }
        if (data.ok || data.error === 'already_used') {
          markCacheUsed(item.eventId, item.ticketId)
          removeQueued(item)
        }
        else {
          showResult({ status: 'error', message: 'An offline scan could not sync. It remains queued. Re-enter your scanner code to retry.' })
          break
        }
      }
    })().catch(() => {
      showResult({ status: 'error', message: 'Offline scans are still pending. Reconnect to retry.' })
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, session])

  // Session expiry also applies while offline. Revocation requires reconnecting.
  useEffect(() => {
    if (!session) return
    const timer = window.setTimeout(() => {
      invalidateSession('Scanner session expired. Enter your code again.')
    }, Math.max(0, Date.parse(session.expiresAt) - Date.now()))
    return () => window.clearTimeout(timer)
  }, [session])

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pinInput.length !== 20) return
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) audioCtxRef.current = new AudioCtx()
    }
    await startSession(pinInput)
  }

  async function startSession(code: string) {
    setPinLoading(true)
    setPinError('')
    try {
      const response = await fetch('/api/scanner/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        cache: 'no-store',
      })
      const data = await response.json()
      if (!response.ok) {
        setPinError(data.error ?? 'Could not connect to scanner.')
        return
      }
      const scannerSession: SessionInfo = data
      const { data: tickets, error } = await supabase.rpc('get_event_tickets_for_cache', {
        p_event_id: scannerSession.eventId,
        p_session_token: scannerSession.token,
      })
      if (isInvalidScannerSession(error)) {
        invalidateSession('Scanner access expired or was disabled. Ask your organizer for a current code.')
        return
      }
      if (error || !tickets) {
        setPinError('Could not load ticket data. Try again.')
        return
      }
      saveCache(scannerSession.eventId, tickets as CachedTicket[])
      saveScannerSession(localStorage,scannerSession)
      sessionRef.current=scannerSession
      setSession(scannerSession)
      setPinInput('')
      setPhase('scanning')
    } catch {
      setPinError('Could not connect or save ticket data on this device. Try again.')
    } finally {
      setPinLoading(false)
    }
  }

  // ── Camera + QR scanning ────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    scanningRef.current = false
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  // These functions are defined outside useCallback intentionally — they reference
  // each other and are only called from startCamera's closure after mount.
  function scheduleScan() {
    if (!scanningRef.current) return
    setTimeout(doScan, 250)
  }

  async function doScan() {
    if (!scanningRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) { scheduleScan(); return }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) { scheduleScan(); return }
    ctx.drawImage(video, 0, 0)

    try {
      const rawValue = await detectQRCode(canvas, ctx)
      if (rawValue) {
        await handleQRCode(rawValue)
        return
      }
    } catch {
      // no QR in frame — non-fatal, keep polling
    }
    scheduleScan()
  }

  const startCamera = useCallback(async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      scanningRef.current = true
      scheduleScan()
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
    const currentSession = sessionRef.current
    if (!currentSession) return

    let payload: { ticket_id?: string; reference?: string; event_id?: string }
    try {
      payload = JSON.parse(raw)
    } catch {
      showResult({ status: 'error', message: 'Invalid QR code' })
      return
    }

    const ticketId = payload?.ticket_id
    if (typeof ticketId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId)) {
      showResult({ status: 'error', message: 'Invalid QR code' })
      return
    }

    if (Date.parse(currentSession.expiresAt) <= Date.now()) {
      invalidateSession('Scanner session expired. Enter your code again.')
      return
    }

    // Debounce — ignore same ticket within 3s
    if (lastRefRef.current === ticketId) {
      scheduleScan()
      return
    }
    lastRefRef.current = ticketId
    setTimeout(() => { lastRefRef.current = null }, 3000)

    if (!isOnlineRef.current) {
      handleOfflineScan(ticketId, currentSession)
      return
    }

    try {
      const { data, error } = await supabase.rpc('scan_ticket', {
        p_ticket_id: ticketId,
        p_event_id: currentSession.eventId,
        p_session_token: currentSession.token,
      })
      if (sessionRef.current?.token!==currentSession.token) return

      if (isInvalidScannerSession(error)) {
        invalidateSession('Scanner access expired or was disabled. Ask your organizer for a current code.')
        return
      }
      if (error || !data) {
        showResult({ status: 'error', message: 'Could not verify this ticket. Try again.' })
        return
      }

      const res = data as {
        ok: boolean
        error?: string
        ticket_type?: string
        quantity?: number
        table_code?: string | null
        buyer_name?: string | null
        scanned_at?: string | null
      }

      if (res.ok) {
        markCacheUsed(currentSession.eventId, ticketId)
        showResult({ status: 'success', ...ticketDetails(res) })
      } else if (res.error === 'invalid_session') {
        invalidateSession('Scanner access expired or was disabled. Ask your organizer for a current code.')
      } else if (res.error === 'already_used') {
        showResult({ status: 'already_used', scannedAt: res.scanned_at ?? null, ...ticketDetails(res) })
      } else if (res.error === 'ticket_not_found') {
        showResult({ status: 'ticket_not_found' })
      } else if (res.error === 'wrong_event') {
        showResult({ status: 'wrong_event' })
      } else if (res.error === 'event_not_found') {
        showResult({ status: 'event_not_found' })
      } else {
        showResult({ status: 'error', message: res.error ?? 'Unknown error' })
      }
    } catch {
      if (!navigator.onLine) handleOfflineScan(ticketId, currentSession)
      else showResult({ status: 'error', message: 'Could not verify this ticket. Try again.' })
    }
  }

  function handleOfflineScan(ticketId: string, currentSession: SessionInfo) {
    const cache = getCache(currentSession.eventId)
    const ticket = cache.get(ticketId)

    if (!ticket) {
      showResult({ status: 'ticket_not_found' })
      return
    }
    if (ticket.used) {
      showResult({ status: 'already_used', scannedAt: null, ...ticketDetails(ticket) })
      return
    }

    markCacheUsed(currentSession.eventId, ticketId)
    enqueue({ ticketId, eventId: currentSession.eventId, ts: Date.now() })
    showResult({ status: 'success', ...ticketDetails(ticket) })
  }

  function showResult(r: TicketScanResult) {
    const kind = r.status === 'success' ? 'success' : 'reject'
    if (navigator.vibrate) navigator.vibrate(kind === 'success' ? 60 : [80, 60, 80])
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
      playFeedbackTone(kind, audioCtxRef.current)
    }

    setResult(r)
    setLastResult(r)
    setScanLog(prev => [logEntryFromResult(r), ...prev].slice(0, SCAN_LOG_LIMIT))
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    resultTimerRef.current = setTimeout(() => {
      setResult(null)
      scheduleScan()
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
            <p className="text-sm" style={{ color: '#9BA1A6' }}>Enter the scanner code from your organizer</p>
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
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={24}
              placeholder="20-character scanner code"
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value.replace(/[\s-]/g, '').toUpperCase().slice(0, 20))
                setPinError('')
              }}
              className="w-full text-center text-lg font-mono tracking-wider rounded-2xl px-6 py-5 outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-lg placeholder:text-base"
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
              disabled={pinInput.length !== 20 || pinLoading}
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
    <div
      className="flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#151718', height: '100dvh' }}
    >

      {/* Top bar — respects notch/status bar */}
      <div
        className="flex items-center justify-between px-4 pb-3 z-20 flex-shrink-0"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLog(true)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ backgroundColor: '#2a2a2a', color: '#9BA1A6' }}
            aria-label="Scan history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v5h5" /><path d="M3.05 13a9 9 0 1 0 .5-4.5L3 8" /><path d="M12 7v5l4 2" />
            </svg>
            {scanLog.length > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: '#3569bd', color: '#fff' }}
              >
                {scanLog.length > 99 ? '99+' : scanLog.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              clearScannerSession(localStorage)
              stopCamera()
              sessionRef.current = null
              setSession(null)
              setPinInput('')
              setResult(null)
              setLastResult(null)
              setScanLog([])
              setShowLog(false)
              setPhase('pin')
            }}
            className="text-xs font-medium transition-colors px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#2a2a2a', color: '#9BA1A6' }}
          >
            Change event
          </button>
        </div>
      </div>

      {/* Camera feed — fills remaining vertical space */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Hidden canvas used for QR detection */}
        <canvas ref={canvasRef} className="hidden" />

        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <p className="text-sm" style={{ color: '#f87171' }}>{cameraError}</p>
          </div>
        ) : (
          /* Viewfinder centered in the camera area */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative" style={{ width: 'min(75vw, 300px)', height: 'min(75vw, 300px)' }}>
              <div className="absolute inset-0 rounded-2xl" style={{ border: '1px solid rgba(155,161,166,0.15)' }} />
              {/* Corners */}
              <div className="absolute top-0 left-0 w-10 h-10 rounded-tl-xl" style={{ borderTop: '3px solid #ECEDEE', borderLeft: '3px solid #ECEDEE' }} />
              <div className="absolute top-0 right-0 w-10 h-10 rounded-tr-xl" style={{ borderTop: '3px solid #ECEDEE', borderRight: '3px solid #ECEDEE' }} />
              <div className="absolute bottom-0 left-0 w-10 h-10 rounded-bl-xl" style={{ borderBottom: '3px solid #ECEDEE', borderLeft: '3px solid #ECEDEE' }} />
              <div className="absolute bottom-0 right-0 w-10 h-10 rounded-br-xl" style={{ borderBottom: '3px solid #ECEDEE', borderRight: '3px solid #ECEDEE' }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom panel — sits outside camera div so it's always visible */}
      <div
        className="flex-shrink-0 px-4 pt-3 z-20"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))', backgroundColor: '#151718' }}
      >
        {lastResult && !result && (
          <div
            className="rounded-2xl px-4 py-3 mb-3 flex items-center gap-3"
            style={{
              backgroundColor: lastResult.status === 'success'
                ? 'rgba(22,101,52,0.95)'
                : 'rgba(127,29,29,0.95)',
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: lastResult.status === 'success' ? '#4ade80' : '#f87171' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(236,237,238,0.5)' }}>Last scan</p>
              <p className="text-sm font-semibold truncate" style={{ color: '#ECEDEE' }}>
                {scanSummary(lastResult).title}
              </p>
              {scanSummary(lastResult).detail && (
                <p className="text-xs truncate" style={{ color: 'rgba(236,237,238,0.65)' }}>
                  {scanSummary(lastResult).detail}
                </p>
              )}
            </div>
          </div>
        )}
        <p className="text-center text-sm" style={{ color: '#9BA1A6' }}>
          Point camera anywhere at QR code
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
              <TicketDetailLines details={result} />
            </>
          )}

          {result.status === 'already_used' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#ECEDEE' }}>Already scanned</p>
              <TicketDetailLines details={result} />
              {result.scannedAt && (
                <p className="text-base mt-2" style={{ color: 'rgba(236,237,238,0.65)' }}>
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

          {result.status === 'wrong_event' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
                </svg>
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#ECEDEE' }}>Wrong event</p>
              <p className="text-base" style={{ color: 'rgba(236,237,238,0.65)' }}>This ticket is for a different event</p>
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

      {/* Scan history panel */}
      {showLog && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowLog(false)}
          />
          <div
            className="relative rounded-t-3xl flex flex-col"
            style={{ backgroundColor: '#1c1e1f', maxHeight: '75vh' }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <h2 className="text-base font-bold" style={{ color: '#ECEDEE' }}>Scan history</h2>
              <button
                onClick={() => setShowLog(false)}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{ backgroundColor: '#2a2a2a', color: '#9BA1A6' }}
              >
                Close
              </button>
            </div>
            <div
              className="overflow-y-auto px-5 pb-5"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
            >
              {scanLog.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#9BA1A6' }}>
                  No scans yet this session
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {scanLog.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ backgroundColor: '#2a2a2a' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.status === 'success' ? '#4ade80' : '#f87171' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#ECEDEE' }}>
                          {entry.title}
                        </p>
                        {entry.detail && (
                          <p className="text-xs truncate" style={{ color: 'rgba(236,237,238,0.55)' }}>
                            {entry.detail}
                          </p>
                        )}
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(236,237,238,0.4)' }}>
                        {formatLogTime(entry.ts)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
