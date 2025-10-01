
import React, { createContext, useContext, useState, useCallback } from 'react';

type Unit = 'metric' | 'imperial';

interface UnitCtx {
  unit: Unit;
  toggleUnit: () => void;
}

const Ctx = createContext<UnitCtx | null>(null);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<Unit>('metric');
  
  const toggleUnit = useCallback(() => {
    setUnit((currentUnit) => {
      const newUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
      return newUnit;
    });
  }, []);

  const value: UnitCtx = {
    unit,
    toggleUnit,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUnit(): UnitCtx {
  const c = useContext(Ctx);
  if (!c) {
    console.warn('[useUnit] Context not found, using default values');
    return { 
      unit: 'metric' as Unit, 
      toggleUnit: () => {
        console.warn('[useUnit] toggleUnit called but no context available');
      }
    };
  }
  return c;
}
