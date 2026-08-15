# WF-001 — Evaluate Scenarios UX Refinement

## Status

Product Review candidate. No commit or push was performed.

## Naming and hierarchy

The passive **Mostrar condições** label was removed. The Hour-by-Hour header now exposes the prominent HIKARI operational CTA **Avaliar cenários**. Activating it enters **Avaliação de alternativas**; the active CTA becomes **Encerrar avaliação**.

Without a Lot, the mode instructs the user to select one. With a Lot, its header identifies Lot, Material, quantity and Scheduled Resource. Resource conditions and known impacts appear without changing the fixed DC01–DC05 order.

## Semantic distinction

- selecting a Lot opens the Lot Context Modal for Lot analysis;
- **Analisar preparação** remains the modal handoff to WF-002;
- **Avaliar cenários** observes possible Resources and known impact in the received plan;
- **Simulação ativa** exists only after entering the What-If workspace and remains distinct from evaluation.

## Gate

The refinement preserves Resource Spatial Stability, baseline immutability, simulation behavior, keyboard access, accessibility and the no-red rule.

## Candidates

- `WF-001-EVALUATE-SCENARIOS-CTA-CANDIDATE.png`
- `WF-001-EVALUATION-MODE-NO-LOT-CANDIDATE.png`
- `WF-001-EVALUATION-MODE-LOT257-CANDIDATE.png`

All artifacts remain Product Review candidates and are not marked approved.
