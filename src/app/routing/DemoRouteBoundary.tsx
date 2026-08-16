import { useEffect } from 'react';
import { useParams } from 'react-router';
import { DemoShell } from '../shell/DemoShell';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { selectScenarioDefinition, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { ProductionSchedulingPage } from '../../features/production-scheduling/ProductionSchedulingPage';
import { RouteMessage } from '../../shared/ui/RouteMessage/RouteMessage';
import { ProductionReadinessPage } from '../../features/production-readiness/ProductionReadinessPage';
import { ExecutiveHomePage } from '../../features/executive-home/ExecutiveHomePage';
import { ProductionExecutionPage } from '../../features/production-execution/ProductionExecutionPage';
import { ProductionMonitoringPage } from '../../features/production-monitoring/ProductionMonitoringPage';
import { ProductionAdherencePage } from '../../features/production-adherence/ProductionAdherencePage';
import { ProductionQualityPage } from '../../features/production-quality/ProductionQualityPage';
import { OeePage } from '../../features/oee/OeePage';
import { StrategicViewPage } from '../../features/strategic-view/StrategicViewPage';

export function DemoRouteBoundary() {
  const { scenarioId, experience } = useParams();
  const activeDefinition = useScenarioStore(selectScenarioDefinition);
  const initializeScenario = useScenarioStore((state) => state.initializeScenario);
  const definition = scenarioId ? scenarioDefinitionAdapter.findById(scenarioId) : undefined;

  useEffect(() => {
    if (definition && activeDefinition?.id !== definition.id) initializeScenario(definition);
  }, [activeDefinition?.id, definition, initializeScenario]);

  if (!definition) {
    return <DemoShell><RouteMessage title="Cenário demonstrativo não encontrado" detail="Selecione um cenário HIKARI disponível." /></DemoShell>;
  }

  if (!experience) return <ExecutiveHomePage />;

  if (experience !== 'production-scheduling' && experience !== 'production-readiness' && experience !== 'production-execution' && experience !== 'production-monitoring' && experience !== 'production-adherence' && experience !== 'production-quality' && experience !== 'oee' && experience !== 'strategic') {
    return <DemoShell><RouteMessage title="Experiência não disponível" detail="Esta experiência ainda não foi autorizada para implementação." /></DemoShell>;
  }

  return <DemoShell>{experience === 'strategic' ? <StrategicViewPage /> : experience === 'production-readiness' ? <ProductionReadinessPage /> : experience === 'production-execution' ? <ProductionExecutionPage /> : experience === 'production-monitoring' ? <ProductionMonitoringPage /> : experience === 'production-adherence' ? <ProductionAdherencePage /> : experience === 'production-quality' ? <ProductionQualityPage /> : experience === 'oee' ? <OeePage /> : <ProductionSchedulingPage />}</DemoShell>;
}
