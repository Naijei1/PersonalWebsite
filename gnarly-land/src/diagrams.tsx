/** Line diagrams for captures that do not exist yet. They are not scans. */

export function ScanDiagram() {
  return (
    <svg viewBox="0 0 360 640" role="presentation" aria-hidden="true">
      <rect width="360" height="640" fill="none" />
      <rect x="36" y="48" width="288" height="544" rx="8" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M36 430 H250" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <path d="M250 430 V592" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <path d="M36 210 H200" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <path d="M200 48 V210" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <path d="M292 470 H324" fill="none" stroke="var(--ground)" strokeWidth="8" />
      <path
        d="M308 520 C250 500 230 430 210 360 C190 290 150 230 96 168"
        fill="none"
        stroke="var(--tape)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M210 360 L86 300" fill="none" stroke="var(--tape)" strokeWidth="1.5" />
      <path d="M210 360 L120 250" fill="none" stroke="var(--tape)" strokeWidth="1.5" />
      <path d="M210 360 L168 196" fill="none" stroke="var(--tape)" strokeWidth="1.5" />
      <path d="M210 360 L230 150" fill="none" stroke="var(--tape)" strokeWidth="1.5" />
      <path d="M210 360 L292 220" fill="none" stroke="var(--tape)" strokeWidth="1.5" />
      <circle cx="210" cy="360" r="6" fill="var(--tape)" />
      <circle cx="96" cy="168" r="4" fill="var(--ink)" />
    </svg>
  )
}

export function PublishDiagram() {
  return (
    <svg viewBox="0 0 960 460" role="presentation" aria-hidden="true">
      <rect width="960" height="460" fill="none" />
      <rect x="48" y="70" width="340" height="300" rx="6" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <rect x="572" y="70" width="340" height="300" rx="6" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <path d="M48 250 H388" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M572 220 H912" fill="none" stroke="var(--line)" strokeWidth="2" />
      <rect x="448" y="168" width="64" height="64" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <path d="M448 200 H512 M480 168 V232" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <path
        d="M120 320 H400 C430 320 448 280 480 200 H760"
        fill="none"
        stroke="var(--tape)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="120" cy="320" r="6" fill="var(--tape)" />
      <circle cx="760" cy="200" r="6" fill="var(--tape)" />
      <text x="64" y="108" fill="var(--mute)" fontSize="22" fontFamily="Pathway Extreme Variable, sans-serif">
        Zone
      </text>
      <text x="588" y="108" fill="var(--mute)" fontSize="22" fontFamily="Pathway Extreme Variable, sans-serif">
        Zone
      </text>
      <text x="430" y="268" fill="var(--mute)" fontSize="18" fontFamily="Pathway Extreme Variable, sans-serif">
        Elevator
      </text>
    </svg>
  )
}

export function NavigateDiagram() {
  return (
    <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet" role="presentation" aria-hidden="true">
      <rect width="1200" height="760" fill="var(--ground)" />
      <path d="M0 80 L470 250 L470 760 L0 760 Z" fill="#101418" />
      <path d="M1200 80 L730 250 L730 760 L1200 760 Z" fill="#101418" />
      <path d="M0 80 L470 250 L730 250 L1200 80" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M470 250 V760 M730 250 V760" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M180 760 L500 250 M1020 760 L700 250" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      <path d="M80 420 L490 270 M1120 420 L710 270" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      <path d="M470 430 L730 430 L700 250 L500 250 Z" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <polygon points="500,760 700,760 640,300 560,300" fill="var(--tape)" />
      <path d="M545 640 L600 600 L655 640" fill="none" stroke="#062026" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M555 520 L600 488 L645 520" fill="none" stroke="#062026" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M566 420 L600 394 L634 420" fill="none" stroke="#062026" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
