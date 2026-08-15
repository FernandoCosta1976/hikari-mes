# Production Monitoring — Minimum Demonstrative Model

Capability 06 observa fatos da execução sem controlar a execução e sem interpretar aderência.

## Production Event

- `eventId`
- `resourceId`
- `lotId`
- `eventType`
- `startedAt`
- `endedAt`, quando encerrado
- duração derivada de timestamps e do Current Time
- `status`: `ACTIVE` ou `CLOSED`

Tipos demonstrativos: `MATERIAL`, `MACHINE_ADJUSTMENT`, `TOOLING`, `QUALITY` e `OTHER`. A taxonomia é `DEMONSTRATIVE / BUSINESS VALIDATION REQUIRED`.

## Fronteiras

- Scheduled permanece diferente de Actual.
- WIP não representa estoque disponível.
- Produced Quantity não representa quantidade boa, disponível ou aceita.
- Progresso de quantidade não representa Performance, Efficiency ou OEE.
- Capability 06 produz fatos; Capability 07 interpretará aderência, desvios e gargalos.

## Cadeia futura

Execution Facts + Production Events + Time → Future Availability.

Planned Quantity + Produced Quantity + Time + Future Ideal Cycle → Future Performance.

Produced Quantity + Future Good / Reject / Rework → Future Quality.

Availability × Performance × Quality → Future OEE.
