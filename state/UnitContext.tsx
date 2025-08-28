
import React, { createContext, useContext, useMemo, useState } from 'react';

type Unit = 'metric' | 'imperial';

interface UnitCtx {
  unit: Unit;
  toggleUnit: () => void;
}

const Ctx = createContext<UnitCtx | null>(null);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<Unit>('metric');
  const value = useMemo(
    () => ({
      unit,
      toggleUnit: () => setUnit((u) => (u === 'metric' ? 'imperial' : 'metric')),
    }),
    [unit]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUnit() {
  const c = useContext(Ctx);
  if (!c) {
    console.log('useUnit must be used within UnitProvider');
    return { unit: 'metric', toggleUnit: () => {} } as UnitCtx;
  }
  return c;
}
