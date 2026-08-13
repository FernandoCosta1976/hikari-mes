# Resource Orchestration

**Document ID:** HIKARI-ARCH-RF-003  
**Status:** CANONICAL_CAPABILITY

## 1. Purpose

Consolidate Readiness, operational Rescheduling and Dispatching under a market-aligned MES capability.

## 2. Canonical concept

`Resource Orchestration`

It is an architectural capability, not necessarily a menu name.

## 3. HIKARI light scope

- Resource Eligibility;
- Resource Availability;
- Production Tool context;
- Setup / Changeover context;
- Labor/Competency context when needed;
- Operational Rescheduling;
- Resource Assignment;
- Dispatching;
- preparation for Release.

## 4. Primary personas

Foundry Supervisor and Production Leader.

## 5. Boundary

Balancing provides the short-term baseline at Work Center/line level. HIKARI adapts the baseline to shop-floor reality; it does not replace Balancing.

For Fundição DC, the confirmed physical Resources are **DC01, DC02, DC03, DC04 and DC05**. Balancing does not assign these Resources to Lots in the currently known scenario. Foundry Supervisor and Production Leader later transform the Scheduled Requirement into an Operational Resource Assignment and Dispatched Sequence.

The possible existence and business meaning of parallel planned sequences remains [TBD](../domain-questions/DQ-WF001-001-PARALLEL-SCHEDULE.md). “Schedule Stream” is only a provisional discussion label and is not introduced as a canonical capability or term.

## 6. Decision sequence

For each Lot/Operation:
1. identify eligible Resources;
2. identify constraints;
3. assess tool/Setup context;
4. assess material/readiness;
5. consider buffer/demand priority;
6. decide operational sequence;
7. select Resource;
8. Dispatch;
9. Release when conditions permit.

## 7. No optimization claim

Wave 1 is decision support. Do not use “optimal”, “AI optimized” or “globally optimized” unless such capability is explicitly approved later.
