# Capability 04 — Liberar Produção (Production Release)

Status: Materializado (demonstrativo)
Context: PowerTrain → Fundição DC → DC01–DC05, cenário oficial `fundicao-dc`

## Pergunta dominante

"Este trabalho pode ser liberado para produção?"

## Ready != Released

O domínio já mantinha os dois conceitos como estados distintos antes desta
rodada (`src/domain/production-release/models.ts`), e esta rodada os
regression-testou e completou a UX em torno deles:

`SCHEDULED` (Lot no Plano) → `READY`/`ATTENTION`/`BLOCKED` (Readiness,
`src/domain/production-readiness`) → `NOT_RELEASED` / `READY_FOR_RELEASE` /
`RELEASE_ATTENTION` / `BLOCKED_FOR_RELEASE` / `RELEASED` (Release,
`ProductionReleaseStatus`) → `NOT_STARTED`/`IN_PROGRESS`/... (Execution,
domínio separado, fora de escopo desta capability).

Readiness fornece **evidências**. Release é uma **decisão operacional
distinta** — nunca automática: `releaseDemonstratively` só transiciona um
registro que já está `READY_FOR_RELEASE`, e só quando o operador clica
"Liberar para produção" no Lot Context Modal.

## Release Policy

Governed: NO
Demonstrative: YES
Business validation required: YES

`assessDemonstrativeRelease` (regra mínima, centralizada, não espalhada pela
UI):

- `readiness === 'BLOCKED'` → `BLOCKED_FOR_RELEASE` (não pode ser liberado)
- `readiness === 'ATTENTION'` → `RELEASE_ATTENTION` (requer revisão humana
  explícita — não é decidido automaticamente pela política se pode ou não
  ser liberado)
- `readiness === 'READY'` e Resource + horário organizados → `READY_FOR_RELEASE`
- caso contrário → `NOT_RELEASED`

Cada registro carrega `ruleStatus: 'BUSINESS_VALIDATION_REQUIRED'` e a UI
mostra "Regra demonstrativa · requer validação de negócio" ao lado de toda
decisão de liberação — nunca apresentada como regra produtiva validada.

## Estados

| State | Meaning | Action |
|---|---|---|
| `NOT_RELEASED` | Evidência mínima ainda desconhecida | nenhuma — aguarda Preparação |
| `READY_FOR_RELEASE` | Pronto para liberar | botão "Liberar para produção" habilitado |
| `RELEASE_ATTENTION` | Requer revisão antes da liberação | botão "Revisar condições" → leva à aba Preparação |
| `BLOCKED_FOR_RELEASE` | Liberação bloqueada | nenhuma ação — motivo principal exibido |
| `RELEASED` | Liberado | badge "Liberado"; sinal discreto no Plano e na fila de Preparação |
| `RELEASE_REVOKED` | Revogado (antes da execução iniciar) | já existia; fora do escopo direto desta rodada |

Nunca vermelho — `BLOCKED_FOR_RELEASE` usa `var(--color-unavailable)` (a
mesma cor neutra já usada em toda a Preparação), não vermelho.

## Example Lots (cenário oficial `fundicao-dc`, 2026-07-09)

| Lot | Component | Readiness | Release Status | Action |
|---|---|---|---|---|
| Lote 407 | 1B2-E5411-W0 · Tampa Esquerda | READY | READY_FOR_RELEASE → RELEASED (demonstrado) | "Liberar para produção" |
| Lote 418 | 1ST-E1310-W0 · Cilindro | ATTENTION (sem reserva confirmada) | RELEASE_ATTENTION | "Revisar condições" → Preparação |
| Lote 259 (cenário legado) | Material C | BLOCKED | BLOCKED_FOR_RELEASE | nenhuma — "NÃO PODE SER LIBERADO" |
| Lote 410/412/413/415/421 | vários | READY (seed inicial) | RELEASED (seed) | já liberados no baseline |

O cenário oficial não tem, por construção, um Lot naturalmente BLOCKED — todo
Lot agendado já é um requirement RESOLVED (com componente e máquina
conhecidos); a cena bloqueada é demonstrada no cenário legado, que preserva
um caso real de indisponibilidade no intervalo. A UI (mesmo componente
`LotDetail`) é idêntica nos dois cenários.

## Lot Context Modal — seção Liberação

Adicionado nesta rodada: **Máquina titular** (Primary Resource, de
`componentResourceMappings`, distinto de Máquina programada/organização) e o
aviso de simulação ativa. Já existia: Situação da preparação (Readiness
Summary), Situação da organização (Programmed vs. Operational Resource),
Situação da liberação (Release Status), Versão do plano, Horário de
liberação, Liberado por.

Se houver uma simulação ativa para o Lot selecionado: "Há uma simulação
ativa. A liberação utiliza o plano vigente (<Resource programada>), não a
máquina simulada (<Resource simulada>)." — a liberação nunca usa o estado
simulado como baseline (Section 17).

## Plano Hora-Hora

Sinal discreto "Liberado" já existia no bloco do Lot (`releaseByLotId`),
preservando a prioridade Lote / Código do componente / Quantidade.

## Preparação (Preparation Perspective)

Adicionado nesta rodada: sinal discreto "Liberado" na fila de exceções/
prontos, sem transformar a fila em execução — a prioridade continua sendo
identificar condições/exceções.

## Release não altera o Plano nem inicia Execução

Estrutural, não apenas por convenção: `ProductionReleaseRecord` não tem
campos `scheduledStart`/`scheduledFinish`/`actualStart`/`producedQuantity` —
release e execução são tipos de domínio inteiramente separados
(`src/domain/production-release/models.ts` vs.
`src/domain/production-execution/models.ts`). Liberar um Lot não muda
Resource, Quantity, Source Lot, Component, Primary/Reserve ou Schedule
Version — testado explicitamente (Section 26, itens 8–12).

## Traceability

O evento de liberação preserva rastreabilidade completa até: PowerTrain →
Fundição DC → DC01–DC05 → Component → Item/Lote da LINHA C → Modelo →
Quantidade → Business Date → Versão do plano → Situação da preparação — via
os mesmos `traceability`/`resourceRole` já wireados no Lot Context Modal.

## Output para a próxima capability

**Released Production Requirement** — um Lot com `ProductionReleaseRecord.status
=== 'RELEASED'`, Resource programada preservada, sem Actual Start nem
Produced Quantity fabricados. Isso é exatamente o que a Capability 05
(Executar Ordens de Produção) precisa consumir como ponto de partida.

## Contribuição para as perguntas executivas

- 04 — Qual o status da produção? → PARCIAL: agora diferenciamos
  Scheduled/Ready/Released.
- 06 — Quais máquinas impactam? → PARCIAL: Resource programada aparece no
  contexto de liberação.
- 02 e 10 — permanecem NÃO respondidas (pré-execução; Released By ≠
  Executed By) — corretamente, por design.
