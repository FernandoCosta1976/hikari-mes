# WF-001 — Hour-by-Hour Timeline

## 1. Role

The timeline is the primary visual representation of the received short-term Production Schedule.

It shall feel closer to an industrial scheduling board/Gantt timeline than to a spreadsheet.

## 2. Time axis

Use a continuous horizontal time scale.

Examples of axis markers:

16:00 | 17:00 | 18:00 | 19:00

A Lot can start/end between markers.

Example:

**Lot 252 · 16:43 → 17:48**

The visual block begins and ends proportionally within the continuous scale.

## 3. Row strategy

Recommended initial model:

**one lane per operational planning context / Work Center**

For the Fundição DC prototype, a single dominant lane may be sufficient if the received schedule is at Work Center level.

Do not create machine lanes before Resource assignment.

Specific Resources belong to later Dispatching.

Fundição DC has five confirmed Resources (`DC01`–`DC05`), but their existence does not authorize five lanes. Whether the received schedule can contain parallel planning sequences is [TBD](../../domain-questions/DQ-WF001-001-PARALLEL-SCHEDULE.md); the current single lane is a demonstrative scenario, not a final rule for all Balancing schedules.

## 4. Lot blocks

Lot blocks are ordered according to the Scheduled Sequence received from Balancing.

The timeline shall preserve this baseline.

## 5. Current-time marker

For Today, a subtle current-time marker may be displayed.

It must not imply real-time integration when the dataset is demonstrative.

If used in demo mode, label the simulated current time or anchor the scenario clock.

## 6. Shift boundaries

Shift boundaries may be shown as subtle separators after Yamaha shift rules are confirmed.

Until then, use demonstrative boundaries only when required by the scenario.

## 7. Sequence position

Sequence may be communicated through:

- left-to-right ordering;
- optional small sequence number;
- Lot ID.

Do not rely only on color.

## 8. Timeline scale behavior

Allow enough scale for labels to remain readable.

If the full day cannot fit:

- horizontal navigation/zoom may be used;
- provide a clear current/selected time window;
- do not compress Lot labels into illegibility.

## 9. Planned versus operational sequence

WF-001 shows Scheduled Sequence.

Later Operational Rescheduling may overlay/compare Dispatched Sequence.

Do not prematurely add drag-and-drop editing to the baseline timeline.

## 10. Gaps

A visual gap means only that no Lot occupies that planned interval in the displayed schedule.

It shall not automatically be labeled loss, downtime or inefficiency.

## 11. Overlap

If a demonstrative schedule contains overlap, the visualization must represent it without automatically declaring invalidity.

The domain rule governing overlap is not defined here and is governed as an open question in [DQ-WF001-001-PARALLEL-SCHEDULE](../../domain-questions/DQ-WF001-001-PARALLEL-SCHEDULE.md).

## 12. Selection

Selecting a Lot:

- visually focuses the block;
- opens Lot Detail;
- preserves timeline context;
- does not navigate away.

## 13. Accessibility

Selected/focused states must use:

- border;
- elevation;
- icon/text;
- not color alone.

## 14. Performance expectation

Even as a prototype, the timeline should remain fluid with the demonstrative daily Lot volume.

Do not over-animate block rendering.
