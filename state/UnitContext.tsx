
import React, { createContext, useContext, useState } from 'react';

type Unit = 'metric' | 'imperial';

interface UnitCtx {
  unit: Unit;
  toggleUnit: () => void;
}

const Ctx = createContext<UnitCtx | null>(null);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<Unit>('metric');
  
  const toggleUnit = () => {
    console.log('UnitContext: Toggling unit from', unit);
    setUnit((u) => (u === 'metric' ? 'imperial' : 'metric'));
  };

  const value: UnitCtx = {
    unit,
    toggleUnit,
  };

  console.log('UnitProvider: Current unit is', unit);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUnit(): UnitCtx {
  const c = useContext(Ctx);
  if (!c) {
    console.log('useUnit: Context not found, using default values');
    return { 
      unit: 'metric' as Unit, 
      toggleUnit: () => {
        console.log('useUnit: toggleUnit called but no context available');
      }
    };
  }
  return c;
}
