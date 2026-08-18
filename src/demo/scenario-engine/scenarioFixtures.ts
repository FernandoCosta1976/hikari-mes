import { fundicaoDcIdealCycleTimeSecondsFixture } from '../fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionEventsFixture } from '../fixtures/fundicaoDcProductionEvents';
import { fundicaoDcQualityConfirmationsFixture } from '../fixtures/fundicaoDcQualityConfirmations';
import { fundicaoDcUsinagemHealthFixture } from '../fixtures/fundicaoDcDownstreamHealth';
import { fundicaoDcMoldsFixture } from '../fixtures/fundicaoDcMolds';
import { fundicaoDcSourceDerivedProductionEventsFixture } from '../fixtures/fundicaoDcSourceDerivedProductionEvents';
import { fundicaoDcSourceDerivedQualityConfirmationsFixture } from '../fixtures/fundicaoDcSourceDerivedQualityConfirmations';
import { fundicaoDcSourceDerivedUsinagemHealthFixture } from '../fixtures/fundicaoDcSourceDerivedDownstreamHealth';
import { fundicaoDcSourceDerivedMoldsFixture } from '../fixtures/fundicaoDcSourceDerivedMolds';
import { sourceDerivedIdealCycleTimeSecondsByMaterialId } from '../scenarios/fundicaoDcSourceDerivedScenario';
import type { DownstreamAreaHealth } from '../../domain/downstream/models';
import type { Mold } from '../../domain/mold/models';
import type { QualityConfirmation } from '../../domain/production-quality/models';
import type { ProductionEvent } from '../../domain/production-monitoring/models';

/**
 * Every consuming screen (Aderência, Qualidade & Desempenho, OEE, Visão
 * Estratégica) reads the SAME per-Scenario facts here instead of importing a
 * fixture directly — never a dataset of its own (Section 14). The reference
 * `fundicao-dc` Scenario has its own real Events/Quality/Cycle-Time facts
 * (2026-07-10 · 09:15); `fundicao-dc-legacy` keeps its original fixtures.
 */
export function eventsForScenario(scenarioId: string | undefined): readonly ProductionEvent[] {
  return scenarioId === 'fundicao-dc' ? fundicaoDcSourceDerivedProductionEventsFixture : fundicaoDcProductionEventsFixture;
}

export function qualityConfirmationsForScenario(scenarioId: string | undefined): readonly QualityConfirmation[] {
  return scenarioId === 'fundicao-dc' ? fundicaoDcSourceDerivedQualityConfirmationsFixture : fundicaoDcQualityConfirmationsFixture;
}

export function idealCycleTimeSecondsForScenario(scenarioId: string | undefined): Readonly<Record<string, number>> {
  return scenarioId === 'fundicao-dc' ? sourceDerivedIdealCycleTimeSecondsByMaterialId : fundicaoDcIdealCycleTimeSecondsFixture;
}

export function downstreamHealthForScenario(scenarioId: string | undefined): DownstreamAreaHealth {
  return scenarioId === 'fundicao-dc' ? fundicaoDcSourceDerivedUsinagemHealthFixture : fundicaoDcUsinagemHealthFixture;
}

export function moldsForScenario(scenarioId: string | undefined): readonly Mold[] {
  return scenarioId === 'fundicao-dc' ? fundicaoDcSourceDerivedMoldsFixture : fundicaoDcMoldsFixture;
}
