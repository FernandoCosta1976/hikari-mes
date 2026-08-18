# Hour-by-Hour Production Plan

**Document ID:** HIKARI-FM-FOUND-003  
**Status:** CONFIRMED_FOR_PROTOTYPE

## 1. Purpose

Define how the Yamaha Hour-by-Hour Plan shall be represented in the HIKARI Foundry prototype.

## 2. Concept

The Hour-by-Hour Plan is the operational visualization of the short-term Production Schedule.

UI pt-BR name:

**Plano Hora-Hora**

The normative architectural concept remains `Production Schedule`.

## 3. Continuous timeline

The plan shall use a continuous time axis.

It shall not force Lots into rigid hourly buckets.

A Lot may start at 16:43 and finish at 17:48.

Hour boundaries are references, not mandatory start/finish boundaries.

## 4. Lot representation

Each Lot block shall be capable of communicating:

- Lot;
- Material/part;
- quantity;
- Scheduled Start;
- Scheduled Finish;
- destination;
- optional Production Order reference;
- schedule state/context.

Color must not be the only mechanism used to identify the Lot or its status.

If Yamaha color/model information is used in demonstrative data, labels must remain readable and accessible.

## 5. Temporal continuity

The visualization may show adjacent Lots where one starts at the previous Lot's Scheduled Finish.

It must also support:

- gaps;
- overlaps if demonstrative scenarios require them;
- shift boundaries;
- current-time marker in later execution views.

No gap/overlap shall be interpreted automatically as an error unless a business rule explicitly establishes that meaning.

## 6. Baseline

The received Hour-by-Hour Plan is the `Scheduled Sequence`.

When the operation resequences Lots, the prototype must preserve the original baseline.

The future operational visualization may compare:

- Sequência Planejada;
- Sequência Operacional;
- Sequência Executada.

## 7. Interaction

WF-001 shall prioritize comprehension over editing.

Selecting a Lot may open contextual detail without navigating away from the schedule.

The detail may include:

- Production Order;
- destination;
- buffer context;
- raw-material context;
- Work Center;
- reconciliation;
- planned timing.

Drag-and-drop unrestricted resequencing is not required in WF-001.

Operational resequencing shall be handled in its own experience so that impact and governance can be shown.

## 8. Business commitments

The UI must not imply that exact adherence to each scheduled minute is the sole success criterion.

For Foundry, Supervisor and Production Leader have flexibility inside the shift/day.

The experience shall progressively emphasize:

- shift quantity commitment;
- daily quantity commitment;
- buffer protection;
- downstream needs;
- operational efficiency.

## 9. Freshness

The timeline shall always be associated with:

- plan business date;
- last update date/time;
- freshness state.

If the current-day plan is missing, the UI must clearly identify the date of the displayed plan.

## 10. Demonstrative dataset

The first wireframe should include a coherent set of Lots across a working day, including:

- multiple Materials;
- at least one Production Order represented by multiple Lots;
- different destinations;
- realistic start/finish times;
- at least one buffer-related prioritization context;
- at least one scenario that later supports resequencing.

## 11. Visual principle

The Hour-by-Hour Plan must feel like an industrial scheduling experience, not a spreadsheet replica.

The Yamaha concept is preserved, but HIKARI improves comprehension through:

- time scale;
- hierarchy;
- contextual detail;
- clear commitments;
- progressive disclosure;
- traceability.
