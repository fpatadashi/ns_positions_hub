import { useState } from 'react';
import {
  Building2, KeyRound, Link2, Armchair, BookOpen, Crown, BarChart3, Wallet,
  Star, Activity, Layers, Landmark, Monitor, FileText, Rocket, Package,
  Briefcase, Users, Accessibility, Hash, Shuffle
} from 'lucide-react';
import { useAppData } from '../../shared/context/AppDataContext';
import CadastroTable from './components/CadastroTable';
import EstruturaCadastro from './components/EstruturaCadastro';
import ContasCadastro from './components/ContasCadastro';
import AssociacaoTabelasCadastro from './components/AssociacaoTabelasCadastro';
import ConfiguracaoTab from '../../components/ConfiguracaoTab';
import './importacao.css';

// Central única de import Excel — cada card abre sua própria Tela de
// cadastro, isolada das demais (mexer numa não impacta as outras). Ícones no
// mesmo estilo do menu lateral (lucide-react, linha fina) — cada card mantém
// seu fundo pastel próprio, só o emoji virou ícone consistente com o resto do app.
const MODULOS = [
  { key: 'estrutura', label: 'Estrutura (BU/Torre/Empresa)', icon: Building2, bg: '#E8ECFB' },
  { key: 'contas', label: 'Contas', icon: KeyRound, bg: '#FCE9EF' },
  { key: 'associacaoTabelas', label: 'Associação de Tabelas', icon: Link2, bg: '#E3F3FA' },
  { key: 'icones', label: 'Ícones de Cadeira', icon: Armchair, bg: '#E3F3FA' },
  { key: 'disciplina', label: 'Disciplinas', icon: BookOpen, bg: '#E3F3FA' },
  { key: 'clevel', label: 'C-Level', icon: Crown, bg: '#F5EDE3' },
  { key: 'nivelComplexidade', label: 'Nível de Complexidade', icon: BarChart3, bg: '#EAF6EF' },
  { key: 'centroCusto', label: 'Centros de Custo', icon: Wallet, bg: '#FBF3D9' },
  { key: 'highlight', label: 'Highlights', icon: Star, bg: '#FFF4DE' },
  { key: 'pessoaStatus', label: 'Status', icon: Activity, bg: '#E7F7EE' },
  { key: 'grupo', label: 'Grupo', icon: Layers, bg: '#EFE8FB' },
  { key: 'departamento', label: 'Departamento', icon: Landmark, bg: '#E8ECFB' },
  { key: 'areaSistema', label: 'Área Sistema', icon: Monitor, bg: '#E3F3FA' },
  { key: 'modalidade', label: 'Modalidade', icon: FileText, bg: '#FCEFE0' },
  { key: 'squad', label: 'Squad', icon: Rocket, bg: '#E9F5EC' },
  { key: 'produto', label: 'Produto', icon: Package, bg: '#FBF3D9' },
  { key: 'cargoReal', label: 'Cargo (real)', icon: Briefcase, bg: '#F5EDE3' },
  { key: 'genero', label: 'Gênero', icon: Users, bg: '#FCE9EF' },
  { key: 'pcd', label: 'PCD', icon: Accessibility, bg: '#EAF6EF' },
  { key: 'cbo', label: 'CBO', icon: Hash, bg: '#EFE8FB' },
  { key: 'dedicadoCompartilhado', label: 'Dedicado/Compartilhado', icon: Shuffle, bg: '#E8ECFB' }
];

export default function CadastrosPage() {
  const [tela, setTela] = useState(null);
  const {
    estruturaList, contasList, associacaoTabelasList,
    disciplinaList, clevelList, nivelComplexidadeList, centroCustoList, highlightList,
    estruturaCadastro, contasCadastro, associacaoTabelasCadastro,
    disciplinaCadastro, clevelCadastro, nivelComplexidadeCadastro, centroCustoCadastro, highlightCadastro,
    pessoaStatusList, grupoList, departamentoList, areaSistemaList, modalidadeList, squadList,
    produtoList, cargoRealList, generoList, pcdList, cboList, dedicadoCompartilhadoList,
    pessoaStatusCadastro, grupoCadastro, departamentoCadastro, areaSistemaCadastro, modalidadeCadastro, squadCadastro,
    produtoCadastro, cargoRealCadastro, generoCadastro, pcdCadastro, cboCadastro, dedicadoCompartilhadoCadastro
  } = useAppData();

  if (tela === null) {
    return (
      <div>
        <div className="modulos-header">
          <h2>Cadastros</h2>
          <p>Central única de import/export Excel dos cadastros do NS Position Hub.</p>
        </div>
        <div className="modulos-grid">
          {MODULOS.map((m) => {
            const Icon = m.icon;
            return (
              <button key={m.key} className="modulo-card" onClick={() => setTela(m.key)}>
                <div className="modulo-icon" style={{ background: m.bg }}>
                  <Icon size={22} strokeWidth={1.75} color="var(--navy)" />
                </div>
                <div className="modulo-label">{m.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="modulo-back" onClick={() => setTela(null)}>← Cadastros</button>

      {tela === 'estrutura' && (
        <EstruturaCadastro
          items={estruturaList}
          onDelete={estruturaCadastro.remove}
          cadastro={estruturaCadastro}
        />
      )}

      {tela === 'associacaoTabelas' && (
        <AssociacaoTabelasCadastro items={associacaoTabelasList} cadastro={associacaoTabelasCadastro} />
      )}

      {tela === 'icones' && <ConfiguracaoTab />}

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

      {tela === 'contas' && (
        <ContasCadastro
          items={contasList}
          onDelete={contasCadastro.remove}
          cadastro={contasCadastro}
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

      {tela === 'highlight' && (
        <CadastroTable
          title="Cadastro de Highlights"
          items={highlightList}
          onUpsert={highlightCadastro.upsert}
          onDelete={highlightCadastro.remove}
          onImportRows={highlightCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Highlight.xlsx"
          nomeLabel="Tipo de ocorrência"
          codigoLabel="Ícone (emoji)"
        />
      )}

      {tela === 'pessoaStatus' && (
        <CadastroTable
          title="Cadastro de Status"
          items={pessoaStatusList}
          onUpsert={pessoaStatusCadastro.upsert}
          onDelete={pessoaStatusCadastro.remove}
          onImportRows={pessoaStatusCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Status.xlsx"
        />
      )}

      {tela === 'grupo' && (
        <CadastroTable
          title="Cadastro de Grupo"
          items={grupoList}
          onUpsert={grupoCadastro.upsert}
          onDelete={grupoCadastro.remove}
          onImportRows={grupoCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Grupo.xlsx"
        />
      )}

      {tela === 'departamento' && (
        <CadastroTable
          title="Cadastro de Departamento"
          items={departamentoList}
          onUpsert={departamentoCadastro.upsert}
          onDelete={departamentoCadastro.remove}
          onImportRows={departamentoCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Departamento.xlsx"
        />
      )}

      {tela === 'areaSistema' && (
        <CadastroTable
          title="Cadastro de Área Sistema"
          items={areaSistemaList}
          onUpsert={areaSistemaCadastro.upsert}
          onDelete={areaSistemaCadastro.remove}
          onImportRows={areaSistemaCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_AreaSistema.xlsx"
        />
      )}

      {tela === 'modalidade' && (
        <CadastroTable
          title="Cadastro de Modalidade"
          items={modalidadeList}
          onUpsert={modalidadeCadastro.upsert}
          onDelete={modalidadeCadastro.remove}
          onImportRows={modalidadeCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Modalidade.xlsx"
        />
      )}

      {tela === 'squad' && (
        <CadastroTable
          title="Cadastro de Squad"
          items={squadList}
          onUpsert={squadCadastro.upsert}
          onDelete={squadCadastro.remove}
          onImportRows={squadCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Squad.xlsx"
        />
      )}

      {tela === 'produto' && (
        <CadastroTable
          title="Cadastro de Produto"
          items={produtoList}
          onUpsert={produtoCadastro.upsert}
          onDelete={produtoCadastro.remove}
          onImportRows={produtoCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Produto.xlsx"
        />
      )}

      {tela === 'cargoReal' && (
        <CadastroTable
          title="Cadastro de Cargo (real)"
          items={cargoRealList}
          onUpsert={cargoRealCadastro.upsert}
          onDelete={cargoRealCadastro.remove}
          onImportRows={cargoRealCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_CargoReal.xlsx"
        />
      )}

      {tela === 'genero' && (
        <CadastroTable
          title="Cadastro de Gênero"
          items={generoList}
          onUpsert={generoCadastro.upsert}
          onDelete={generoCadastro.remove}
          onImportRows={generoCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_Genero.xlsx"
        />
      )}

      {tela === 'pcd' && (
        <CadastroTable
          title="Cadastro de PCD"
          items={pcdList}
          onUpsert={pcdCadastro.upsert}
          onDelete={pcdCadastro.remove}
          onImportRows={pcdCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_PCD.xlsx"
        />
      )}

      {tela === 'cbo' && (
        <CadastroTable
          title="Cadastro de CBO"
          items={cboList}
          onUpsert={cboCadastro.upsert}
          onDelete={cboCadastro.remove}
          onImportRows={cboCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_CBO.xlsx"
        />
      )}

      {tela === 'dedicadoCompartilhado' && (
        <CadastroTable
          title="Cadastro de Dedicado/Compartilhado"
          items={dedicadoCompartilhadoList}
          onUpsert={dedicadoCompartilhadoCadastro.upsert}
          onDelete={dedicadoCompartilhadoCadastro.remove}
          onImportRows={dedicadoCompartilhadoCadastro.importRows}
          exportFilename="Configuracoes_Cadastros_DedicadoCompartilhado.xlsx"
        />
      )}
    </div>
  );
}
