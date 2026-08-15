import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionReadinessPage } from './ProductionReadinessPage';

beforeEach(() => {
  const definition = scenarioDefinitionAdapter.findById('fundicao-dc')!;
  useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
  useScenarioStore.getState().initializeScenario(definition);
  window.history.replaceState(null, '', '/demo/fundicao-dc/production-readiness?lotId=lot-252');
});

test('preserves the selected Lot and exposes readiness without assignment semantics', () => {
  renderWithFoundation(<ProductionReadinessPage />);
  expect(screen.getByRole('heading', { name: 'Temos condições de produzir?' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Contexto do Lote 252' })).toHaveTextContent('Material A100 peçasReposição');
  expect(screen.getByRole('region', { name: 'Contexto do Lote 252' })).toHaveTextContent('Máquina programada: DC03 · demonstrativa');
  expect(screen.queryByRole('button', { name: /Atribuir|Despachar|Liberar/ })).not.toBeInTheDocument();
});

test('groups Resources canonically and keeps the programmed Resource in its actual condition', () => {
  window.history.replaceState(null, '', '/demo/fundicao-dc/production-readiness?lotId=lot-257');
  const { container } = renderWithFoundation(<ProductionReadinessPage />);
  const groups = [...container.querySelectorAll('[data-resource-group]')];
  expect(groups.map((group) => group.getAttribute('data-resource-group'))).toEqual(['READY', 'ATTENTION', 'UNAVAILABLE']);
  expect(groups[1]).toHaveTextContent('DC01Programada');
  expect(groups[1]).toHaveTextContent('DC05Informação insuficiente');
  expect(groups[2]).toHaveTextContent('DC02Não elegível');
  expect(groups[2]).toHaveTextContent('DC04Não elegível');
});

test('reuses the temporal engine with relevant Resources, selected Lot once and known impact', () => {
  window.history.replaceState(null, '', '/demo/fundicao-dc/production-readiness?lotId=lot-257');
  const { container } = renderWithFoundation(<ProductionReadinessPage />);
  const timeline = screen.getByTestId('readiness-timeline-scroller');
  expect(timeline).toHaveTextContent('DC01');
  expect(timeline).toHaveTextContent('DC03');
  expect(timeline).toHaveTextContent('DC05');
  expect(timeline).not.toHaveTextContent('DC02');
  expect(timeline).not.toHaveTextContent('DC04');
  expect(container.querySelectorAll('[data-lot-id="lot-257"]')).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'Impacto conhecido' })).toBeInTheDocument();
  expect(screen.getByText(/Somente fatos demonstrativos do plano atual/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Atribuir|Recomendar|Trocar máquina|Despachar|Liberar|Iniciar/ })).not.toBeInTheDocument();
});

test('shows READY, ATTENTION, BLOCKED and UNKNOWN Lot filters and navigates by exception', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionReadinessPage />);
  for (const label of ['Condições atendidas', 'Atenção', 'Condição impeditiva', 'Informação insuficiente']) expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  await user.click(screen.getByRole('button', { name: 'Condição impeditiva' }));
  expect(screen.getByRole('button', { name: /Lote 259/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Lote 251/ })).not.toBeInTheDocument();
});

test('applies Material × Resource Eligibility before progressive readiness detail', async () => {
  const user = userEvent.setup();
  const { container } = renderWithFoundation(<ProductionReadinessPage />);
  expect(container.querySelector('[data-resource-id="DC02"]')).toHaveTextContent('Não elegível');
  expect(screen.queryByRole('button', { name: 'Ver condições de DC02' })).not.toBeInTheDocument();
  await user.click(screen.getByText('Detalhes de Readiness por máquina'));
  await user.click(screen.getByRole('button', { name: 'Ver condições de DC03' }));
  expect(screen.getByRole('dialog', { name: /DC03 · Lote 252/ })).toHaveTextContent('Setup necessário; duração não calculada.');
});

test('direct access shows Business Date, one exception queue, reasons and subordinate READY Lots', () => {
  window.history.replaceState(null, '', '/demo/fundicao-dc/production-readiness');
  renderWithFoundation(<ProductionReadinessPage />);
  expect(screen.getByText('15/05/2025')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Fila operacional de exceções' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 259.*Disponibilidade no intervalo/ })).toBeInTheDocument();
  expect(screen.getByText('Prontos (11)')).toBeInTheDocument();
  expect(screen.queryByText('Organização')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /Lote 259/ })).toHaveLength(1);
});
