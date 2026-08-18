/**
 * PowerTrain domain hierarchy — Section 4 of the operational reference baseline round.
 *
 * ProductionGroup (PowerTrain)
 *   └── ProductiveArea (Fundição DC, Fundição LP, Usinagem Ferrosos, Usinagem
 *       Alumínio, Pintura Alumínio)
 *         └── Resource (DC01–DC05, physical machines — only Fundição DC has
 *             resources modeled today; the other Áreas are master data only)
 *
 * A ProductionGroup is an organizational grouping of Áreas Produtivas — never
 * a Resource, Work Center, or an interchangeable Área itself. Only Fundição
 * DC has real operational data (execution, readiness, OEE); the other four
 * Áreas are registered as governed master data with no fabricated production,
 * OEE, adherence or operational status (Section 5 — "não criar dados
 * fictícios").
 */

export interface ProductionGroup {
  id: string;
  label: string;
}

export interface ProductiveArea {
  id: string;
  label: string;
  productionGroupId: ProductionGroup['id'];
  /** Only true for the Área that currently has real operational data wired (Fundição DC). */
  operational: boolean;
}

export const POWERTRAIN: ProductionGroup = { id: 'powertrain', label: 'PowerTrain' };

/** Governed master data for every Área Produtiva under PowerTrain — see Section 5: registering the hierarchy is allowed, fabricating production facts for the non-operational Áreas is not. */
export const powertrainProductiveAreas = [
  { id: 'fundicao-dc', label: 'Fundição DC', productionGroupId: POWERTRAIN.id, operational: true },
  { id: 'fundicao-lp', label: 'Fundição LP', productionGroupId: POWERTRAIN.id, operational: false },
  { id: 'usinagem-ferrosos', label: 'Usinagem Ferrosos', productionGroupId: POWERTRAIN.id, operational: false },
  { id: 'usinagem-aluminio', label: 'Usinagem Alumínio', productionGroupId: POWERTRAIN.id, operational: false },
  { id: 'pintura-aluminio', label: 'Pintura Alumínio', productionGroupId: POWERTRAIN.id, operational: false },
] as const satisfies readonly ProductiveArea[];

export const operationalProductiveArea = powertrainProductiveAreas.find((area) => area.operational)!;
