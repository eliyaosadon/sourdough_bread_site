// A simple drawn loaf used until we have real product photos.
// It takes its color from the parent element (currentColor).
export function LoafArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="100" cy="124" rx="72" ry="9" fill="rgba(60, 35, 15, 0.14)" />
      <path
        d="M22 92 C22 42 62 20 100 20 C138 20 178 42 178 92 C178 113 150 122 100 122 C50 122 22 113 22 92 Z"
        fill="currentColor"
      />
      <path
        d="M22 92 C22 113 50 122 100 122 C150 122 178 113 178 92 C170 104 140 110 100 110 C60 110 30 104 22 92 Z"
        fill="rgba(60, 35, 15, 0.18)"
      />
      <g
        stroke="#fff3dc"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      >
        <path d="M62 62 C68 48 78 40 90 36" />
        <path d="M88 70 C94 54 106 44 120 40" />
        <path d="M118 74 C124 60 134 52 146 50" />
      </g>
    </svg>
  );
}
