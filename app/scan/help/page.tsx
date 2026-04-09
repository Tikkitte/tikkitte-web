import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Scanner Guide | Tikkitte',
  description: 'How to use the Tikkitte ticket scanner at your event.',
}

export default function ScanHelpPage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: '#151718' }}>
      <div className="max-w-lg mx-auto">

        {/* Back link */}
        <Link
          href="/scan"
          className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-70"
          style={{ color: '#9BA1A6' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to scanner
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5" style={{ backgroundColor: '#2a2a2a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ECEDEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3M20 14v2M14 20v3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#ECEDEE' }}>Bouncer Scanner Guide</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#9BA1A6' }}>
            Everything you need to check in attendees at the door using your phone.
          </p>
        </div>

        <div className="flex flex-col gap-3">

          {/* Step 1 */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center" style={{ backgroundColor: '#2a2a2a', color: '#ECEDEE' }}>1</span>
              <h2 className="font-semibold" style={{ color: '#ECEDEE' }}>Get your event PIN</h2>
            </div>
            <p className="text-sm leading-relaxed pl-10" style={{ color: '#9BA1A6' }}>
              The event organiser will give you a 4-digit PIN before the event. This PIN is unique to the event you&apos;re working.
              If you haven&apos;t received one, ask your organiser to generate it in their Tikkitte dashboard.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center" style={{ backgroundColor: '#2a2a2a', color: '#ECEDEE' }}>2</span>
              <h2 className="font-semibold" style={{ color: '#ECEDEE' }}>Open the scanner</h2>
            </div>
            <p className="text-sm leading-relaxed pl-10" style={{ color: '#9BA1A6' }}>
              Go to <span style={{ color: '#ECEDEE', fontWeight: 500 }}>tikkitte.com/scan</span> on an Android phone using Chrome.
              No app download needed — scanning requires Chrome on Android (not supported on iPhone or Safari).
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center" style={{ backgroundColor: '#2a2a2a', color: '#ECEDEE' }}>3</span>
              <h2 className="font-semibold" style={{ color: '#ECEDEE' }}>Enter the PIN</h2>
            </div>
            <p className="text-sm leading-relaxed pl-10" style={{ color: '#9BA1A6' }}>
              Type the 4-digit PIN and tap <span style={{ color: '#ECEDEE', fontWeight: 500 }}>Start scanning</span>.
              The scanner will load the ticket list for that event and activate your camera.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center" style={{ backgroundColor: '#2a2a2a', color: '#ECEDEE' }}>4</span>
              <h2 className="font-semibold" style={{ color: '#ECEDEE' }}>Scan tickets at the door</h2>
            </div>
            <p className="text-sm leading-relaxed pl-10 mb-4" style={{ color: '#9BA1A6' }}>
              Point your camera at the QR code on the attendee&apos;s Tikkitte app. The scanner reads it automatically — no button press needed.
            </p>
            <div className="pl-10 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <p className="text-sm" style={{ color: '#9BA1A6' }}><span style={{ color: '#4ade80', fontWeight: 500 }}>Green — Valid.</span> Ticket is good. Shows ticket type and buyer name. Let them in.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </div>
                <p className="text-sm" style={{ color: '#9BA1A6' }}><span style={{ color: '#f87171', fontWeight: 500 }}>Red — Already scanned.</span> Ticket was already used. Shows the time it was first scanned. Do not let in.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </div>
                <p className="text-sm" style={{ color: '#9BA1A6' }}><span style={{ color: '#f87171', fontWeight: 500 }}>Red — Not found.</span> QR code is not a valid ticket for this event. Do not let in.</p>
              </div>
            </div>
          </div>

          {/* Offline */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                </svg>
              </span>
              <h2 className="font-semibold" style={{ color: '#ECEDEE' }}>Works offline too</h2>
            </div>
            <p className="text-sm leading-relaxed pl-10" style={{ color: '#9BA1A6' }}>
              Once you enter the PIN and the scanner loads, all ticket data is saved to your device.
              If you lose internet mid-event, scanning keeps working — you&apos;ll see an{' '}
              <span style={{ color: '#facc15', fontWeight: 500 }}>offline</span> badge at the top.
              Scans made offline sync automatically when your connection returns.
            </p>
          </div>

          {/* Tips */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <h2 className="font-semibold mb-4" style={{ color: '#ECEDEE' }}>Tips</h2>
            <ul className="text-sm leading-relaxed space-y-3" style={{ color: '#9BA1A6' }}>
              <li className="flex items-start gap-2.5">
                <span className="font-bold mt-px" style={{ color: '#ECEDEE' }}>·</span>
                Keep your screen brightness up — makes scanning faster in dark venues.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold mt-px" style={{ color: '#ECEDEE' }}>·</span>
                Ask attendees to maximise the QR on their screen before you scan.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold mt-px" style={{ color: '#ECEDEE' }}>·</span>
                If the camera doesn&apos;t start, allow camera access in your browser settings and reload.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold mt-px" style={{ color: '#ECEDEE' }}>·</span>
                Tap <span style={{ color: '#ECEDEE', fontWeight: 500 }}>Change event</span> at the top to switch to a different event PIN.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold mt-px" style={{ color: '#ECEDEE' }}>·</span>
                Multiple bouncers can scan the same event at once — everyone uses the same PIN.
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-10 text-center">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#3569bd', color: '#ECEDEE' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3M20 14v2M14 20v3" />
            </svg>
            Open scanner
          </Link>
        </div>

      </div>
    </div>
  )
}
