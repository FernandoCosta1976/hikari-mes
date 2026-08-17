import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { OrderWorkspacePage } from './OrderWorkspacePage';

beforeEach(() => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  useScenarioStore.getState().resetScenario();
});

const heroFacts = () => screen.getByText('Material').closest('dl')!;

test('shows the Order hero with Material, Quantity, State, Release and Programming for Lote 270', () => {
  renderWithFoundation(<OrderWorkspacePage lotId="lot-270" />);
  expect(screen.getByRole('heading', { name: 'Ordem / Lote 270' })).toBeInTheDocument();
  const facts = heroFacts();
  expect(facts).toHaveTextContent('Material C');
  expect(facts).toHaveTextContent('70 peças');
  expect(facts).toHaveTextContent('Em preparação');
  expect(facts).toHaveTextContent('DC01');
});

test('Cena A: auto-releases Lote 258 (Material B fixed to DC02) without any manual action', () => {
  renderWithFoundation(<OrderWorkspacePage lotId="lot-258" />);
  expect(screen.getByText('Liberada automaticamente pela regra HIKARI')).toBeInTheDocument();
  expect(heroFacts()).toHaveTextContent('Liberada automaticamente');
  expect(screen.queryByRole('button', { name: 'Liberar para produção' })).not.toBeInTheDocument();
});

test('Cena B: manually releases Lote 251 through the confirmation panel', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<OrderWorkspacePage lotId="lot-251" />);
  await user.click(screen.getByRole('button', { name: 'Liberar para produção' }));
  const panel = screen.getByRole('region', { name: 'Confirmar liberação' });
  expect(panel).toHaveTextContent('DC01');
  await user.click(within(panel).getByRole('button', { name: 'Confirmar liberação' }));
  expect(heroFacts()).toHaveTextContent('Liberada manualmente');
});

test('Cena C: revokes the Release of Lote 271 (Released but not started), and offers no revoke action once started', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<OrderWorkspacePage lotId="lot-271" />);
  expect(heroFacts()).toHaveTextContent('Liberada manualmente');
  await user.click(screen.getByRole('button', { name: 'Revogar liberação' }));
  const panel = screen.getByRole('region', { name: 'Revogar liberação' });
  await user.selectOptions(within(panel).getByLabelText('Motivo da revogação'), 'PLAN_CHANGE');
  await user.click(within(panel).getByRole('button', { name: 'Confirmar revogação' }));
  expect(heroFacts()).toHaveTextContent('Liberação revogada');

  const { unmount } = renderWithFoundation(<OrderWorkspacePage lotId="lot-265" />);
  expect(screen.queryAllByRole('button', { name: 'Revogar liberação' })).toHaveLength(0);
  unmount();
});

test('Cena D: confirming preparation for Lote 270 advances it from Em preparação to Preparada', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<OrderWorkspacePage lotId="lot-270" />);
  expect(screen.getByRole('region', { name: 'Próxima decisão' })).toHaveTextContent('Preparação no ponto ainda pendente');
  await user.click(screen.getByRole('button', { name: 'Marcar preparação como concluída' }));
  expect(heroFacts()).toHaveTextContent('Preparada');
  expect(screen.getByRole('button', { name: 'Liberar para produção' })).toBeInTheDocument();
});

test('Cena E: reprograms Lote 270 from DC01 to DC04 (its only eligible alternative) with a before/after preview', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<OrderWorkspacePage lotId="lot-270" />);
  await user.click(screen.getByRole('button', { name: 'Alterar programação' }));
  const panel = screen.getByRole('region', { name: 'Alterar programação' });
  const dc02 = within(panel).getByRole('button', { name: /DC02/ });
  const dc04 = within(panel).getByRole('button', { name: /DC04/ });
  expect(dc02).toBeDisabled();
  expect(dc04).not.toBeDisabled();
  await user.click(dc04);
  expect(panel).toHaveTextContent('ANTES');
  expect(panel).toHaveTextContent('DEPOIS');
  await user.click(within(panel).getByRole('button', { name: 'Confirmar nova programação' }));
  expect(heroFacts()).toHaveTextContent('DC04');
  expect(heroFacts()).toHaveTextContent('Programado originalmente: DC01');
});

test('Cena F: postpones Lote 262 to Turno 3 without starting execution', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<OrderWorkspacePage lotId="lot-262" />);
  await user.click(screen.getByRole('button', { name: 'Alterar programação' }));
  const panel = screen.getByRole('region', { name: 'Alterar programação' });
  await user.click(within(panel).getByLabelText('Hoje — Turno 3'));
  await user.click(within(panel).getByRole('button', { name: 'Colocar em espera' }));
  expect(screen.getByText('Em espera · Turno 3')).toBeInTheDocument();
});

test('never shows a false LATE_NOT_STARTED for a Lot whose execution was never simulated, even with a past Scheduled Start', () => {
  renderWithFoundation(<OrderWorkspacePage lotId="lot-251" />);
  expect(screen.getByRole('group', { name: /Saúde de execução: Sem acompanhamento/ })).toBeInTheDocument();
  expect(screen.queryByText('Atrasado para iniciar')).not.toBeInTheDocument();
});

test('preserves the LATE_NOT_STARTED pedagogical scene for the monitored Lote 271 on DC05', () => {
  renderWithFoundation(<OrderWorkspacePage lotId="lot-271" />);
  expect(screen.getByRole('group', { name: /Saúde de execução: Atrasado para iniciar/ })).toBeInTheDocument();
});

test('shows a not-found message for an unknown Lot id', () => {
  renderWithFoundation(<OrderWorkspacePage lotId="lot-does-not-exist" />);
  expect(screen.getByRole('heading', { name: 'Ordem não encontrada' })).toBeInTheDocument();
});
