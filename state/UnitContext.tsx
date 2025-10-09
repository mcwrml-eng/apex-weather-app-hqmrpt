
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
      toggleUnit: () => {
        console.log('UnitContext: Toggling unit from', unit);
        setUnit((u) => (u === 'metric' ? 'imperial' : 'metric'));
      },
    }),
    [unit]
  );

  console.log('UnitProvider: Current unit is', unit);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUnit() {
  const c = useContext(Ctx);
  if (!c) {
    console.log('useUnit: Context not found, using default values');
    return { unit: 'metric' as Unit, toggleUnit: () => {} };
  }
  return c;
}
