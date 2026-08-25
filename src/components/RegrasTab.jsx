import { useAppData } from '../context/AppDataContext';
import { fmtBRL } from '../lib/format';

export default function RegrasTab() {
  const { budgetTotal } = useAppData();

  return (
    <div className="rules">
      <h2>Como funciona a simulação</h2>
      <p>
        O NS Position Hub representa a estrutura de posições e cargos da Nstech como <strong>cadeiras</strong>: cada
        cadeira é uma posição com um <strong>ID único</strong>, pertence a uma <strong>torre</strong> (Corporate,
        Embarcador ou PSL) e tem um <strong>cargo</strong> (Aprendiz, Júnior, Analista, Gerente ou C-Level) associado
        a um valor de budget mensal.
      </p>

      <h3>Estados de uma cadeira</h3>
      <ul>
        <li><strong>Ocupada</strong> — tem uma pessoa alocada.</li>
        <li><strong>Vaga</strong> — existe, tem valor reservado, mas ninguém está alocado.</li>
        <li><strong>Extinta</strong> — deixou de existir; seu valor foi redistribuído para outras cadeiras e/ou para o Bolsão.</li>
      </ul>

      <h3>Ações sobre cadeiras ocupadas</h3>
      <ul>
        <li><strong>Demitir</strong> — a pessoa sai, a cadeira volta a ficar <strong>vaga</strong> mantendo o mesmo valor.</li>
        <li><strong>Promover</strong> — o cargo sobe de nível; a diferença de valor entre o cargo atual e o novo é financiada pelo <strong>Bolsão</strong>.</li>
        <li><strong>Aumento de mérito</strong> — o valor da cadeira aumenta sem trocar de cargo; também financiado pelo <strong>Bolsão</strong>.</li>
      </ul>
      <p><em>Uma cadeira ocupada só pode ser extinta depois de uma demissão — ou seja, primeiro ela precisa se tornar vaga.</em></p>

      <h3>Ações sobre cadeiras vagas</h3>
      <ul>
        <li><strong>Contratar</strong> — uma pessoa assume a posição e a cadeira passa a <strong>ocupada</strong>.</li>
        <li><strong>Permanecer vaga</strong> — ao longo do ano, uma vaga pode simplesmente não ser preenchida; não é preciso nenhuma ação.</li>
        <li><strong>Decompor</strong> — move um valor à sua escolha desta cadeira para <strong>criar uma nova vaga</strong> ou para <strong>aumentar outra cadeira vaga já existente</strong>. Se o valor movido for igual ao valor total da cadeira, ela é extinta; caso contrário, ela continua vaga com o valor restante.</li>
        <li><strong>Incorporar</strong> — a mesma mecânica do Decompor, mas partindo de uma escolha livre: você seleciona a <strong>vaga a incorporar</strong> (origem), o <strong>valor a incorporar</strong> e a vaga de <strong>destino</strong> — que pode ser recém-criada ou já existente.</li>
        <li><strong>Extinguir</strong> — remove a cadeira e envia 100% do seu valor para o Bolsão, sem precisar criar ou aumentar outra vaga.</li>
      </ul>

      <div className="example">
        <strong>Exemplo:</strong> a cadeira COR-06 tem R$ 3.500. Ao decompor R$ 1.500 para uma nova vaga de Júnior em
        Embarcador, COR-06 passa a ter R$ 2.000 e continua vaga; a nova cadeira nasce com R$ 1.500. Se em vez disso
        os R$ 3.500 inteiros fossem movidos, COR-06 seria extinta.
      </div>

      <h3>O Bolsão</h3>
      <p>
        O Bolsão é uma reserva de valor que não pertence a nenhuma cadeira. Ele recebe o valor de cadeiras{' '}
        <strong>extintas</strong>, e pode ser aplicado depois para <strong>financiar mérito</strong> ou{' '}
        <strong>promoções</strong> em cadeiras ocupadas, ou para <strong>criar uma nova vaga</strong>.
      </p>
      <p>
        <strong>Regra de limite:</strong> o saldo do Bolsão nunca pode ultrapassar <strong>50% do Budget Total</strong>{' '}
        (a soma de todas as cadeiras da empresa). Se uma operação faria o Bolsão passar desse teto, ela é bloqueada
        até que o valor seja redistribuído de outra forma.
      </p>

      <h3>Budget Total — conservação de valor</h3>
      <p>
        O Budget Total é fixado no início da simulação e nunca muda: <strong>{fmtBRL(budgetTotal)}</strong>. Toda
        ação apenas redistribui esse valor entre cadeiras e o Bolsão — nada é criado nem destruído. Por isso, a todo
        momento: <em>valor alocado em cadeiras + saldo do Bolsão = Budget Total</em>.
      </p>

      <h3>Estrutura inicial</h3>
      <p>
        A simulação começa com <strong>30 cadeiras em cada torre</strong> — <strong>Corporate</strong>,{' '}
        <strong>Embarcador</strong> e <strong>PSL</strong> — totalizando 90 cadeiras, cobrindo os 5 níveis de cargo
        (Aprendiz, Júnior, Analista, Gerente, C-Level) em formato de pirâmide. Um pequeno grupo de cadeiras já nasce{' '}
        <strong>ocupado</strong>; a maioria nasce <strong>vaga</strong>, disponível para simular contratações,
        decomposições e incorporações. Cada torre tem sua própria sub-aba na tela Estrutura.
      </p>
    </div>
  );
}
