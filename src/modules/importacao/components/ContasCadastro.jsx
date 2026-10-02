import EditableFlatTable from './EditableFlatTable';

const BASE_COLUMNS = [
  { key: 'email', label: 'EMAIL' },
  { key: 'cargo', label: 'CARGO' }
];

// Contas — e-mails de quem usa o app + cargo/role (Fase 14). Mesmo formato
// de tabela editável da Estrutura. Não tem ligação com a tela de permissões
// de verdade ainda (src/shared/permissions.js continua com a regra fixa) —
// é só o cadastro por enquanto.
export default function ContasCadastro({ items, onDelete, cadastro }) {
  return (
    <EditableFlatTable
      table="contas"
      title="Contas"
      description="Uma linha por conta de acesso ao app (e-mail + cargo). Ao importar um Excel com uma coluna que ainda não existe aqui, o app avisa e cria a coluna antes de importar os dados."
      baseColumns={BASE_COLUMNS}
      items={items}
      onDelete={onDelete}
      cadastro={cadastro}
      strongKey="email"
      exportFilename="Configuracoes_Cadastros_Contas.xlsx"
    />
  );
}
