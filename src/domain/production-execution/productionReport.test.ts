import { describe, expect, it } from 'vitest';
import { fundicaoDcProductionReportsFixture } from '../../demo/fixtures/fundicaoDcProductionReports';
import { latestReport, reportsForLot } from './productionReport';

describe('reportsForLot / latestReport', () => {
  it('orders Lot 265 apontamentos newest first and identifies the latest as an Automation fact at 17:18', () => {
    const reports = reportsForLot(fundicaoDcProductionReportsFixture, 'lot-265');
    expect(reports.map((report) => report.quantity)).toEqual([12, 10, 15]);
    const latest = latestReport(fundicaoDcProductionReportsFixture, 'lot-265');
    expect(latest).toMatchObject({ quantity: 12, origin: 'AUTOMATION' });
  });

  it('demonstrates both Automatic and Manual (Operator) origins across the fixture', () => {
    const origins = new Set(fundicaoDcProductionReportsFixture.map((report) => report.origin));
    expect(origins.has('AUTOMATION')).toBe(true);
    expect(origins.has('OPERATOR')).toBe(true);
  });

  it('returns undefined for a Lot with no apontamento history', () => {
    expect(latestReport(fundicaoDcProductionReportsFixture, 'lot-271')).toBeUndefined();
  });
});
