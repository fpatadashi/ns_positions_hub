// Fonte única dos caminhos de imagem do projeto (tudo que mora em /public) —
// muda aqui, não espalhado pelo código. Cada export diz onde é usado.
//
// `?v=N` força o navegador a buscar o arquivo de novo quando ele é
// substituído — arquivos em /public são servidos como estão, sem hash de
// conteúdo no nome (diferente dos assets importados pelo bundler). Sempre
// que trocar um desses arquivos em /public, suba o número correspondente
// aqui.
//
// ATENÇÃO: o favicon é referenciado em index.html (<link rel="icon">), que
// não importa JS — se mudar LOGO_FAVICON_VERSION aqui, atualize o `?v=` do
// index.html manualmente também.

export const LOGO_FAVICON_VERSION = 6;
export const LOGO_SIDEBAR_MARK_VERSION = 7;
export const LOGO_LOGIN_WORDMARK_VERSION = 9;
export const LOGIN_CARD_BG_VERSION = 3;

// Favicon (aba do navegador) — referenciado em index.html, não neste módulo.
export const LOGO_FAVICON_PATH = `/logo.png?v=${LOGO_FAVICON_VERSION}`;

// Ícone no topo do menu lateral — src/layout/Sidebar.jsx
export const LOGO_SIDEBAR_MARK_PATH = `/logo-mark.png?v=${LOGO_SIDEBAR_MARK_VERSION}`;

// Logo grande na tela de login — src/components/LoginPage.jsx
export const LOGO_LOGIN_WORDMARK_PATH = `/logo-wordmark.png?v=${LOGO_LOGIN_WORDMARK_VERSION}`;

// Fundo (imagem) do card branco da tela de login — src/components/LoginPage.jsx
export const LOGIN_CARD_BG_PATH = `/login-bg.png?v=${LOGIN_CARD_BG_VERSION}`;
