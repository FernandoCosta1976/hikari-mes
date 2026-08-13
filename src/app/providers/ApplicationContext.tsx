import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ProductiveArea } from '../../domain/application-context/ProductiveArea';
import { defaultProductiveArea, productiveAreas } from '../../domain/application-context/ProductiveArea';
import { applicationContextStorage } from './applicationContextStorage';

interface ApplicationContextValue {
  productiveArea: ProductiveArea;
  availableProductiveAreas: readonly ProductiveArea[];
  setProductiveArea: (areaId: ProductiveArea['id']) => void;
  resetApplicationContext: () => void;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationContextProvider({ children }: { children: ReactNode }) {
  const [productiveArea, setProductiveAreaValue] = useState(() =>
    applicationContextStorage.restoreProductiveArea(productiveAreas, defaultProductiveArea),
  );

  const setProductiveArea = useCallback((areaId: ProductiveArea['id']) => {
    const nextArea = productiveAreas.find((area) => area.id === areaId);
    if (!nextArea) return;
    setProductiveAreaValue(nextArea);
    applicationContextStorage.saveProductiveArea(nextArea.id);
  }, []);

  const resetApplicationContext = useCallback(() => {
    applicationContextStorage.clear();
    setProductiveAreaValue(defaultProductiveArea);
  }, []);

  const value = useMemo(
    () => ({ productiveArea, availableProductiveAreas: productiveAreas, setProductiveArea, resetApplicationContext }),
    [productiveArea, setProductiveArea, resetApplicationContext],
  );

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error('useApplicationContext must be used within ApplicationContextProvider.');
  return context;
}
