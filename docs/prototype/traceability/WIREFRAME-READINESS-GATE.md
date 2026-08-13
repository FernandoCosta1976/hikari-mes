# WF-001 — Wireframe Readiness Gate

**Target:** Programação da Produção / Plano Hora-Hora  
**Status:** READY_FOR_CONCEPTUAL_WIREFRAME after governance checks

## 1. Persona

Primary:
- Foundry Supervisor.

Supporting:
- Production Leader.

## 2. Dominant question

**O que precisamos produzir?**

## 3. Primary Use Case

UC-PROD-001 — Review Short-Term Production Schedule.

## 4. Mandatory information

WF-001 must include or make progressively available:

- productive area;
- business date;
- shift/day context;
- Balancing freshness;
- PyMAC freshness;
- Hour-by-Hour continuous timeline;
- Lot ID;
- Material;
- quantity;
- Scheduled Start;
- Scheduled Finish;
- destination;
- Production Order correlation;
- reconciliation state;
- day/shift commitment;
- compact current/projected buffer context;
- compact raw-material risk;
- demonstrative-data label.

## 5. Mandatory behavioral rules

- preserve Balancing Scheduled Sequence;
- do not assign Resource as if received from Balancing;
- do not force Lots into hourly buckets;
- do not treat Scheduled Start as an immutable execution deadline;
- do not count reserved Reposição/Engenharia quantities as freely available to Montagem;
- do not silently show stale data as current;
- do not use red;
- do not expose technical integration detail.

## 6. Must not dominate WF-001

- OEE;
- detailed Quality;
- detailed losses;
- bottleneck analysis;
- maintenance management;
- full BOM;
- full buffer analytics;
- Resource dispatch editor;
- strategic MES catalog;
- architecture.

## 7. Progressive disclosures

Recommended secondary interactions:

- source freshness details;
- Lot details;
- Production Order correlation;
- buffer detail;
- raw-material detail.

## 8. Scenario requirements

The demonstrative dataset should contain:

- a current-day plan;
- a stale-plan alternative;
- multiple Lots;
- at least one Production Order split into multiple Lots;
- Montagem + Reposição/Engenharia destinations;
- a Material with low current but healthy projected buffer;
- a raw-material risk;
- a reconciliation attention case.

## 9. Visual governance

Apply the HIKARI Design System Manifesto:

- T-Systems-inspired composition;
- Yamaha-inspired blue identity;
- white/neutral foundation;
- executive/industrial premium quality;
- high information density without clutter;
- no red.

## 10. Authorization

This gate authorizes conceptual wireframing only.

It does not authorize production backend engineering or real integrations.
