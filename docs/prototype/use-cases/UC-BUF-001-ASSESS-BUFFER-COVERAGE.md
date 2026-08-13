# UC-BUF-001 — Assess Buffer Coverage

**Primary actor:** Foundry Supervisor  
**Supporting actors:** Production Leader, Production Manager  
**Question:** Temos peças suficientes para proteger a cadeia?  
**Status:** PROTOTYPE_BASELINE

## Required information

- Material;
- Produced Quantity;
- On-Hand Quantity;
- Available Quantity;
- Reserved Quantity;
- future scheduled production;
- future Balancing consumption;
- current coverage;
- projected coverage;
- target/reference coverage;
- destination.

## Main flow

1. User reviews Material buffer health.
2. HIKARI distinguishes physical, reserved and available quantities.
3. Current coverage is shown.
4. Scheduled production is incorporated into projection.
5. Future consumption is deducted.
6. Projected coverage is shown.
7. User identifies shortage/excess risk.
8. User may return to scheduling/resequencing decision.

## Outcome

The operation understands whether the production plan protects downstream consumption.

## Rule

Production for Reposição/Engenharia must not be counted as freely available to Montagem.
