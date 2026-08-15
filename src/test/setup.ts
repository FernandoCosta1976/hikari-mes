import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

window.__HIKARI_CLOCK_FIXED_AT__ = '2025-05-15T17:23:00-03:00';

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});
