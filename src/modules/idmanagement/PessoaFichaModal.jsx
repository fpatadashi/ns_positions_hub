import Modal from '../../components/modals/Modal';
import { fmtDateOnly } from '../../shared/lib/format';

function Field({ label, value }) {
  return (
    <div className="ficha-field">
      <span>{label}</span>
      <b>{value || 'Não informado'}</b>
    </div>
  );
}

export default function PessoaFichaModal({ pessoa, onClose }) {
  if (!pessoa) return null;
  return (
    <Modal onClose={onClose} wide>
      <h3 style={{ marginBottom: 2 }}>{pessoa.nome}</h3>
      <p className="modal-sub" style={{ marginTop: 0 }}>
        {pessoa.bu || 'Sem BU'} — {pessoa.torre || 'Sem torre'}
      </p>

      <div className="ficha-grid">
        <Field label="ID_Position" value={pessoa.id_position} />
        <Field label="Status ID" value={pessoa.id_position_status === 'ok' ? 'Ok' : 'Revisar'} />
        <Field label="ID da Posição (antigo)" value={pessoa.id_da_posicao} />
        <Field label="Status" value={pessoa.status} />
        <Field label="Status Ajustado" value={pessoa.status_ajustado} />
        <Field label="Cargo" value={pessoa.cargo_real} />
        <Field label="Nível Complexidade" value={pessoa.nivel_complexidade} />
        <Field label="CBO" value={pessoa.cbo} />
        <Field label="Disciplina" value={pessoa.disciplina} />
        <Field label="Área Sistema" value={pessoa.area_sistema} />
        <Field label="Departamento" value={pessoa.departamento} />
        <Field label="Centro de Custo" value={pessoa.centro_custo_descricao ? pessoa.centro_custo_cod + ' — ' + pessoa.centro_custo_descricao : null} />
        <Field label="Squad" value={pessoa.squad} />
        <Field label="Produto" value={pessoa.produto} />
        <Field label="Modalidade" value={pessoa.modalidade} />
        <Field label="Dedicado/Compartilhado" value={pessoa.dedicado_compartilhado} />
        <Field label="C-Level" value={pessoa.c_level} />
        <Field label="Grupo" value={pessoa.grupo} />
        <Field label="Relação" value={pessoa.relacao} />
        <Field label="Matrícula" value={pessoa.matricula} />
        <Field label="CPF" value={pessoa.cpf} />
        <Field label="Email" value={pessoa.email} />
        <Field label="Gestor Imediato" value={pessoa.gestor_imediato} />
        <Field label="Empresa CNPJ" value={pessoa.empresa_cnpj} />
        <Field label="Cód. Empresa" value={pessoa.cod_emp} />
        <Field label="Cód. Filial" value={pessoa.cod_filial} />
        <Field label="Gênero" value={pessoa.genero} />
        <Field label="PCD" value={pessoa.pcd} />
        <Field label="Data Nascimento" value={fmtDateOnly(pessoa.data_nascimento)} />
        <Field label="Data Admissão" value={fmtDateOnly(pessoa.data_admissao)} />
        <Field label="Data Demissão" value={fmtDateOnly(pessoa.data_demissao)} />
        <Field label="Data Afastamento" value={fmtDateOnly(pessoa.data_afastamento)} />
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
