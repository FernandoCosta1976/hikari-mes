import { buildProductionConfirmation, type ProductionConfirmation } from '../../domain/production-confirmation/models';
import { demonstrativeOperatorForResource } from './demonstrativeOperators';
import { rawExecutionFacts } from './fundicaoDcSourceDerivedProductionExecution';
import { sourceDerivedTraceabilityByLotId } from '../scenarios/fundicaoDcSourceDerivedScenario';

/**
 * Capability 06 migration (Section 19): the reference dataset's historical
 * producedQuantity facts become seed Production Confirmations — ONE per
 * Requirement that already had a produced quantity at the 09:15 baseline —
 * so Total Count has a single source (SUM(confirmations)) from the moment
 * the scenario loads, never a second field on Execution.
 */
export const fundicaoDcSourceDerivedProductionConfirmationsFixture: readonly ProductionConfirmation[] = rawExecutionFacts
  .filter((record) => record.producedQuantity > 0)
  .map((record) => {
    const traceability = sourceDerivedTraceabilityByLotId[record.lotId];
    const operator = demonstrativeOperatorForResource(record.resourceId);
    return buildProductionConfirmation({
      id: `${record.lotId}-confirmation-seed`,
      requirementId: record.lotId,
      resourceId: record.resourceId,
      operatorId: operator.operatorId,
      componentId: traceability?.componentCode ?? record.lotId,
      sourceLineCLot: traceability ? String(traceability.sourceLot) : undefined,
      confirmedAt: record.actualFinish ?? record.actualStart ?? record.scheduledStart,
      increment: record.producedQuantity,
      dataOrigin: 'DEMONSTRATIVE_CONFIRMATION',
    });
  });
