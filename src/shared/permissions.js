// Cargo/permissão dentro da aplicação — ainda não existe cadastro/tela pra
// isso (fica pra depois); por enquanto é uma regra fixa só pra já aparecer
// algo no rodapé do menu. Único administrador definido é o e-mail abaixo,
// todo o resto cai em "Não definido" até a permissão de verdade existir.
const ADMIN_EMAIL = 'emerson.nakamura@nstech.com.br';

export function cargoOf(email) {
  return email === ADMIN_EMAIL ? 'Administrador' : 'Não definido';
}
