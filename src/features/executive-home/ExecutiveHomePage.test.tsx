import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ExecutiveHomePage } from './ExecutiveHomePage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!); useScenarioStore.getState().resetScenario(); });

test('presents the complete first wave without fake future navigation', () => {
  renderWithFoundation(<ExecutiveHomePage />);
  expect(screen.getByRole('heading', { name: 'PROGRAMA HIKARI' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Iniciar demonstração/ })[0]).toHaveAttribute('href', '/demo/fundicao-dc/production-scheduling');
  expect(screen.getAllByLabelText(/^0[1-9]|^1[0-4]/)).toHaveLength(14);
  expect(screen.getByLabelText(/01 Receber Planejamento.*Materializado/)).toHaveAttribute('href', '/demo/fundicao-dc/production-scheduling');
  expect(screen.getByLabelText(/05 Executar Ordens.*Materializado/)).toHaveAttribute('href', '/demo/fundicao-dc/production-execution');
  expect(screen.getByLabelText(/06 Acompanhar Situação.*Materializado/).tagName).toBe('A');
});

test('shows the live OEE demonstrativo reusing the same projection as the OEE perspective, and a reset action', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ExecutiveHomePage />);
  const oeeTile = screen.getByLabelText('OEE demonstrativo da Fundição DC');
  expect(oeeTile).toHaveTextContent('OEE 70%');
  expect(oeeTile).toHaveTextContent('Disponibilidade 89%');
  expect(oeeTile).toHaveTextContent('Desempenho 86%');
  expect(oeeTile).toHaveTextContent('Qualidade 91%');
  expect(oeeTile).toHaveTextContent('Maior perda: Disponibilidade');
  expect(screen.getByText(/Estamos protegendo a cadeia para atender a necessidade da Montagem hoje\?/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reiniciar demonstração' }));
  expect(screen.getByLabelText('OEE demonstrativo da Fundição DC')).toHaveTextContent('OEE 70%');
});

test('shows downstream Usinagem health and the ranked action-now list, without a new capability', () => {
  renderWithFoundation(<ExecutiveHomePage />);
  const downstream = screen.getByLabelText('Saúde da próxima área: Usinagem');
  expect(downstream).toHaveTextContent('Usinagem');
  expect(downstream).toHaveTextContent('Atenção');
  expect(downstream).toHaveTextContent('Material B');
  expect(downstream).toHaveTextContent('Lote 266');

  const actionNow = screen.getByLabelText('O que exige ação agora');
  expect(within(actionNow).getAllByRole('listitem').length).toBeGreaterThan(0);
  expect(within(actionNow).getAllByRole('listitem').length).toBeLessThanOrEqual(3);
  expect(actionNow).toHaveTextContent('DC03');
  expect(actionNow).toHaveTextContent('USINAGEM');
});

test('reveals capability relationships for each executive question', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ExecutiveHomePage />);
  const detail = screen.getByRole('complementary', { name: 'Capacidades relacionadas à pergunta selecionada' });
  expect(detail).toHaveTextContent('O que foi planejado?');
  await user.click(screen.getByRole('button', { name: /Estou aderente ao plano/ }));
  expect(detail).toHaveTextContent('10 Comparar Planejado × Executado');
  expect(detail).toHaveTextContent('11 Identificar Desvios Operacionais');
  expect(detail).toHaveTextContent('12 Monitorar Produção em Tempo Real');
  await user.tab();
  expect(within(detail).getByText('Capacidades que contribuem:')).toBeInTheDocument();
});

test('explains the OEE chain and points to the now-materialized OEE perspective', () => {
  renderWithFoundation(<ExecutiveHomePage />);
  const section = screen.getByRole('heading', { name: 'OEE como consequência da execução conectada' }).closest('section')!;
  expect(section).toHaveTextContent('Disponibilidade');
  expect(section).toHaveTextContent('Desempenho');
  expect(section).toHaveTextContent('Qualidade');
  expect(section).toHaveTextContent('Primeira Onda concluída · OEE disponível na perspectiva OEE');
  expect(section).not.toHaveTextContent(/OEE\s*\d/);
});
