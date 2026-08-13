# HIKARI Prototype — Data Manifesto

## 1. Purpose

The prototype must be credible without contaminating official data or presenting fabricated numbers as plant facts.

## 2. Data classifications

Every relevant prototype datum should conceptually belong to one of these classes:

### REAL_REFERENCE
Derived from a real source/reference provided for understanding, but not necessarily live operational data.

### DEMO_SIMULATED
Explicitly fabricated for the navigable demonstration.

### DERIVED_SIMULATED
Calculated from demonstrative inputs, such as projected coverage or demonstrative OEE.

### TBD
Required concept/value whose real rule/source/value is not yet known.

## 3. Labeling

Screens using simulated operational data must display **Cenário demonstrativo** or an equivalent unambiguous indicator.

Illustrative metrics must never be presented as official measurements.

## 4. Isolation

Demonstrative data must remain isolated from official operational datasets. No prototype action may write to production data.

## 5. Internal coherence

Simulated data must be mathematically and operationally coherent.

Examples:

- Production Order quantity must reconcile to associated Lots unless a deliberate divergence scenario is being demonstrated.
- Projected buffer must reconcile with starting available quantity, applicable planned production, reservations, and future consumption.
- OEE must reconcile with Availability × Performance × Quality.
- Timeline start/finish ordering must be temporally coherent.

## 6. Reference Foundry scenario

The prototype may use Foundry DC with demonstrative Lots and Materials. A key scenario should include a PyMAC Production Order of 300 pieces correlated to three real Lots of 100 pieces each, distributed through the Plano Hora-Hora.

The three Lots need not be contiguous; they may be interleaved with other Materials to reflect operational scheduling.

## 7. Buffer reference scenario

The Foundry demonstration should represent a target of approximately three days only as a scenario/hypothesis pending Yamaha validation.

The factory produces roughly 1,400 motorcycles/day in the contextual reference, and a three-day protection concept motivates a buffer in the order of approximately 4,000 relevant pieces. The prototype must not generalize this arithmetic to every Material or area without validated BOM/demand rules.

## 8. Current and projected buffer

Current coverage uses currently available buffer inventory against future planned consumption.

Projected coverage conceptually uses:

**Available now + applicable scheduled production − future planned consumption**, respecting reservations/destination.

Exact engineering formulas, time-phasing, yield, scrap assumptions, and multi-level BOM behavior are deferred.

## 9. Demand destination

Demonstrative Lots must support destination values:

- Montagem;
- Reposição;
- Engenharia.

Montagem is priority for production continuity. Reposição and Engenharia may be physically in the same buffer but reserved/segregated.

## 10. Produced versus available

Datasets must permit Produced Quantity to differ from Available Quantity so Quality/logistics/release concepts can be represented later.

## 11. Raw material

Raw-material values may be simulated as volume/availability/risk. Do not simulate a full MRP engine.

## 12. Downstream projection

Machining projected consumption/capacity may be simulated and must be labeled demonstrative. Future HIKARI evolution is expected to supply this information natively as downstream areas are incorporated.

## 13. Freshness dataset

Each planning source should have:

- source name;
- business date/version where useful;
- last updated date/time;
- freshness status;
- expected-update-missing flag or equivalent.

At minimum, Balancing and PyMAC are represented separately.

## 14. Stale-data scenario

The demo dataset must support a scenario where the current-day update has not been received and the UI displays the last available previous-day information without disguising it as current.

## 15. Reset

Demo state must support reset to a known baseline so the executive narrative can be repeated reliably.
