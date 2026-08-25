// Definições SVG únicas, reaproveitadas em toda a árvore via <use href="#chair-icon">.
export default function ChairIcons() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="chair-icon" viewBox="0 0 48 48">
        <rect x="13" y="2" width="22" height="19" rx="9" fill="currentColor" />
        <rect x="5" y="16" width="5" height="12" rx="2.5" fill="currentColor" />
        <rect x="38" y="16" width="5" height="12" rx="2.5" fill="currentColor" />
        <rect x="8" y="21" width="32" height="8" rx="4" fill="currentColor" />
        <rect x="21" y="28" width="6" height="7" rx="2" fill="currentColor" />
        <path
          d="M24 35 L8 42 M24 35 L16 44 M24 35 L24 45 M24 35 L32 44 M24 35 L40 42"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="8" cy="42" r="2.2" fill="currentColor" />
        <circle cx="16" cy="44" r="2.2" fill="currentColor" />
        <circle cx="24" cy="45" r="2.2" fill="currentColor" />
        <circle cx="32" cy="44" r="2.2" fill="currentColor" />
        <circle cx="40" cy="42" r="2.2" fill="currentColor" />
      </symbol>

      <symbol id="chair-icon-rounded" viewBox="0 0 48 48">
        <rect x="12" y="4" width="24" height="18" rx="10" fill="currentColor" />
        <rect x="8" y="20" width="32" height="9" rx="4.5" fill="currentColor" />
        <rect x="20" y="29" width="8" height="8" rx="3" fill="currentColor" />
        <rect x="10" y="37" width="28" height="5" rx="2.5" fill="currentColor" />
      </symbol>

      <symbol id="chair-icon-plan" viewBox="0 0 48 48">
        <rect x="9" y="9" width="30" height="30" rx="8" fill="currentColor" />
        <rect x="12" y="3" width="24" height="11" rx="5.5" fill="currentColor" opacity="0.55" />
      </symbol>

      <symbol id="chair-icon-outline" viewBox="0 0 48 48">
        <rect x="10" y="8" width="28" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="10" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="3" />
        <line x1="14" y1="32" x2="14" y2="41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="34" y1="32" x2="34" y2="41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </symbol>
    </svg>
  );
}
