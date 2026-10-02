import { Component } from 'react';
import { logError } from '../lib/errorLog';

// Rede de segurança pra erro de render do React (que window.onerror não pega
// direito) — registra no log global e mostra uma tela mínima de recuperação
// em vez de a página inteira ficar em branco.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(error, { type: 'react-render', componentStack: info?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
          <h2 style={{ color: 'var(--text)' }}>Ocorreu um erro inesperado nesta tela.</h2>
          <p>O erro já foi registrado no ícone de log, no canto da tela.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
