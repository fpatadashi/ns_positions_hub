// "UserName" — variável global do sistema: o texto antes do @ no e-mail de
// login (ex.: "emerson.nakamura" de "emerson.nakamura@nstech.com.br"). Só uma
// função pura, sem estado — qualquer módulo pode importar e usar sem passar
// por contexto nenhum, e nada precisa mudar se o e-mail mudar de domínio.
// Usada onde a tela mostra "quem fez" uma ação sem precisar expor o e-mail
// inteiro (reserva de vaga, rodapé do menu, histórico de movimentação).
export function usernameOf(email) {
  if (!email) return '';
  return String(email).split('@')[0];
}
