import { buildProductionConfirmation, type ProductionConfirmation } from '../../domain/production-confirmation/models';
import { demonstrativeOperatorForResource } from './demonstrativeOperators';
import { rawExecutionFacts } from './fundicaoDcProductionExecution';

/** Legacy scenario's own component per Lot — no Linha C traceability model for this dataset (see LotDetail's conditional rendering). */
const componentIdByLotId: Readonly<Record<string, string>> = { 'lot-265': 'material-a', 'lot-264': 'material-d', 'lot-266': 'material-b', 'lot-268': 'material-c', 'lot-271': 'material-b' };

/** Capability 06 migration (Section 19): the legacy dataset's historical producedQuantity facts become seed Production Confirmations, mirroring the canonical scenario's own migration. */
export const fundicaoDcProductionConfirmationsFixture: readonly ProductionConfirmation[] = rawExecutionFacts
  .filter((record) => record.producedQuantity > 0)
  .map((record) => {
    const operator = demonstrativeOperatorForResource(record.resourceId);
    return buildProductionConfirmation({
      id: `${record.lotId}-confirmation-seed`,
      requirementId: record.lotId,
      resourceId: record.resourceId,
      operatorId: operator.operatorId,
      componentId: componentIdByLotId[record.lotId] ?? record.lotId,
      confirmedAt: record.actualFinish ?? record.actualStart ?? record.scheduledStart,
      increment: record.producedQuantity,
      dataOrigin: 'DEMONSTRATIVE_CONFIRMATION',
    });
  });
