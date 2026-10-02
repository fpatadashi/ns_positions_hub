import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Building2, BookOpen, LayoutDashboard, ArrowLeftRight, Upload, Settings, Hash } from 'lucide-react';
import Sidebar from './Sidebar';
import RegrasTab from '../components/RegrasTab';
import MovimentacoesTab from '../components/MovimentacoesTab';
import PositionsPage from '../modules/positions/PositionsPage';
import DashboardPage from '../modules/dashboard/DashboardPage';
import CadastrosPage from '../modules/importacao/CadastrosPage';
import GestaoDocumentosPage from '../modules/importacao/GestaoDocumentosPage';
import IdBudgetPage from '../modules/idmanagement/IdBudgetPage';
import BasePessoasPage from '../modules/idmanagement/BasePessoasPage';
import './sidebar.css';

const MENU_SECTIONS = [
  {
    label: 'Position Hub',
    items: [
      { key: 'positions', label: 'Positions', icon: Building2 },
      { key: 'regras', label: 'Regras', icon: BookOpen },
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'movimentacoes', label: 'Movimentações', icon: ArrowLeftRight }
    ]
  },
  {
    label: 'Budget People Sync',
    items: [
      {
        key: 'gerenciamento-id',
        label: "Gerenciamento de ID's",
        icon: Hash,
        children: [
          { key: 'gerenciamento-id-budget', label: 'ID para Budget' },
          { key: 'gerenciamento-id-pessoas', label: 'Base de Pessoas' }
        ]
      }
    ]
  },
  {
    label: 'Configs',
    items: [
      {
        key: 'importacao',
        label: 'Importação',
        icon: Upload,
        children: [
          { key: 'importacao-documentos', label: 'Gestão de Documentos' }
        ]
      },
      {
        key: 'configuracao-group',
        label: 'Configuração',
        icon: Settings,
        children: [
          { key: 'importacao-cadastros', label: 'Cadastros' }
        ]
      }
    ]
  }
];

export default function AppShell({ session }) {
  const [activeKey, setActiveKey] = useState('positions');
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());

  function toggleExpand(key) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div className="app-shell">
      <Sidebar
        sections={MENU_SECTIONS}
        active={activeKey}
        onChange={setActiveKey}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        userEmail={session.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />
      <main className="main-content">
        {activeKey === 'positions' && <PositionsPage />}
        {activeKey === 'regras' && <RegrasTab />}
        {activeKey === 'dashboard' && <DashboardPage />}
        {activeKey === 'movimentacoes' && <MovimentacoesTab />}
        {activeKey === 'importacao-cadastros' && <CadastrosPage />}
        {activeKey === 'importacao-documentos' && <GestaoDocumentosPage />}
        {activeKey === 'gerenciamento-id-budget' && <IdBudgetPage />}
        {activeKey === 'gerenciamento-id-pessoas' && <BasePessoasPage />}
      </main>
    </div>
  );
}
