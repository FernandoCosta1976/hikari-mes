/**
 * Where an operational fact came from. Demonstrative concept — no real
 * integration; a future Automation/Digitalização layer would supply
 * AUTOMATION facts directly instead of relying on OPERATOR apontamento.
 */
export type OperationalFactOrigin = 'AUTOMATION' | 'OPERATOR' | 'MES' | 'EXTERNAL_SYSTEM';

export const operationalFactOriginLabel: Record<OperationalFactOrigin, string> = {
  AUTOMATION: 'Automação/Digitalização',
  OPERATOR: 'Operador',
  MES: 'HIKARI MES',
  EXTERNAL_SYSTEM: 'Sistema externo',
};
