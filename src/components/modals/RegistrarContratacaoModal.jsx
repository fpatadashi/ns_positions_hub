import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../shared/context/AppDataContext';
import { cargoLabel } from '../../shared/data/cargo';
import { fmtBRL } from '../../shared/lib/format';

export default function RegistrarContratacaoModal({ chair, onClose, onDone }) {
  const { registrarContratacao } = useAppData();

  const [tipo, setTipo] = useState('substituicao');
  const [idReferencia, setIdReferencia] = useState(chair.id);
  const [nomePosicao, setNomePosicao] = useState(cargoLabel(chair.cargo));
  const [dataPrevista, setDataPrevista] = useState('');
  const [centroCustoInhire, setCentroCustoInhire] = useState('');
  const [empresaKmm, setEmpresaKmm] = useState('');
  const [filialKmm, setFilialKmm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function handleTipoChange(novoTipo) {
    setTipo(novoTipo);
    setIdReferencia(novoTipo === 'substituicao' ? chair.id : '');
  }

  const valid = idReferencia.trim() && nomePosicao.trim();

  async function handleRegistrar() {
    setBusy(true);
    setError('');
    try {
      await registrarContratacao({
        chair_id: chair.id,
        id_referencia: idReferencia.trim(),
        tipo,
        nome_posicao: nomePosicao.trim(),
        data_prevista: dataPrevista || null,
        centro_custo_inhire: centroCustoInhire.trim() || null,
        empresa_kmm: empresaKmm.trim() || null,
        filial_kmm: filialKmm.trim() || null
      });
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Registrar contratação</h3>
      <div className="modal-preview" style={{ marginBottom: 16 }}>
        Selecionada: <strong>{chair.id}</strong> — {cargoLabel(chair.cargo)} ({fmtBRL(chair.valor)})
      </div>

      <div className="modal-section">
        <label className="modal-label">Tipo</label>
        <div className="radio-row">
          <label>
            <input type="radio" checked={tipo === 'substituicao'} onChange={() => handleTipoChange('substituicao')} /> Substituição
          </label>
          <label>
            <input type="radio" checked={tipo === 'nova_vaga'} onChange={() => handleTipoChange('nova_vaga')} /> Nova vaga
          </label>
        </div>
      </div>

      <div className="modal-section">
        <label className="modal-label">ID</label>
        <input
          type="text"
          value={idReferencia}
          disabled={tipo === 'substituicao'}
          onChange={(e) => setIdReferencia(e.target.value)}
          placeholder={tipo === 'nova_vaga' ? 'Informe o novo ID' : ''}
        />
      </div>

      <div className="modal-section">
        <label className="modal-label">Nome da posição</label>
        <input type="text" value={nomePosicao} onChange={(e) => setNomePosicao(e.target.value)} />
      </div>

      <div className="modal-section">
        <label className="modal-label">Data prevista</label>
        <input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
      </div>

      <div className="modal-section">
        <label className="modal-label">Centro de custo InHire</label>
        <input type="text" value={centroCustoInhire} onChange={(e) => setCentroCustoInhire(e.target.value)} />
      </div>

      <div className="vigencia-row">
        <div className="modal-section" style={{ marginBottom: 0 }}>
          <label className="modal-label">Empresa KMM</label>
          <input type="text" value={empresaKmm} onChange={(e) => setEmpresaKmm(e.target.value)} />
        </div>
        <div className="modal-section" style={{ marginBottom: 0 }}>
          <label className="modal-label">Filial KMM</label>
          <input type="text" value={filialKmm} onChange={(e) => setFilialKmm(e.target.value)} />
        </div>
      </div>

      {error && <div className="modal-error">{error}</div>}

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={handleRegistrar}>{busy ? 'Registrando…' : 'Registrar'}</button>
      </div>
    </Modal>
  );
}
