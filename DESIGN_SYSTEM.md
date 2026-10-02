# NS Position Hub — Design System (referência de estilo visual)

Este arquivo descreve **só o estilo visual** (cores, tipografia, botões, cards, inputs, tabelas, layout) usado no projeto NS Position Hub, pra outro projeto/dev/IA aplicar o mesmo visual sem precisar copiar a aplicação inteira. Não inclui nenhuma lógica de negócio — só CSS puro e a explicação de quando usar cada coisa.

## 1. Princípio da paleta

Baseado na identidade da nstech: **laranja é ação, navy é estrutura, branco é interface, cinza é organização.**

- **Laranja** → só em elementos de ação/destaque: botão primário, item de menu ativo, foco de campo, links. Evite usar em áreas grandes de fundo.
- **Navy** → estrutura: títulos, textos de navegação, cabeçalhos, alguns badges de destaque (ex. botão "dourado"/promover).
- **Branco** → toda superfície de interface: cards, modais, inputs, sidebar.
- **Cinza** → organização: fundo geral da página, bordas, divisores, texto secundário/terciário.

## 2. Tokens de cor (variáveis CSS)

Cole isso no `:root` do projeto de destino:

```css
:root{
  --bg: #F4F6F7;              /* fundo geral da página */
  --surface: #FFFFFF;          /* cards, modais, inputs */
  --surface-raised: #E5E9EC;   /* fundo secundário (hover, painéis leves) */
  --surface-line: #E5E9EC;     /* bordas e divisores discretos */
  --input-border: #D9E0E5;     /* borda específica de input */

  --text: #0A1E3F;             /* títulos, texto forte */
  --text-dim: #44515C;         /* texto de corpo */
  --text-faint: #66727C;       /* labels, texto auxiliar */
  --navy: #172B3A;             /* tom escuro alternativo (badges, avatar, botão "gold") */

  --accent: #FF5A00;           /* laranja primário — ação */
  --accent-light: #FF8A3D;     /* laranja claro — hover suave, detalhes */
  --accent-dim: #E84300;       /* laranja escuro — hover de botão primário */

  --danger: #DC2626;           /* ações destrutivas */

  color-scheme: light;
}
```

**Bordas de botão/componentes que usam um cinza mais visível** (não cabem numa variável de fundo): `#B8C0C6` — usado especificamente na borda do botão secundário.

## 3. Base e tipografia

```css
*{ box-sizing: border-box; }

html, body{
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1{
  font-size: clamp(1.9rem, 4.4vw, 2.9rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}
h1 span{ color: var(--accent); } /* pra destacar uma palavra do título, ex. "Position <span>Hub</span>" */
```

Fundo de página opcional com leve brilho laranja no topo (usado nas telas principais do app):

```css
body{
  background:
    radial-gradient(ellipse 900px 500px at 50% -10%, rgba(255,90,0,0.05), transparent 60%),
    var(--bg);
}
```

## 4. Botões

```css
button.btn-primary, button.btn-secondary, button.btn-danger, button.btn-gold{
  appearance: none;
  border: none;
  border-radius: 10px;
  padding: 11px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: filter .15s ease, opacity .15s ease, background .15s ease;
}

/* Primário — ação principal da tela (Salvar, Confirmar, Entrar...) */
button.btn-primary{ background: var(--accent); color: #FFFFFF; }
button.btn-primary:hover{ background: var(--accent-dim); }
button.btn-primary:disabled{ opacity: 0.35; cursor: not-allowed; }

/* Secundário — ação alternativa/neutra (Cancelar, Fechar...) */
button.btn-secondary{ background: var(--surface); color: var(--text-dim); border: 1px solid #B8C0C6; }
button.btn-secondary:hover{ color: var(--text); border-color: var(--text-dim); }
button.btn-secondary:disabled{ opacity: 0.35; cursor: not-allowed; }

/* Perigo — ação destrutiva (Excluir, Demitir...) */
button.btn-danger{ background: transparent; color: var(--danger); border: 1px solid var(--danger); }
button.btn-danger:hover{ background: rgba(220,38,38,0.08); }
button.btn-danger:disabled{ opacity: 0.35; cursor: not-allowed; }

/* "Gold"/destaque alternativo — ação especial que não deve competir com o laranja primário */
button.btn-gold{ background: var(--navy); color: #FFFFFF; }
button.btn-gold:hover{ filter: brightness(1.25); }
button.btn-gold:disabled{ opacity: 0.35; cursor: not-allowed; }

/* Link — ação leve dentro de linha de tabela/lista (ex. "Remover") */
.btn-link{
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
}
```

## 5. Inputs e selects

```css
input[type="text"], input[type="number"], input[type="email"],
input[type="password"], input[type="date"], select{
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--input-border);
  color: var(--text);
  border-radius: 8px;
  padding: 9px 11px;
  font-size: 0.85rem;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
}

input:focus, select:focus{ outline: 1px solid var(--accent); }

label{
  display: block;
  font-size: 0.78rem;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
```

## 6. Cards / painéis

```css
.card{
  background: var(--surface);
  border: 1px solid var(--surface-line);
  border-radius: 18px;
  padding: 22px;
}

.card h2{
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-faint);
}
```

Regra geral de `border-radius` no projeto: **18px** em cards/painéis grandes, **10px** em botões, **8px** em inputs, **999px** (pill) em badges/tags/status.

## 7. Modais

```css
.modal-overlay{
  position: fixed;
  inset: 0;
  background: rgba(32,36,45,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-box{
  background: var(--surface);
  border: 1px solid var(--surface-line);
  border-radius: 16px;
  padding: 26px;
  max-width: 520px; /* 760px pra modais mais largos, ex. formulários com mais campos */
  width: 100%;
  max-height: 86vh;
  overflow-y: auto;
}

.modal-box h3{ margin: 0 0 6px; font-size: 1.1rem; }
.modal-sub{ color: var(--text-dim); font-size: 0.85rem; margin: 0 0 18px; }

.modal-actions{
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
```

## 8. Badges / tags / status pill

```css
.status-pill{
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 9px;
  border-radius: 999px;
}

.tag{
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
```

Cor de fundo/texto de cada badge é sempre um par **tom pastel de fundo (opacidade ~0.08–0.20) + a mesma cor sólida no texto**, por exemplo:

```css
.tag-laranja{ background: rgba(255,90,0,0.12); color: var(--accent); }
.tag-navy{ background: rgba(23,43,58,0.08); color: var(--navy); }
.tag-perigo{ background: rgba(220,38,38,0.10); color: var(--danger); }
```

## 9. Tabelas

```css
table.data-table{
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

table.data-table th{
  text-align: left;
  padding: 12px 14px;
  color: var(--text-faint);
  text-transform: uppercase;
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--surface-line);
  white-space: nowrap;
}

table.data-table td{
  padding: 11px 14px;
  border-bottom: 1px solid var(--surface-line);
  color: var(--text-dim);
  vertical-align: top;
}

table.data-table tr:last-child td{ border-bottom: none; }
table.data-table td.strong{ color: var(--text); font-weight: 600; }
```

## 10. Layout: sidebar + conteúdo

```css
.app-shell{
  display: flex;
  min-height: 100vh;
  align-items: stretch;
}

.sidebar{
  width: 240px;               /* 68px quando recolhida */
  flex: 0 0 auto;
  background: var(--surface);
  border-right: 1px solid var(--surface-line);
  display: flex;
  flex-direction: column;
  transition: width .15s ease;
}

.sidebar-item{
  appearance: none;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: none;
  color: var(--text-dim);
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.sidebar-item:hover{ background: var(--surface-raised); color: var(--text); }
.sidebar-item.active{ background: var(--accent); color: #FFFFFF; }

.main-content{
  flex: 1;
  min-width: 0;
  padding: 32px 28px 56px;
}
```

## 11. Resumo rápido pra outra IA/dev aplicar

1. Cole os tokens da seção 2 no `:root`.
2. Use `--bg` no `body`, `--surface` em todo card/modal/input, `--text`/`--text-dim`/`--text-faint` em 3 níveis de contraste de texto (nunca invente um 4º tom).
3. **Laranja (`--accent`) só em: botão primário, item ativo de navegação, foco de campo, links.** Não usar como cor de fundo decorativa em áreas grandes.
4. `border-radius`: 18px cards, 10px botões, 8px inputs, 999px pills.
5. Sombras: o projeto praticamente não usa `box-shadow` pesado — prefira borda de 1px (`var(--surface-line)`) a sombra pra separar elementos.
6. Fonte: `"Segoe UI", "Helvetica Neue", Arial, sans-serif` (sem fonte customizada carregada).
