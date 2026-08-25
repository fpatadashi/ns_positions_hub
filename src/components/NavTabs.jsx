export default function NavTabs({ tabs, active, onChange }) {
  return (
    <div className="nav-tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={'nav-tab' + (active === t.key ? ' active' : '')}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
