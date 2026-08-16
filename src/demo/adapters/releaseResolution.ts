import { assessDemonstrativeRelease, releaseAutomatically, type ProductionReleaseContext, type ProductionReleaseRecord } from '../../domain/production-release/models';
import { fundicaoDcAutoReleaseRuleFixture } from '../fixtures/fundicaoDcAutoReleaseRule';

/**
 * Single place that decides whether a Lot qualifies for the demonstrative
 * auto-release rule, layered on top of the governed assessDemonstrativeRelease
 * result. Reused by the Plano Lot Context modal and the Order Workspace so
 * both agree on the same Release status for the same Lot.
 */
export function resolveDemonstrativeRelease(context: ProductionReleaseContext, materialId: string, currentTime: string): ProductionReleaseRecord {
  const base = assessDemonstrativeRelease(context);
  const autoResourceId = fundicaoDcAutoReleaseRuleFixture[materialId];
  if (autoResourceId && autoResourceId === context.resourceId) return releaseAutomatically(base, currentTime);
  return base;
}
