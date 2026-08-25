import { useState } from 'react';
import { AppDataProvider } from '../context/AppDataContext';
import { supabase } from '../supabaseClient';
import ChairIcons from '../icons/ChairIcons';
import NavTabs from './NavTabs';
import EstruturaTab from './EstruturaTab';
import RegrasTab from './RegrasTab';
import MovimentacoesTab from './MovimentacoesTab';
import ConfiguracaoTab from './ConfiguracaoTab';

const TABS = [
  { key: 'estrutura', label: 'Estrutura' },
  { key: 'regras', label: 'Regras' },
  { key: 'movimentacoes', label: 'Movimentações' },
  { key: 'configuracao', label: 'Configuração' }
];

export default function MainApp({ session }) {
  const [activeTab, setActiveTab] = useState('estrutura');

  return (
    <AppDataProvider>
      <ChairIcons />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="app-header-actions">
          <span className="session-email">{session.user.email}</span>
          <button className="btn-secondary" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>

        <header className="hero">
          <div className="eyebrow">Nstech</div>
          <h1>NS Position <span>Hub</span></h1>
          <p className="tagline">Sistema de Posições e Cargos Nstech — contratações, méritos, desligamentos, decomposição e incorporações de cadeiras.</p>
        </header>

        <NavTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'estrutura' && <EstruturaTab />}
        {activeTab === 'regras' && <RegrasTab />}
        {activeTab === 'movimentacoes' && <MovimentacoesTab />}
        {activeTab === 'configuracao' && <ConfiguracaoTab />}
      </div>
    </AppDataProvider>
  );
}
