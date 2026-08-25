import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = ainda carregando

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <LoginPage />;
  return <MainApp session={session} />;
}
