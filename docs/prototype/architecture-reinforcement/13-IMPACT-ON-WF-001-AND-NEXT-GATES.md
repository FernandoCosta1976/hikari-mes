# Impact on WF-001 and Next Gates

**Document ID:** HIKARI-ARCH-RF-013  
**Status:** DESIGN_REVIEW_INPUT

## 1. WF-001 remains valid in purpose

WF-001 continues to be:

**Production Scheduling / Programação da Produção / Plano Hora-Hora**

Dominant question:

**O que precisamos produzir?**

## 2. Required V0.2 corrections

- keep the received schedule at Work Center level;
- do not show machine/Resource lanes as if received from Balancing;
- use Yamaha Lot as primary timeline object;
- preserve Production Order correlation;
- allow detail to say Resource = not yet assigned;
- make Freshness extensible to Schedule Version;
- use inventory-derived buffer semantics;
- keep Readiness secondary;
- do not equate Produced and Available.

## 3. Concepts that should remain hidden from WF-001 unless needed

- full Routing;
- SFC;
- full Operation hierarchy;
- Material Staging details;
- Floor Stock details;
- Quality Disposition;
- execution lifecycle;
- genealogy.

Architecture correctness must not create UX overload.

## 4. Gate before WF-002

Define the minimal Readiness representation for:
- Resource Eligibility;
- Resource Availability;
- Production Tool;
- Setup;
- Material Availability/Staging;
- readiness state.

## 5. Gate before Dispatching

Preserve:
- Work Center versus Resource;
- Scheduled Sequence versus Dispatched Sequence;
- tool/Setup context;
- Supervisor/Leader authority.

## 6. Gate before Execution

Resolve:
- Execution Control Unit / Lot↔SFC mapping;
- Release semantics;
- execution lifecycle;
- Operation/Operation Activity mapping;
- Production Confirmation unit.

## 7. Gate before Quality/Buffer operationalization

Validate:
- Quality Disposition;
- Hold/Blocked inventory;
- available-quantity rule;
- authoritative inventory source.

## 8. Superseded visual-approval gate

The former instruction to produce and approve WF-001 V0.2 before code is superseded by `docs/prototype/governance/14-WF001-DOCUMENTATION-GATE-DECISION.md` and the approved V1.0 visual baseline.

WF-001 is eligible for implementation planning. Implementation itself still requires a separate explicit instruction and must preserve all Group 05 architectural corrections.
