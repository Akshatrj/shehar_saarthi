type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "h-9 w-9" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ss-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="#0a192f" />
      <circle cx="20" cy="19" r="13" fill="none" stroke="url(#ss-ring)" strokeWidth="2.5" />
      <circle cx="20" cy="19" r="10.5" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.75" />
      <path
        d="M8 24c2-3 5-5 9-5.5 2-.3 4 .2 5.5 1.2 1.2.8 2.2 2 3 3.3"
        fill="none"
        stroke="#1e88e5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10 25.5h14v2.5H10z"
        fill="#1565c0"
        opacity="0.85"
      />
      <path
        d="M20 8 L26 26 L20 22 L14 26 Z"
        fill="#ff8f00"
      />
      <path
        d="M20 8 L24 22 L20 20 Z"
        fill="#4caf50"
      />
      <circle cx="20" cy="19" r="2.2" fill="#ffffff" />
      <circle cx="20" cy="19" r="1" fill="#4caf50" />
    </svg>
  );
}
