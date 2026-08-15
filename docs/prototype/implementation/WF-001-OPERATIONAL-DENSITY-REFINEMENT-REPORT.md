# WF-001 — Operational Density Refinement Report

Status: **CANDIDATE — NOT APPROVED**

## Implemented

WF-001 was reorganized as an operational MES workspace. The global header is 60 px high and exposes an accessible navigation drawer. The H1 became a compact operational heading; commitment, destinations, source, freshness and Schedule Version are presented as compact context instead of tall cards.

Secondary destination/scenario filters are closed by default. Compare and reset actions moved to the contextual actions menu. Data Freshness, schedule changes and attention details remain available through progressive disclosure. Primary date and shift controls remain permanently visible in a compact sticky toolbar.

## Above-the-fold measurement — 1440 × 900

| Measurement | Before | After | Improvement |
|---|---:|---:|---:|
| Plano Hora-Hora panel Y-position | 655 px | 389 px | 266 px recovered |
| Resource lanes visible without vertical scroll | partial set | DC01–DC05 | all five visible |

After refinement the lane bounds are: DC01 496–557 px, DC02 557–618 px, DC03 618–679 px, DC04 679–739 px and DC05 739–800 px.

## Preserved behavior

- 21 Lots and 1,600 pieces;
- five scheduled Resource lanes;
- three shifts and nine planned-break bands;
- four demonstrative Setup blocks;
- Current Time at 17:23 and initial 2/9 horizontal positioning;
- proportional blocks, sticky Resource labels, keyboard navigation and Lot detail;
- domain and functional boundaries already governed for WF-001.

## Candidate screenshot

`../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-OPERATIONAL-DENSITY-CANDIDATE-chromium-darwin.png`

This candidate preserves every earlier screenshot and does not change any approval baseline.
