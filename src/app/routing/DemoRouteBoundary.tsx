import { useEffect } from 'react';
import { useParams } from 'react-router';
import { DemoShell } from '../shell/DemoShell';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { selectScenarioDefinition, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { ProductionSchedulingPage } from '../../features/production-scheduling/ProductionSchedulingPage';
import { RouteMessage } from '../../shared/ui/RouteMessage/RouteMessage';

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

  if (experience !== 'production-scheduling') {
    return <DemoShell><RouteMessage title="Experiência não disponível" detail="Esta experiência ainda não foi autorizada para implementação." /></DemoShell>;
  }

  return <DemoShell><ProductionSchedulingPage /></DemoShell>;
}
