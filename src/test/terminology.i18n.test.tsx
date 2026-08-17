import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { scenarioDefinitionAdapter } from '../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../demo/scenario-engine/scenarioStore';
import { ExecutiveHomePage } from '../features/executive-home/ExecutiveHomePage';
import { OeePage } from '../features/oee/OeePage';
import { ProductionAdherencePage } from '../features/production-adherence/ProductionAdherencePage';
import { ProductionExecutionPage } from '../features/production-execution/ProductionExecutionPage';
import { ProductionMonitoringPage } from '../features/production-monitoring/ProductionMonitoringPage';
import { ProductionQualityPage } from '../features/production-quality/ProductionQualityPage';
import { ProductionSchedulingPage } from '../features/production-scheduling/ProductionSchedulingPage';
import { StrategicViewPage } from '../features/strategic-view/StrategicViewPage';
import { renderWithFoundation } from './renderWithFoundation';

/**
 * Manual, curated scan for the main English terms the pt-BR pass targeted
 * (spec section 5). Not an exhaustive English-word detector by design.
 */
const FORBIDDEN_TERMS = ['Scheduled Start', 'Actual Start', 'Scheduled Finish', 'Actual Finish', 'Current Time', 'Run Time', 'Ideal Cycle Time', 'Cycle Time', 'Quality Rate', 'Work Center', 'Production Order', 'Schedule Version', 'Business Date', 'Business date', 'Eligibility', 'Availability:', 'Tooling:', 'Projected Finish', 'Behind Plan', 'At Risk', 'On Track', 'Late Not Started', 'Started Late', 'Not Due', 'Ahead of Plan', 'Planned Production Time', 'Downtime', 'Dispatch', 'Resource Availability', 'Scheduled Resource', 'Loss reason'];

const pages: readonly [string, () => void][] = [
  ['OeePage', () => { renderWithFoundation(<OeePage />); }],
  ['ProductionQualityPage', () => { renderWithFoundation(<ProductionQualityPage />); }],
  ['ProductionAdherencePage', () => { renderWithFoundation(<ProductionAdherencePage />); }],
  ['ProductionMonitoringPage', () => { renderWithFoundation(<ProductionMonitoringPage />); }],
  ['ProductionExecutionPage', () => { renderWithFoundation(<ProductionExecutionPage />); }],
  ['ProductionSchedulingPage', () => { renderWithFoundation(<ProductionSchedulingPage />); }],
  ['StrategicViewPage', () => { renderWithFoundation(<StrategicViewPage />); }],
];

describe('pt-BR terminology scan', () => {
  for (const [name, renderPage] of pages) {
    it(`renders ${name} without the main English terms leaking into the UI`, () => {
      useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
      useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!);
      useScenarioStore.getState().resetScenario();
      const { container } = render(<></>);
      container.remove();
      renderPage();
      const text = document.body.textContent ?? '';
      for (const term of FORBIDDEN_TERMS) expect(text, `found "${term}" in ${name}`).not.toContain(term);
    });
  }

  it('renders ExecutiveHomePage without the main English terms leaking into the UI', () => {
    useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
    useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!);
    useScenarioStore.getState().resetScenario();
    renderWithFoundation(<ExecutiveHomePage />);
    const text = document.body.textContent ?? '';
    for (const term of FORBIDDEN_TERMS) expect(text, `found "${term}" in ExecutiveHomePage`).not.toContain(term);
  });
});
