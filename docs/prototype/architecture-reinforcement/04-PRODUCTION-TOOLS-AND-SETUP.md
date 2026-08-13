# Production Tools and Setup / Changeover

**Document ID:** HIKARI-ARCH-RF-004  
**Status:** REQUIRED_DOMAIN_REINFORCEMENT

## 1. Canonical concept

`Production Tool`  
UI pt-BR: **Molde / Ferramental**

A Material/Operation may require a Production Tool, and a tool may be compatible with specific Resources.

## 2. Operational rule

Supervisor and Production Leader deliberately organize Lots to reduce unnecessary mold/tooling changes.

## 3. Setup / Changeover

Canonical concepts:
- `Setup`;
- `Changeover`.

UI may use **Setup / Troca de Molde**, subject to Yamaha terminology validation.

## 4. Light first-wave model

HIKARI may initially show:
- current tool;
- required tool;
- same tool / change required;
- qualitative Setup impact;
- Resource compatibility.

It does not need a full tooling-management application.

## 5. Setup Matrix

Future concept:

**Previous setup state × next setup state → changeover requirement/time**

Do not invent official durations or matrices.

## 6. APS boundary

Sequence-dependent changeover optimization may belong to APS/Balancing. HIKARI can expose Setup impact for local shop-floor decisions without claiming global optimization.
