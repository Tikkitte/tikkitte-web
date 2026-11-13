import type { BackdropProps } from './theme'

// Walls, stage, bar and labels for Enzo (840 x 1064). Table positions live in
// lib/enzo-tables.ts.
const STAIR_TREADS_X = Array.from({ length: 11 }, (_, index) => 35 + ((index + 1) * 134) / 12)
const SIDE_STAIR_TREADS_X = [176.75, 184.5, 192.25]

export default function EnzoBackdrop({ t, accent }: BackdropProps) {
  const wall = { stroke: t.backdrop, strokeOpacity: t.backdropOpacity, strokeWidth: 1.8 }
  const area = { fill: t.fill, fillOpacity: t.fillOpacity, ...wall }
  const label = { textAnchor: 'middle' as const, fontSize: 9, letterSpacing: 2.5, fill: t.label, fillOpacity: 0.4 }

  return (
    <>
      <defs>
        <linearGradient id="enzo-platform-edge" gradientUnits="userSpaceOnUse" x1="0" y1="48" x2="0" y2="868">
          <stop offset="0" stopColor={accent} stopOpacity="0" /><stop offset="0.1" stopColor={accent} stopOpacity="0.45" />
          <stop offset="0.9" stopColor={accent} stopOpacity="0.45" /><stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer walls with the entrance gap at the bottom right */}
      <path d="M614 992 L35 992 L35 24 L805 24 L805 992 L662 992 M614 992 L614 1026 M662 992 L662 1026" fill="none" {...wall} strokeLinejoin="round" />
      <text x="636" y="1042" {...label}>ENTRANCE</text>

      {/* Stairs to the mezzanine */}
      <rect x="35" y="24" width="134" height="59" {...area} />
      <rect x="169" y="81" width="31" height="75" {...area} />
      <g {...wall} strokeWidth={1.2}>
        {STAIR_TREADS_X.map((x) => <line key={x} x1={x} y1="24" x2={x} y2="83" />)}
        {SIDE_STAIR_TREADS_X.map((x) => <line key={x} x1={x} y1="81" x2={x} y2="156" />)}
      </g>

      {/* Stage, LED wall and DJ booth */}
      <rect x="200" y="24" width="387" height="150" {...area} />
      <rect x="270" y="25" width="247" height="5" rx="2.5" fill={accent} fillOpacity="0.6" />
      <text x="392" y="15" {...label}>LED WALL</text>
      <rect x="284" y="97" width="219" height="48" rx="6" {...area} />
      <g stroke={accent} strokeOpacity="0.6" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M377.5 121 A16 16 0 0 1 409.5 121" /><rect x="374" y="121" width="7" height="15" rx="3" /><rect x="406" y="121" width="7" height="15" rx="3" />
      </g>
      <text x="392" y="164" {...label}>STAGE</text>

      {/* Side sections sit under the mezzanine */}
      <rect x="35" y="98" width="100" height="709" {...area} />
      <line x1="139" y1="48" x2="139" y2="791" stroke={accent} strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="10 6" />
      <text x="157" y="421.5" transform="rotate(90 157 421.5)" {...label}>MEZZANINE ABOVE</text>

      {/* Raised platform */}
      <rect x="664" y="24" width="141" height="869" {...area} />
      <line x1="659.5" y1="48" x2="659.5" y2="868" stroke="url(#enzo-platform-edge)" strokeWidth="2" />
      <text x="680" y="457" transform="rotate(90 680 457)" {...label}>RAISED PLATFORM</text>

      {/* Bar */}
      <rect x="305" y="912" width="295" height="80" {...area} />
      <g stroke={accent} strokeOpacity="0.6" fill="none" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M435 933 L471 933 L453 953 Z" /><line x1="453" y1="953" x2="453" y2="971" /><line x1="443" y1="971" x2="463" y2="971" />
      </g>

      <rect x="154" y="957" width="77" height="35" {...area} />
    </>
  )
}
