import { LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { LOGO_SIDEBAR_MARK_PATH } from '../shared/images';
import { cargoOf } from '../shared/permissions';
import { usernameOf } from '../shared/lib/userIdentity';

function initialsOf(email) {
  const name = String(email || '').split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

export default function Sidebar({
  sections, active, onChange,
  expanded, onToggleExpand,
  collapsed, onToggleCollapse,
  userEmail, onSignOut
}) {
  return (
    <aside className={'sidebar' + (collapsed ? ' collapsed' : '')}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-main">
          <img className="sidebar-brand-mark" src={LOGO_SIDEBAR_MARK_PATH} alt="NS Position Hub" />
          {!collapsed && (
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-title">Position <span>Hub</span></div>
              <div className="sidebar-brand-sub">Nstech</div>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggleCollapse} title={collapsed ? 'Expandir menu' : 'Retrair menu'}>
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section, si) => (
          <div className="sidebar-section" key={section.label}>
            {!collapsed && <div className="sidebar-group-label">{section.label}</div>}

            {section.items.map((it) => {
              const Icon = it.icon;
              const hasChildren = !!it.children;
              const isExpanded = hasChildren && expanded.has(it.key);
              return (
                <div key={it.key}>
                  <button
                    className={'sidebar-item' + (active === it.key ? ' active' : '')}
                    onClick={() => (hasChildren ? onToggleExpand(it.key) : onChange(it.key))}
                    title={collapsed ? it.label : undefined}
                  >
                    <Icon className="sidebar-item-icon" size={18} strokeWidth={1.75} />
                    {!collapsed && <span className="sidebar-item-label">{it.label}</span>}
                    {hasChildren && !collapsed && (
                      isExpanded
                        ? <ChevronDown className="sidebar-item-chevron" size={14} />
                        : <ChevronRight className="sidebar-item-chevron" size={14} />
                    )}
                  </button>

                  {hasChildren && isExpanded && !collapsed && (
                    <div className="sidebar-children">
                      {it.children.map((child) => (
                        <button
                          key={child.key}
                          className={'sidebar-subitem' + (active === child.key ? ' active' : '')}
                          onClick={() => onChange(child.key)}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {si < sections.length - 1 && <div className="sidebar-divider" />}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && <div className="sidebar-group-label">Conta</div>}
        <button className="sidebar-item" onClick={onSignOut} title="Sair">
          <LogOut className="sidebar-item-icon" size={18} strokeWidth={1.75} />
          {!collapsed && <span className="sidebar-item-label">Sair</span>}
        </button>

        <div className="sidebar-divider" />

        <div className="sidebar-account">
          <div className="sidebar-avatar">{initialsOf(userEmail)}</div>
          {!collapsed && (
            <div className="sidebar-account-info">
              <div className="sidebar-account-email" title={userEmail}>{usernameOf(userEmail)}</div>
              <div className="sidebar-account-cargo">{cargoOf(userEmail)}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
