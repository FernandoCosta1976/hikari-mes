# WF-001 — States and Exceptions

## 1. State philosophy

Exceptions must explain operational meaning.

No red.

## 2. State S01 — Normal current plan

- Balancing current;
- PyMAC current;
- reconciled quantities;
- no major raw-material risk.

Message:

**Programação atualizada**

## 3. State S02 — Today's plan not received

Message:

**Plano de hoje ainda não recebido**

Show previous available plan date/time.

## 4. State S03 — Partial freshness

Message:

**Fontes com atualizações diferentes**

Explain source-level difference.

## 5. State S04 — Quantity mismatch

Message:

**Quantidade da Ordem de Produção difere dos Lots programados**

Show both totals.

## 6. State S05 — Lot without Production Order correlation

Message:

**Ordem de Produção não identificada para este Lot**

## 7. State S06 — Production Order without scheduled Lots

Message:

**Ordem de Produção sem Lots no plano recebido**

## 8. State S07 — Raw-material attention

Message:

**Risco de matéria-prima para o compromisso planejado**

## 9. State S08 — Low current buffer, recovered by plan

Message:

**Cobertura atual abaixo da referência; plano programado recompõe a proteção**

This is an important demonstrative scenario.

## 10. State S09 — Low projected buffer

Message:

**Mesmo após o plano, a cobertura projetada permanece abaixo da referência**

## 11. State S10 — Reserved demand

Message:

**Quantidade destinada à Reposição/Engenharia**

Must remain separated from free Montagem availability.

## 12. State S11 — No schedule

Message:

**Nenhuma programação disponível para o período selecionado**

Do not show an empty unexplained timeline.

## 13. State S12 — Data unavailable

Message:

**Informação ainda não disponível**

Missing data is not zero.

## 14. Multiple exceptions

Prioritize by decision impact.

Do not show a wall of warning banners.

Use one consolidated attention entry with contextual drill-down when multiple issues coexist.
