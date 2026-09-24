export default function NavTabs({ tabs, active, onChange }) {
  return (
    <div className="nav-tabs-outer">
      <div className="sprint-label-single">Sprint</div>
      <div className="sprint-bracket-single" />
      <div className="nav-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={'nav-tab' + (active === t.key ? ' active' : '')}
            onClick={() => onChange(t.key)}
          >
            {t.label}
            {t.sprint && <span className="sprint-badge">Sprint {t.sprint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
