import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import CadastroTable from './CadastroTable';
import RelacaoCadastro from './RelacaoCadastro';
import PessoaCadastro from './PessoaCadastro';

const ICON_OPTIONS = [
  { title: 'Atual — Cadeira executiva', symbol: 'chair-icon' },
  { title: 'Opção 1 — Silhueta arredondada', symbol: 'chair-icon-rounded' },
  { title: 'Opção 2 — Planta baixa (vista de cima)', symbol: 'chair-icon-plan' },
  { title: 'Opção 3 — Contorno minimalista', symbol: 'chair-icon-outline' }
];

// Módulos do Configuração — cada card abre sua própria Tela, isolada das
// demais (mexer numa não impacta as outras nem as abas Estrutura/Dashboard).
const MODULOS = [
  { key: 'icones', label: 'Ícones', icon: '🪑', bg: '#FDECEA' },
  { key: 'bu', label: 'BU', icon: '🏢', bg: '#E8ECFB' },
  { key: 'torre', label: 'Torre', icon: '🗼', bg: '#E9F5EC' },
  { key: 'empresa', label: 'Empresa', icon: '🏭', bg: '#FCEFE0' },
  { key: 'relacao', label: 'Relação BU/Torre/Empresa', icon: '🔗', bg: '#EFE8FB' },
  { key: 'disciplina', label: 'Disciplinas', icon: '📚', bg: '#E3F3FA' },
  { key: 'clevel', label: 'C-Level', icon: '👔', bg: '#F5EDE3' },
  { key: 'nivelComplexidade', label: 'Nível de Complexidade', icon: '📊', bg: '#EAF6EF' },
  { key: 'pessoa', label: 'Pessoas', icon: '👤', bg: '#FCE9EF' },
  { key: 'centroCusto', label: 'Centros de Custo', icon: '💰', bg: '#FBF3D9' }
];

function IconesTela() {
  return (
    <div className="rules" style={{ maxWidth: 920 }}>
      <h2>Escolha um ícone de cadeira</h2>
      <p>
        Três opções novas de estilo, mais o ícone atual para comparar. Passe o mouse sobre qualquer cadeira abaixo —
        ela fica laranja, igual ao comportamento real na Estrutura.
      </p>

      <div className="icon-gallery">
        {ICON_OPTIONS.map((opt) => (
          <div className="icon-option" key={opt.symbol}>
            <h3>{opt.title}</h3>
            <div className="icon-option-row">
              <div className="chair-card status-vaga">
                <span className="status-badge">Disponível</span>
                <div className="icon"><svg><use href={'#' + opt.symbol} /></svg></div>
                <div className="cid">Vaga</div>
              </div>
              <div className="chair-card status-ocupada">
                <span className="status-badge">Ocupada</span>
                <div className="icon"><svg><use href={'#' + opt.symbol} /></svg></div>
                <div className="cid">Ocupada</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConfiguracaoTab() {
  const [tela, setTela] = useState(null);
  const {
    buList, torreList, empresaList, relacaoBte,
    disciplinaList, clevelList, nivelComplexidadeList, pessoaList, centroCustoList,
    buCadastro, torreCadastro, empresaCadastro, relacaoBteCadastro,
    disciplinaCadastro, clevelCadastro, nivelComplexidadeCadastro, pessoaCadastro, centroCustoCadastro
  } = useAppData();

  if (tela === null) {
    return (
      <div>
        <div className="modulos-header">
          <h2>Módulos</h2>
          <p>Cada módulo abre suas próprias telas de cadastro.</p>
        </div>
        <div className="modulos-grid">
          {MODULOS.map((m) => (
            <button key={m.key} className="modulo-card" onClick={() => setTela(m.key)}>
              <div className="modulo-icon" style={{ background: m.bg }}>{m.icon}</div>
              <div className="modulo-label">{m.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const atual = MODULOS.find((m) => m.key === tela);

  return (
    <div>
      <button className="modulo-back" onClick={() => setTela(null)}>← Módulos</button>

      {tela === 'icones' && <IconesTela />}

      {tela === 'bu' && (
        <CadastroTable
          title="Cadastro de BU"
          items={buList}
          onUpsert={buCadastro.upsert}
          onDelete={buCadastro.remove}
          onImportRows={buCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_BU.xlsx"
        />
      )}

      {tela === 'torre' && (
        <CadastroTable
          title="Cadastro de Torre"
          items={torreList}
          onUpsert={torreCadastro.upsert}
          onDelete={torreCadastro.remove}
          onImportRows={torreCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Torre.xlsx"
        />
      )}

      {tela === 'empresa' && (
        <CadastroTable
          title="Cadastro de Empresa"
          items={empresaList}
          onUpsert={empresaCadastro.upsert}
          onDelete={empresaCadastro.remove}
          onImportRows={empresaCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Empresa.xlsx"
        />
      )}

      {tela === 'relacao' && (
        <RelacaoCadastro
          items={relacaoBte}
          onImportRows={relacaoBteCadastro.importRows}
          onDelete={relacaoBteCadastro.remove}
        />
      )}

      {tela === 'disciplina' && (
        <CadastroTable
          title="Cadastro de Disciplinas"
          items={disciplinaList}
          onUpsert={disciplinaCadastro.upsert}
          onDelete={disciplinaCadastro.remove}
          onImportRows={disciplinaCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Disciplina.xlsx"
        />
      )}

      {tela === 'clevel' && (
        <CadastroTable
          title="Cadastro de C-Level"
          items={clevelList}
          onUpsert={clevelCadastro.upsert}
          onDelete={clevelCadastro.remove}
          onImportRows={clevelCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_CLevel.xlsx"
        />
      )}

      {tela === 'nivelComplexidade' && (
        <CadastroTable
          title="Cadastro de Nível de Complexidade"
          items={nivelComplexidadeList}
          onUpsert={nivelComplexidadeCadastro.upsert}
          onDelete={nivelComplexidadeCadastro.remove}
          onImportRows={nivelComplexidadeCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_NivelComplexidade.xlsx"
        />
      )}

      {tela === 'pessoa' && (
        <PessoaCadastro
          items={pessoaList}
          onImportRows={pessoaCadastro.importRows}
          onDelete={pessoaCadastro.remove}
        />
      )}

      {tela === 'centroCusto' && (
        <CadastroTable
          title="Cadastro de Centros de Custo"
          items={centroCustoList}
          onUpsert={centroCustoCadastro.upsert}
          onDelete={centroCustoCadastro.remove}
          onImportRows={centroCustoCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_CentroCusto.xlsx"
        />
      )}

      {!atual && <p style={{ color: 'var(--text-faint)' }}>Tela não encontrada.</p>}
    </div>
  );
}
