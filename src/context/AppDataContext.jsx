import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as actions from '../lib/chairActions';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [chairs, setChairs] = useState([]);
  const [movements, setMovements] = useState([]);
  const [bolsao, setBolsao] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const [chairsRes, movementsRes, settingsRes] = await Promise.all([
      supabase.from('chairs').select('*').order('id'),
      supabase.from('movements').select('*').order('created_at', { ascending: false }),
      supabase.from('app_settings').select('*').eq('id', 1).single()
    ]);
    if (chairsRes.error) throw chairsRes.error;
    if (movementsRes.error) throw movementsRes.error;
    if (settingsRes.error) throw settingsRes.error;

    setChairs(chairsRes.data);
    setMovements(movementsRes.data);
    setBolsao(Number(settingsRes.data.bolsao));
    setBudgetTotal(Number(settingsRes.data.budget_total));
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  function snapshot() {
    return { chairs, bolsao, budgetTotal };
  }

  // Wraps a chairActions function: runs it against the current snapshot, and
  // refetches everything from Supabase on success so every screen stays in sync.
  function wrap(fn) {
    return async (...args) => {
      const result = await fn(snapshot(), ...args);
      if (result.ok) await refresh();
      return result;
    };
  }

  const value = {
    chairs,
    movements,
    bolsao,
    budgetTotal,
    bolsaoCap: budgetTotal * 0.5,
    loading,
    error,
    refresh,
    hireChair: wrap(actions.hireChair),
    dismissChair: wrap(actions.dismissChair),
    promoteChair: wrap(actions.promoteChair),
    meritoStandalone: wrap(actions.meritoStandalone),
    decomposeChair: wrap(actions.decomposeChair),
    incorporarChair: wrap(actions.incorporarChair),
    extinguishChair: wrap(actions.extinguishChair),
    applyBolsaoNovaVaga: wrap(actions.applyBolsaoNovaVaga)
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData precisa estar dentro de <AppDataProvider>.');
  return ctx;
}
