import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('E-mail ou senha inválidos.');
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>NS Position <span style={{ color: 'var(--accent)' }}>Hub</span></h1>
        <p className="tagline">Entre com seu e-mail e senha para acessar o sistema de posições e cargos.</p>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
