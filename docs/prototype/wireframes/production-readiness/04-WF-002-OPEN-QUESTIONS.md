# WF-002 — Open Questions

**Status:** CONSOLIDATED CONCEPTUAL GATE

Open questions are classified by the earliest artifact they block. A question in a later class does not automatically block the current conceptual design.

## Blocks Conceptual Design

**None identified.**

The dominant question, actors, responsibility, experience boundary, inputs, primary visualization direction, granularity and WF-003 handoff can be reviewed conceptually while unresolved productive semantics remain explicit.

Product Owner decisions required to freeze the conceptual design, but not to produce it:

1. approve or revise the hybrid constraint-first visualization;
2. approve `Both` as the readiness granularity;
3. approve Material Staging as PRIMARY FOR WF-002 for the first Readiness experience; this is experience-design priority only;
4. approve the provisional presentation vocabulary or keep it explicitly TBD;
5. approve the future handoff wording to WF-003;
6. confirm whether Supervisor and Leader need only shared assessment, consistent with current evidence.

## Blocks Demo Fixture

These must be defined before creating demonstrative WF-002 values or behavior:

1. Which readiness dimensions are included in the first demo scenario?
2. Which explicitly simulated rule produces each dimension observation and Lot summary?
3. Which values represent Current Condition and Required Condition without resembling official Yamaha master data?
4. Which scheduled time reference is used for future Resource Availability?
5. How are Unknown, Not Evaluated, unavailable and stale evidence demonstrated?
6. Which provisional tool/mold identifiers and Setup implications are safe to simulate?
7. Which material-availability and staging facts are sufficient without reproducing MRP/WMS?
8. Is a minimal capacity constraint included or omitted from the first scenario?
9. Is downstream context absent or included as explicitly simulated HIKARI scenario data?
10. Which freshness timestamps/states are fixed for each dimension?
11. How does an unresolved parallel schedule affect the selected demo Lot context?
12. Which visual candidate states are accepted for fixture testing without canonizing a lifecycle?

## Blocks Productive Model

1. DQ-MRE-001: authoritative eligibility-definition basis, owner, source and effectivity.
2. Authoritative Resource master-data source.
3. Productive definition of Resource Availability, including future availability and commitments.
4. Current Resource State owners, sources and valid Yamaha vocabulary.
5. Production Tool master, compatibility, location, installation and usability sources.
6. Governed Setup/Changeover semantics, matrix and duration rules.
7. Maintenance restriction source, classification and time validity.
8. Material Availability, Reservation, Staging and Floor Stock sources and sufficiency rules.
9. BOM/conversion basis needed to relate Scheduled Quantity to raw-material requirement.
10. Resource-capacity model, calendars, rates and quantity × time semantics.
11. Downstream capacity/consumption ownership and time model.
12. Productive Readiness aggregation, mandatory dimensions and exception rules.
13. Normative Readiness status/lifecycle and relationship to Release.
14. Source-specific Data Freshness SLA and validity policy.
15. DQ-WF001-001: parallel schedule meaning and identifier.
16. Lot × SFC / Execution Control Unit relationship before execution engineering.
17. Operation/Operation Activity mapping and applicability to eligibility/readiness.
18. Organizational authority for acknowledgement, override or exception, if any.
19. Auditability, versioning and reassessment behavior after Schedule Version changes.
20. Standard MES Function Catalog and definitive function-level traceability.

## Questions That Must Not Be Resolved by WF-002

- which Resource is selected;
- operational Lot sequence;
- Dispatch or Release authorization;
- execution lifecycle;
- Production Confirmation details;
- Quality Disposition;
- OEE or efficiency rules.

These belong to later governed capabilities.
