const PRODUCTIVE_AREA_KEY = 'hikari.demo.application-context.productive-area';

export const applicationContextStorage = {
  restoreProductiveArea<T extends { id: string }>(available: readonly T[], fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const storedId = window.sessionStorage.getItem(PRODUCTIVE_AREA_KEY);
    return available.find((area) => area.id === storedId) ?? fallback;
  },
  saveProductiveArea(areaId: string) {
    window.sessionStorage.setItem(PRODUCTIVE_AREA_KEY, areaId);
  },
  clear() {
    window.sessionStorage.removeItem(PRODUCTIVE_AREA_KEY);
  },
};
