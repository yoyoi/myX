'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type Ctx = { q: string; setQ: (s: string) => void };
const C = createContext<Ctx | null>(null);

export default function useSearchState() {
  const ctx = useContext(C);
  if (!ctx) throw new Error('SearchState missing provider');
  return ctx;
}

export function SearchStateProvider({ children }: { children: React.ReactNode }) {
  const [q, setQ] = useState('');
  const stableSetQ = useCallback((s: string) => setQ(s), []);
  return <C.Provider value={{ q, setQ: stableSetQ }}>{children}</C.Provider>;
}
