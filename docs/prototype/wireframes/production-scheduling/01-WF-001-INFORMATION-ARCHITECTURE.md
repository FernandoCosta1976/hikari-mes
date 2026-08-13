# WF-001 — Information Architecture

## 1. Information hierarchy

### Level 0 — Persistent application context
Always visible:

- HIKARI identity;
- Productive Area selector;
- current prototype/demo indication where applicable.

### Level 1 — Decision context
Highly visible:

- Programação da Produção;
- business date;
- shift/horizon;
- freshness state.

### Level 2 — Commitment
Compact summary:

- planned quantity;
- number of Lots;
- shift/day commitment;
- destination composition when useful.

### Level 3 — Hour-by-Hour Plan
Dominant visual object:

- continuous timeline;
- scheduled Lots;
- time scale;
- sequence.

### Level 4 — Attention context
Visible but subordinate:

- reconciliation;
- raw-material risk;
- buffer signal;
- stale source.

### Level 5 — Progressive detail
Opened only when requested:

- Lot details;
- Production Order correlation;
- source freshness detail;
- buffer detail;
- material-risk detail.

## 2. Global Productive Area

The Productive Area selector is global.

Example:

**Área Produtiva · Fundição DC**

Changing the area must update the entire demonstrative context consistently.

The prototype may initially implement only coherent data for Fundição DC while exposing other areas as future/demo-disabled choices if needed.

It must not fabricate complete operational datasets for every area merely to populate the selector.

## 3. Date and horizon

The first view defaults to **Hoje**.

Recommended navigation:

- D-1;
- Hoje;
- D+1;
- D+2;
- D+3.

Today has detailed timeline.

Future days may initially remain demonstrative/summary if the prototype dataset does not justify full detail.

## 4. Shift context

The user may need:

- Dia completo;
- current shift;
- specific shift.

Exact Yamaha shift definitions/times are not confirmed in this group. Codex shall not invent them as official rules.

Prototype scenarios may use clearly demonstrative shift labels/times.

## 5. Navigation relationship

Primary next experience:

**Preparação para Produção**

Secondary future path:

**Organizar Sequência**

WF-001 must not force the user into the next screen merely to inspect Lot details.

## 6. Progressive disclosure

Secondary information must appear through contextual panel/popover/drawer rather than permanently consuming timeline space.

## 7. Information priority rule

When space is constrained, preserve in this order:

1. Lot identity;
2. Material;
3. quantity;
4. scheduled timing;
5. destination;
6. attention state;
7. Production Order;
8. secondary metadata.
