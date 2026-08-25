# NS Position Hub

Sistema de Posições e Cargos Nstech — React + Supabase (Postgres).

## Configuração inicial (uma vez só)

1. Crie uma conta e um projeto gratuito em [supabase.com](https://supabase.com).
2. No painel do projeto, vá em **Settings → API** e copie:
   - **Project URL**
   - **anon public key**
3. Copie `.env.local.example` para `.env.local` e cole os dois valores acima.
4. Vá em **SQL Editor** no painel do Supabase, cole todo o conteúdo de `supabase/migrations/0001_init.sql` e rode. Isso cria as tabelas e já popula as 90 cadeiras iniciais.
5. Vá em **Authentication → Users → Add user** e crie seu usuário (e-mail + senha) — e o de quem mais for usar o app. Não há cadastro público dentro do app por design.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`, faça login com o usuário criado no passo 5.

## Estrutura

- `src/lib/chairActions.js` — todas as regras de negócio (contratar, demitir, promover, mérito, decompor, incorporar, extinguir, aplicar do Bolsão), lendo/escrevendo direto no Supabase.
- `src/context/AppDataContext.jsx` — carrega cadeiras/movimentações/Bolsão do banco e reexpõe para toda a árvore de componentes.
- `src/components/` — telas (Estrutura, Regras, Movimentações, Configuração) e modais de cada ação.
- `supabase/migrations/0001_init.sql` — schema completo + seed. Rode de novo (com `on conflict do nothing`) se precisar recriar o ambiente.

## Limitação conhecida

As validações (teto do Bolsão, conservação de valor) rodam no navegador antes de gravar no banco — suficiente para um time pequeno, mas não impede duas pessoas agindo no mesmo instante sobre a mesma cadeira. Se isso virar um problema real, a próxima etapa é mover essas regras para uma função no Postgres (RPC) chamada via `supabase.rpc(...)`.
