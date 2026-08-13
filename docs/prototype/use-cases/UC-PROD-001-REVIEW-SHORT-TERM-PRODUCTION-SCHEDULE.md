# UC-PROD-001 — Review Short-Term Production Schedule

**Primary actor:** Foundry Supervisor  
**Supporting actor:** Production Leader  
**Question:** O que precisamos produzir?  
**Status:** PROTOTYPE_BASELINE

## Trigger

A new/available short-term Production Schedule must be reviewed for the selected productive area and business date.

## Preconditions

- productive area selected;
- Balancing schedule available or stale state explicitly known;
- PyMAC Production Orders available or stale state explicitly known.

## Required information

- business date;
- source freshness;
- Lots;
- Materials;
- quantities;
- Scheduled Start/Finish;
- destination;
- Work Center;
- Production Order correlation;
- shift/day totals.

## Main flow

1. User enters Programação da Produção.
2. HIKARI shows selected area and business date.
3. HIKARI shows freshness state.
4. User reviews Hour-by-Hour Plan.
5. User sees Lots in scheduled sequence.
6. User selects a Lot if more context is needed.
7. HIKARI shows Production Order correlation and destination.
8. User understands shift/day commitment.
9. User proceeds to Production Readiness when operational preparation is required.

## Alternative flows

### Today's plan not received
HIKARI explicitly identifies the last available plan and its date/time.

### PyMAC/Balancing mismatch
HIKARI flags reconciliation attention without silently correcting data.

## Outcome

Supervisor and Leader understand what must be produced and whether the information is current enough to support the next decision.

## Prototype exclusion

No real schedule ingestion or integration transaction is required.
