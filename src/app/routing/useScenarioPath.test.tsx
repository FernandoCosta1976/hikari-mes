import { renderHook } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { expect, test } from 'vitest';
import { useScenarioPath } from './useScenarioPath';

function withRoute(initialEntry: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/demo/:scenarioId/*" element={children} />
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

/** Section 19.10 — internal navigation must preserve the current scenario, never fall back to a hardcoded one. */
test('composes paths against the scenario in the current URL', () => {
  const { result } = renderHook(() => useScenarioPath(), { wrapper: withRoute('/demo/fundicao-dc-legacy/production-scheduling') });
  expect(result.current('/production-readiness')).toBe('/demo/fundicao-dc-legacy/production-readiness');
});

test('falls back to the official scenario when no scenarioId is in the route (e.g. the wildcard 404 route)', () => {
  const { result } = renderHook(() => useScenarioPath(), { wrapper: withRoute('/not-a-known-route') });
  expect(result.current('/production-scheduling')).toBe('/demo/fundicao-dc/production-scheduling');
});
