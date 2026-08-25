import { useId } from "react";

type LivingBrandMarkProps = {
  className?: string;
};

export function LivingBrandMark({ className }: LivingBrandMarkProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 280 300"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-orbit`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="45%" stopColor="#1e88e5" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
        <linearGradient id={`${uid}-green`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81c784" />
          <stop offset="55%" stopColor="#43a047" />
          <stop offset="100%" stopColor="#1b5e20" />
        </linearGradient>
        <linearGradient id={`${uid}-orange`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e65100" />
          <stop offset="50%" stopColor="#ff8f00" />
          <stop offset="100%" stopColor="#ffcc80" />
        </linearGradient>
        <linearGradient id={`${uid}-city`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#90caf9" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="42%" r="48%">
          <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#1e88e5" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0a192f" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      <ellipse cx="140" cy="128" rx="118" ry="108" fill={`url(#${uid}-glow)`} />

      <g className="ss-living-orbit ss-living-orbit--slow">
        <ellipse
          cx="140"
          cy="118"
          rx="108"
          ry="42"
          fill="none"
          stroke={`url(#${uid}-orbit)`}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
          transform="rotate(-28 140 118)"
        />
      </g>
      <g className="ss-living-orbit ss-living-orbit--fast">
        <ellipse
          cx="140"
          cy="122"
          rx="96"
          ry="36"
          fill="none"
          stroke="#4fc3f7"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.55"
          transform="rotate(18 140 122)"
        />
      </g>

      <g className="ss-living-city" fill={`url(#${uid}-city)`}>
        <rect x="78" y="128" width="18" height="52" rx="1.5" />
        <rect x="98" y="116" width="22" height="64" rx="1.5" />
        <rect x="122" y="108" width="16" height="72" rx="1.5" />
        <path d="M148 108c12-22 28-22 40 0v72h-40z" />
        <rect x="190" y="122" width="20" height="58" rx="1.5" />
        <rect x="86" y="148" width="128" height="32" opacity="0.55" />
      </g>
      <g className="ss-living-windows" fill="#e3f2fd">
        <rect x="84" y="136" width="3" height="4" rx="0.5" />
        <rect x="91" y="144" width="3" height="4" rx="0.5" />
        <rect x="104" y="128" width="3" height="4" rx="0.5" />
        <rect x="111" y="140" width="3" height="4" rx="0.5" />
        <rect x="127" y="120" width="3" height="4" rx="0.5" />
        <rect x="133" y="132" width="3" height="4" rx="0.5" />
        <rect x="196" y="132" width="3" height="4" rx="0.5" />
        <rect x="202" y="144" width="3" height="4" rx="0.5" />
      </g>

      <g className="ss-living-needle">
        <path
          d="M168 36 L196 176 L148 158 L92 204 Z"
          fill={`url(#${uid}-orange)`}
        />
        <path
          d="M168 36 L176 152 L148 144 Z"
          fill={`url(#${uid}-green)`}
        />
        <path
          d="M168 36 L174 108 L158 100 Z"
          fill="#c8e6c9"
          opacity="0.45"
        />
      </g>
      <circle cx="148" cy="138" r="17" fill="#ffffff" />
      <circle cx="148" cy="138" r="9.5" className="ss-living-iris" fill="#43a047" />
      <circle cx="144" cy="134" r="3.2" fill="#ffffff" opacity="0.9" />

      <g className="ss-living-sparks" filter={`url(#${uid}-soft)`}>
        <circle className="ss-living-spark ss-living-spark--1" cx="54" cy="88" r="3" fill="#4fc3f7" />
        <circle className="ss-living-spark ss-living-spark--2" cx="226" cy="64" r="2.4" fill="#ff8f00" />
        <circle className="ss-living-spark ss-living-spark--3" cx="214" cy="168" r="2.2" fill="#81c784" />
        <circle className="ss-living-spark ss-living-spark--4" cx="68" cy="176" r="2" fill="#90caf9" />
      </g>
    </svg>
  );
}
