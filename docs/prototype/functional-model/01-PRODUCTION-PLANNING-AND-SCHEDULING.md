# Production Planning and Scheduling — Foundry

**Document ID:** HIKARI-FM-FOUND-001  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define how HIKARI receives, preserves, correlates and presents the short-term production requirement for the Foundry without taking over the planning responsibilities of Balancing or PyMAC/MRP.

## 2. System responsibilities

### Balancing

Balancing is the source of the short-term Production Schedule used as the operational planning baseline.

For the prototype, the schedule contains sufficient information to identify:

- Lot;
- Material/model;
- Quantity;
- Sequence;
- Scheduled Start;
- Scheduled Finish;
- Work Center/line;
- Demand Destination.

Balancing already provides start and finish times. HIKARI shall not claim to calculate the original Hour-by-Hour Plan.

The schedule does not imply specific Resource assignment. Fundição DC contains Resources DC01–DC05, but whether Balancing may provide simultaneous planned Lots without distinguishing Resources or another planning context remains [TBD](../domain-questions/DQ-WF001-001-PARALLEL-SCHEDULE.md).

### PyMAC/MRP

PyMAC provides Production Orders and material-requirement planning context.

A PyMAC Production Order may consolidate quantities required for a day.

Example:

Production Order PO-4500123 = 300 pieces.

The short-term schedule may represent that quantity through three real Lots:

- Lot 251 = 100;
- Lot 252 = 100;
- Lot 253 = 100.

### HIKARI

HIKARI shall:

1. receive or simulate both perspectives;
2. correlate Production Orders with Lots;
3. preserve the original schedule;
4. identify quantity reconciliation;
5. present the Hour-by-Hour Plan;
6. provide operational context;
7. support later resequencing and dispatching;
8. preserve traceability between planned, dispatched and actual execution.

HIKARI shall not collapse the Lots back into a single order-level sequence.

## 3. Primary actors

- Foundry Supervisor;
- Production Leader.

Secondary consumers:

- Production Manager;
- Industrial Director, through aggregated/projection views;
- PCP/planning roles, when applicable.

## 4. Primary business question

**O que precisamos produzir?**

Supporting questions:

- Quais Lots estão previstos hoje?
- Qual a quantidade de cada Lot?
- Qual o horário planejado?
- Qual a Production Order associada?
- Qual o destino da produção?
- Quanto precisamos entregar no turno?
- Quanto precisamos entregar no dia?
- O plano recebido está atualizado?
- PyMAC e Balancing estão conciliados?

## 5. Planning baseline versus operational execution

The Balancing sequence is a baseline and shall remain visible/recoverable.

The Foundry has operational freedom to reorganize execution within the shift/day.

Therefore, the schedule screen shall not imply that missing an exact Scheduled Start automatically represents noncompliance.

Later adherence rules shall distinguish:

- schedule timing deviation;
- sequence deviation;
- quantity commitment;
- shift commitment;
- daily commitment;
- buffer protection.

## 6. Reconciliation

The prototype must support a reconciliation concept between:

**Production Order Planned Quantity**

and

**Sum of correlated Lot Scheduled Quantities**

Possible prototype states:

- reconciled;
- quantity mismatch;
- Lot without correlated Production Order;
- Production Order without scheduled Lots;
- source not updated.

No automatic correction shall be simulated without an explicit scenario.

## 7. Horizon

The detailed operational view shall prioritize **Today**.

Future horizons may include:

- D+1;
- D+2;
- D+3.

Today uses detailed Hour-by-Hour representation.

Future days may use less granular aggregated views unless a use case requires detail.

## 8. Required information for WF-001

At minimum:

- Area: Fundição DC;
- business date;
- current shift or all shifts;
- data freshness;
- Lots;
- Material;
- quantity;
- Scheduled Start;
- Scheduled Finish;
- destination;
- Production Order;
- reconciliation state;
- daily/shift totals;
- current/projected buffer contextual signal;
- raw-material risk signal.

## 9. Explicit exclusions

WF-001 shall not become:

- OEE dashboard;
- Quality cockpit;
- maintenance screen;
- detailed Resource scheduler;
- APF view;
- architecture diagram;
- MES catalog screen;
- technical integration monitor.

Until the parallelism question is validated, WF-001 shall not infer `DC01`–`DC05` as timeline lanes. Its current single-lane scenario is demonstrative and does not establish the universal cardinality of the received schedule.

## 10. Prototype scenarios

The dataset should include:

1. normal reconciled plan;
2. one Production Order split across multiple Lots;
3. at least one Spare Parts or Engineering Lot;
4. one low-current-buffer Material whose scheduled production recovers projected coverage;
5. one raw-material risk;
6. a stale-source scenario;
7. a PyMAC/Balancing mismatch scenario.

All must be labeled as demonstrative when not sourced from validated operational data.
