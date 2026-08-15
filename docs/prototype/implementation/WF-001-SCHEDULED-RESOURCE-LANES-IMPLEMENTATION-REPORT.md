# WF-001 — Scheduled Resource Lanes Implementation Record

**Status:** CANDIDATE FOR PRODUCT REVIEW
**Date:** 2026-08-14

## Change

WF-001 moved from a single Work Center schedule lane plus compact Resource landscape to a five-lane `Resource × Time × Lot` Hour-by-Hour Plan.

## Demonstrative Distribution

| Lot | Material | Quantity | Destination | Scheduled Resource | Start | Finish | Production Order |
|---|---|---:|---|---|---|---|---|
| 251 | Material A | 100 | Montagem | DC01 | 16:43 | 17:48 | 4500123 |
| 252 | Material A | 100 | Montagem | DC03 | 16:50 | 17:55 | 4500123 |
| 253 | Material A | 100 | Montagem | DC05 | 17:10 | 18:15 | 4500123 |
| 254 | Material B | 100 | Reposição | DC02 | 18:00 | 19:05 | 4500156 |
| 255 | Material B | 100 | Reposição | DC03 | 18:10 | 19:15 | 4500156 |
| 256 | Material C | 100 | Engenharia | DC04 | 18:20 | 19:25 | 4500188 |

All values are demonstrative. Lots on different Resources overlap intentionally; Lots on the same Resource do not overlap.

## Eligibility Projection

- Material A → DC01, DC03, DC05;
- Material B → DC02, DC03, DC05;
- Material C → DC01, DC04.

The schedule has zero eligibility violations. Eligibility remains distinct from Availability.

## Removed Redundancy

The rendered compact **Agora na Fundição / Máquinas da Fundição DC** landscape was removed because DC01–DC05 are now explicit timeline lanes. Its source files and historical screenshots remain preserved.

## Current Time Visual Refinement

The timeline uses the deterministic demonstrative `currentScenarioTime` value **17:23**. Its marker uses the same temporal-position mathematics as Scheduled Lots and crosses the common time axis and all five Resource lanes.

The marker is a visual reference only:

- Current Time Marker ≠ Execution Status;
- Current Time Marker ≠ Actual Sequence;
- intersection with a Lot does not mean that the Lot is executing;
- the marker is omitted when scenario time falls outside the visible range.

The architecture may later distinguish Current Time, Planned and Actual layers, but only Current Time and Planned are represented here; Actual is not implemented.

## Open Items

- source/owner of Scheduled Resource;
- Balancing parallel schedule format and semantics;
- residual WF-003 Resource Orchestration responsibility;
- future treatment of Resource changes between Schedule Versions.
