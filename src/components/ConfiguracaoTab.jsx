const ICON_OPTIONS = [
  { title: 'Atual — Cadeira executiva', symbol: 'chair-icon' },
  { title: 'Opção 1 — Silhueta arredondada', symbol: 'chair-icon-rounded' },
  { title: 'Opção 2 — Planta baixa (vista de cima)', symbol: 'chair-icon-plan' },
  { title: 'Opção 3 — Contorno minimalista', symbol: 'chair-icon-outline' }
];

export default function ConfiguracaoTab() {
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
