import { describe, expect, it } from 'vitest';
import type { ProductionExecutionRecord } from '../production-execution/models';
import { deriveOrderLifecycleStatus, orderLifecycleStepIndex } from './orderLifecycle';

const execution = (status: ProductionExecutionRecord['status']): ProductionExecutionRecord => ({ lotId: 'lot-x', productionOrderId: 'po-x', resourceId: 'DC01', scheduleVersionId: 'v08', plannedQuantity: 10, scheduledStart: '2025-05-15T10:00:00-03:00', status, pauses: [], transitions: [], demonstrative: true, dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' });

describe('deriveOrderLifecycleStatus', () => {
  it('is BACKLOG when there is no Readiness assessment yet', () => {
    expect(deriveOrderLifecycleStatus(undefined, undefined, false)).toBe('BACKLOG');
  });
  it('is EM_PREPARACAO when Readiness is not READY and preparation is not confirmed', () => {
    expect(deriveOrderLifecycleStatus('ATTENTION', undefined, false)).toBe('EM_PREPARACAO');
  });
  it('is PREPARADA once preparation is manually confirmed, even if Readiness is still ATTENTION', () => {
    expect(deriveOrderLifecycleStatus('ATTENTION', undefined, true)).toBe('PREPARADA');
  });
  it('is PREPARADA when Readiness is READY without manual confirmation', () => {
    expect(deriveOrderLifecycleStatus('READY', undefined, false)).toBe('PREPARADA');
  });
  it('follows Execution status once started, taking precedence over Readiness/preparation', () => {
    expect(deriveOrderLifecycleStatus('READY', execution('IN_PROGRESS'), false)).toBe('PRODUZINDO');
    expect(deriveOrderLifecycleStatus('READY', execution('PAUSED'), false)).toBe('PAUSADA');
    expect(deriveOrderLifecycleStatus('READY', execution('COMPLETED'), false)).toBe('PRODUZIDA');
  });
});

describe('orderLifecycleStepIndex', () => {
  it('places PAUSADA at the same step as PRODUZINDO on the visual stepper', () => {
    expect(orderLifecycleStepIndex('PAUSADA')).toBe(orderLifecycleStepIndex('PRODUZINDO'));
  });
  it('is monotonically increasing along the happy path', () => {
    expect(orderLifecycleStepIndex('BACKLOG')).toBeLessThan(orderLifecycleStepIndex('EM_PREPARACAO'));
    expect(orderLifecycleStepIndex('EM_PREPARACAO')).toBeLessThan(orderLifecycleStepIndex('PREPARADA'));
    expect(orderLifecycleStepIndex('PREPARADA')).toBeLessThan(orderLifecycleStepIndex('PRODUZINDO'));
    expect(orderLifecycleStepIndex('PRODUZINDO')).toBeLessThan(orderLifecycleStepIndex('PRODUZIDA'));
  });
});
