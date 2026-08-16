import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LotHealthProjection } from '../../../domain/production-execution/lotHealth';
import { LotHealthIndicator } from './LotHealthIndicator';

function projection(overrides: Partial<LotHealthProjection>): LotHealthProjection {
  return { status: 'ON_TRACK', startedLate: false, startDeviationMinutes: null, cycleTimeSecondsPerPiece: null, productionDurationSeconds: null, runTimeMinutes: null, expectedQuantityNow: null, gapQuantity: null, projectedFinish: null, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED', ...overrides };
}

describe('LotHealthIndicator', () => {
  it('renders the canonical icon, tone and label for BEHIND_PLAN identically regardless of caller', () => {
    const health = projection({ status: 'BEHIND_PLAN' });
    const { unmount } = render(<LotHealthIndicator health={health} />);
    expect(screen.getByRole('group', { name: /Execution Health: Abaixo do plano/ })).toHaveTextContent('⚠');
    expect(screen.getByRole('group', { name: /Execution Health: Abaixo do plano/ })).toHaveAttribute('data-tone', 'attentionStrong');
    unmount();
    render(<LotHealthIndicator health={health} compact />);
    expect(screen.getByRole('group', { name: /Execution Health: Abaixo do plano/ })).toHaveAttribute('data-tone', 'attentionStrong');
  });

  it('never uses a red tone token for any status', () => {
    const statuses: LotHealthProjection['status'][] = ['NOT_DUE', 'AT_RISK', 'ON_TRACK', 'LATE_NOT_STARTED', 'STARTED_LATE', 'BEHIND_PLAN', 'AHEAD_OF_PLAN', 'COMPLETED', 'UNKNOWN'];
    for (const status of statuses) {
      const { container, unmount } = render(<LotHealthIndicator health={projection({ status })} />);
      expect(container.querySelector('[data-tone]')?.getAttribute('data-tone')).not.toMatch(/red|danger|critical/i);
      unmount();
    }
  });

  it('exposes Lot/Material/Quantity/Cycle Time/Duration/Scheduled Start-Finish/Resource in the tooltip', () => {
    const health = projection({ status: 'AT_RISK', cycleTimeSecondsPerPiece: 95, productionDurationSeconds: 9500, expectedQuantityNow: 40, gapQuantity: -2, projectedFinish: '2025-05-15T19:00:00-03:00' });
    render(<LotHealthIndicator health={health} context={{ lotLabel: '266', material: 'Material B', quantity: 100, resourceId: 'DC03', scheduledStart: '15:30', scheduledFinish: '17:30' }} />);
    const el = screen.getByRole('group', { name: /Execution Health: Risco de atraso/ });
    expect(el).toHaveAttribute('data-tip', expect.stringContaining('Lot 266 · Material B · 100 peças'));
    expect(el).toHaveAttribute('data-tip', expect.stringContaining('Engineering Cycle Time 95s/peça'));
    expect(el).toHaveAttribute('data-tip', expect.stringContaining('Scheduled Start 15:30 · Scheduled Finish 17:30'));
    expect(el).toHaveAttribute('data-tip', expect.stringContaining('Resource DC03'));
  });
});
