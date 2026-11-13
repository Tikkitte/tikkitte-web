import type { BackdropProps } from './theme'

export default function AriaBackdrop({ t, accent }: BackdropProps) {
  return (
    <>
      <defs>
        <linearGradient id="aria-level-top" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="372" y2="0">
          <stop offset="0" stopColor={accent} stopOpacity="0" /><stop offset="0.12" stopColor={accent} stopOpacity="0.4" />
          <stop offset="0.88" stopColor={accent} stopOpacity="0.4" /><stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aria-level-bottom" gradientUnits="userSpaceOnUse" x1="99" y1="0" x2="372" y2="0">
          <stop offset="0" stopColor={accent} stopOpacity="0" /><stop offset="0.12" stopColor={accent} stopOpacity="0.4" />
          <stop offset="0.88" stopColor={accent} stopOpacity="0.4" /><stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d="M6 903 L6 11 L563 11 L563 560 L783 560 L783 570 M783 618 L783 735 M783 790 L783 800 L90 800 L90 903 L6 903 M6 800 L62 800" fill="none" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="413" y1="198" x2="563" y2="198" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" />
      <polygon points="380,290 563,290 563,595 380,630" fill={t.fill} fillOpacity={t.fillOpacity} stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" strokeLinejoin="round" />
      <g stroke={accent} strokeOpacity="0.6" fill="none" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M453 424 L489 424 L471 444 Z" /><line x1="471" y1="444" x2="471" y2="462" /><line x1="461" y1="462" x2="481" y2="462" />
      </g>
      <g stroke={t.backdrop} strokeOpacity={t.backdropOpacity} fill="none">
        <rect x="6" y="471" width="85" height="159" fill={t.fill} fillOpacity={t.fillOpacity} strokeWidth="1.8" />
        <g stroke={accent} strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round">
          <path d="M32 542 A16 16 0 0 1 64 542" /><rect x="28" y="542" width="8" height="15" rx="3" /><rect x="60" y="542" width="8" height="15" rx="3" />
        </g>
      </g>
      <line x1="398" y1="725" x2="783" y2="725" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" />
      <text x="798" y="594" transform="rotate(90 798 594)" textAnchor="middle" fontSize="9" letterSpacing="2.5" fill={t.label} fillOpacity="0.4">EXIT</text>
      <text x="798" y="762" transform="rotate(90 798 762)" textAnchor="middle" fontSize="9" letterSpacing="2.5" fill={t.label} fillOpacity="0.4">ENTRANCE</text>
      <g stroke={accent} strokeOpacity="0.6" fill="none" strokeWidth="1.5">
        <circle cx="38" cy="840" r="5" /><rect x="31" y="849" width="14" height="17" rx="4" /><circle cx="60" cy="840" r="5" /><path d="M52 866 L60 849 L68 866 Z" strokeLinejoin="round" />
      </g>
      <line x1="10" y1="288" x2="372" y2="288" stroke="url(#aria-level-top)" strokeWidth="2" />
      <line x1="10" y1="292" x2="372" y2="292" stroke="url(#aria-level-top)" strokeWidth="1" opacity="0.4" />
      <line x1="99" y1="630" x2="372" y2="630" stroke="url(#aria-level-bottom)" strokeWidth="2" />
      <line x1="99" y1="634" x2="372" y2="634" stroke="url(#aria-level-bottom)" strokeWidth="1" opacity="0.4" />
      <rect x="170" y="340" width="86" height="156" rx="43" fill={t.fill} fillOpacity={t.fillOpacity} stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.5" />
      <rect x="192" y="362" width="42" height="112" rx="21" fill="none" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.5" />
      <image href="/images/logo-watermark.png" x="70" y="640" width="274" height="156" opacity="0.12" preserveAspectRatio="xMidYMid meet" />
    </>
  )
}
