// Log de erros do app inteiro — guardado no navegador (localStorage), pra
// sobreviver a um F5. Qualquer catch(e) no código pode chamar logError(e,
// contexto) pra registrar; window.onerror/unhandledrejection já pegam o que
// escapa sem passar por um catch explícito. O ErrorLogWidget (ícone no canto
// da tela) lê daqui e deixa copiar tudo formatado pra colar numa IA.
const STORAGE_KEY = 'ns-position-hub:error-log';
const MAX_ENTRIES = 200;

let entries = loadEntries();
const listeners = new Set();

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage indisponível — log só fica em memória até recarregar.
  }
}

function notify() {
  listeners.forEach((fn) => fn(entries));
}

export function logError(error, context) {
  const message = (error && error.message) || String(error ?? 'Erro desconhecido');
  const stack = (error && error.stack) || new Error().stack;
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    time: new Date().toISOString(),
    message,
    code: (error && error.code) || null,
    details: (error && (error.details || error.hint)) || null,
    context: context || null,
    stack
  };
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  persist();
  notify();
  return entry;
}

export function formatErrorEntry(e) {
  return [
    `[${e.time}] ${e.message}`,
    e.context ? `Contexto: ${JSON.stringify(e.context)}` : null,
    e.code ? `Código: ${e.code}` : null,
    e.details ? `Detalhes: ${e.details}` : null,
    e.stack ? `Stack:\n${e.stack}` : null
  ].filter(Boolean).join('\n');
}

export function getErrorLog() {
  return entries;
}

export function clearErrorLog() {
  entries = [];
  persist();
  notify();
}

export function subscribeErrorLog(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Rede de segurança pra erro que não passou por nenhum catch explícito —
// throw solto num handler de clique, promise sem .catch, etc.
export function installGlobalErrorCapture() {
  window.addEventListener('error', (event) => {
    logError(event.error || { message: event.message }, {
      type: 'window.onerror',
      file: event.filename,
      line: event.lineno,
      col: event.colno
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { type: 'unhandledrejection' });
  });
}
