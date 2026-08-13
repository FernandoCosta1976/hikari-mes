# WF-001 — Lot Visual Model

## 1. Lot as primary unit

The Lot is the primary visual unit of the Hour-by-Hour Plan.

A Production Order is contextual, not the dominant timeline object.

## 2. Minimum visible information

When space permits, a Lot block should show:

**Lot 252**  
Material / part short label  
**100 peças**  
16:43–17:48

Destination may be represented through a concise label/badge.

## 3. Compact representation

At narrower block widths, preserve:

1. Lot ID;
2. quantity;
3. timing via tooltip/detail if necessary.

Material may move to contextual detail only when the block cannot support it.

## 4. Destination

UI labels:

- Montagem;
- Reposição;
- Engenharia.

Destination must not be encoded only by background color.

Use a text badge/icon treatment.

## 5. Status versus destination

Do not use the same visual channel to communicate both destination and status.

For example, if a badge communicates destination, border/icon may communicate attention.

## 6. Color policy

CORE/ESSENCIAL priority colors are not Lot-status colors.

Do not reuse architectural priority colors arbitrarily for schedule states.

No red.

## 7. Material identity

Material must have a stable readable identifier/name.

Do not invent cryptic codes solely for visual realism.

If real/proprietary Material codes are not appropriate for demonstration, use neutral demonstrative codes and label the dataset as simulated.

## 8. Production Order context

Production Order may appear:

- in Lot drawer;
- on hover/tooltip;
- as subtle secondary line if space permits.

Do not visually replace Lot with Production Order.

## 9. Attention state

A Lot may have contextual attention:

- raw material;
- reconciliation;
- buffer;
- source uncertainty.

Use a compact attention marker.

Selecting the marker must explain the reason.

## 10. Hover

Hover may reveal:

- exact Scheduled Start/Finish;
- Material;
- quantity;
- destination.

Hover cannot be the only way to access essential information.

## 11. Selected state

Selected Lot should have strong but elegant focus.

Selection opens contextual detail while maintaining timeline orientation.
