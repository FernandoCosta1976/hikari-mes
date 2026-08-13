# HIKARI Executive Prototype — Master Manifesto

## 1. Purpose and normative status

This document is the constitutional manifesto for the HIKARI MES Executive Prototype. Every prototype requirement, screen, interaction, simulated dataset, persona, use case, domain object, visual component, and implementation decision MUST conform to this manifesto and to the specialized governance documents referenced herein.

The prototype is not the production implementation of HIKARI MES. It exists to make the proposed operating model tangible, navigable, discussable, and testable with industrial stakeholders before Product Engineering.

Its lifecycle is:

**PROTOTYPE → DEMONSTRATE → DISCUSS → VALIDATE → APPROVE**

The prototype MUST demonstrate WHAT the solution enables, WHO interacts with it, WHEN interaction occurs, WHAT decision is supported, WHAT information is needed, and WHAT business outcome is expected. It MUST deliberately avoid exposing HOW proprietary technical implementation will be constructed.

## 2. Executive objective

The primary executive stakeholder is the Industrial Director. The prototype must enable rapid understanding of:

- how HIKARI will operate in the factory;
- how production planning becomes controlled execution;
- how CORE, ESSENTIAL and OEE appear in the experience;
- how specialized MES modules collaborate as one corporate platform;
- how operational decisions are supported from shop floor to executive level;
- how the first wave creates reusable corporate capabilities;
- how HIKARI improves operational efficiency visibility;
- how HIKARI improves predictability of what must be produced and whether the plan can be fulfilled.

The two dominant executive questions are:

1. **What is our operational efficiency?**
2. **Do we have predictability that we will produce what is required?**

## 3. Program positioning

HIKARI is not an isolated software deployment. It is a **Corporate Framework for MES Platform Deployment and Evolution**.

The permanent logic is:

Operational Need → Strategic Pain → Corporate Capability → MES Function → Master Catalog → Prioritization → Wave → Deployment → Stabilization → Evolution.

No local demand should create an isolated solution. Local needs must be analyzed and converted into reusable, governed corporate capabilities whenever applicable.

## 4. First-wave positioning

The first wave establishes the operational foundation of MES through:

**CORE + ESSENTIAL required for stabilization + minimum capabilities/data required for OEE.**

OEE is not an isolated dashboard product. It is the consequence of trustworthy execution, confirmation, event, availability, performance, quality, and production data.

Foundation → Digital Operation → Reliable Data → Indicators → OEE.

Priorities MUST always appear in this order:

1. CORE
2. ESSENTIAL
3. IMPORTANT
4. COMPLEMENTARY

The prototype focuses on CORE, ESSENTIAL, and OEE. IMPORTANT and COMPLEMENTARY may be shown only as future evolution where useful.

## 5. MES Blueprint

The nine official MES stages MUST preserve code, name, and order:

01 — Planning and Sequencing
02 — Reprioritization / Line Planning
03 — Dispatching / Release
04 — Execution and Confirmation
05 — Status / WIP / Events
06 — Adherence / Deviations / Bottlenecks
07 — Quality / Losses / Performance
08 — Traceability / Genealogy / Integration
09 — Dashboards / Governance / Analytics

## 6. MES disciplines

The eight official disciplines are:

- Production
- Resources
- Materials
- Quality
- Performance
- Documentation
- Competencies
- Events

The functional hierarchy is:

Discipline → Theme → Capability → MES Function → Functionality → Elementary Functionality.

The **Events discipline** is a functional domain. It MUST NOT be confused with the **Corporate Event Service**, which is a transversal technical integration mechanism.

## 7. Factory and reference scenario

The factory context includes Foundry DC, Foundry LP, Machining, Engine Assembly, Final Assembly Line C, Final Assembly Line D, Painting, Stamping, and Welding, among other areas.

The prototype reference scenario is Foundry, with Foundry DC as the proposed initial materialization. This is a scenario for validation, not a final deployment commitment.

The beginning of the relevant value chain is represented conceptually as:

**Foundry → Finished Goods Buffer → Machining → Aluminum Painting → Engine Assembly → Final Assembly.**

The prototype must preserve the fact that Foundry produces injected parts that will be consumed downstream days later.

## 8. Primary operational narrative

The prototype must tell a story, not expose a menu catalog:

1. The production need is planned.
2. HIKARI receives the short-term production schedule and production orders.
3. The operation understands what must be produced.
4. The operation evaluates readiness and constraints.
5. Supervisor and Production Leader organize the best operational execution.
6. Lots are assigned and dispatched to eligible resources.
7. Production is executed and confirmed.
8. Events, WIP, losses, quality and deviations are observed.
9. Buffer and downstream protection are monitored.
10. Operational data is converted into adherence, performance and OEE.
11. Executives receive efficiency and predictability.
12. The platform evolves by reusable waves.

## 9. Business-question-driven experience

Every experience MUST begin with a business question. The prototype must progressively answer questions such as:

- What do I need to produce?
- Do I have the conditions to produce it?
- Is this the best operational sequence?
- Where should I produce it?
- Am I fulfilling the plan?
- How much did I produce?
- How much did I lose?
- Has production quality deteriorated?
- Where is my bottleneck?
- Am I efficient?
- How healthy is the buffer?
- If I execute this plan, will the buffer remain protected?
- Will the downstream process be able to consume what I produce?
- Will we be able to fulfill the next days' demand?

A screen MUST NOT exist merely because a dataset exists.

## 10. Prototype fidelity

The prototype is **HIGH-FIDELITY VISUAL + LOW-FIDELITY BACKEND**.

Visual behavior must resemble a credible premium industrial product. Backend behavior is simulated and isolated. No production persistence, real integration, production database, or irreversible dependency is required.

## 11. Data isolation

Demonstrative scenarios MUST NOT write to official operational data. Prototype state must be isolated and resettable. Demonstrative data must be explicitly distinguishable from real/reference data.

## 12. Global productive-area context

Productive Area is a global application context. A selection such as **Foundry DC** must persist while navigating the prototype until explicitly changed or the demonstration state is reset.

## 13. Visual identity

The prototype must use the T-Systems institutional website as a structural and editorial design reference, while maintaining HIKARI/Yamaha-inspired blue identity. It must be clean, premium, industrial, corporate, graphical, and executive.

Red is prohibited in the HIKARI prototype. Attention and criticality must be communicated through orange, typography, iconography, borders, contrast, patterns, and explicit language.

## 14. Confidentiality boundary

The executive prototype MAY show capabilities, user interactions, operational flows, module collaboration, business outcomes, qualitative impacts, and simulated behavior.

It MUST NOT expose event contracts, payloads, APIs, endpoints, schemas, topics, queues, broker technology, physical database models, proprietary algorithms, infrastructure architecture, detailed APF, detailed sizing, detailed effort, or implementation internals.

## 15. Governance hierarchy

When rules conflict, Codex must apply this order:

1. Master Manifesto
2. Confirmed domain/decision records
3. Architecture Manifesto
4. Domain and Terminology Manifesto
5. Persona and Use Case governance
6. Experience and Interaction Manifestos
7. Design System Manifesto
8. Prototype Data and Demo Narrative Manifestos
9. Local screen/component instructions

A local implementation request cannot silently override a higher-level rule.

## 16. Definition of success

The prototype succeeds when the Industrial Director can say, in substance:

**“Now I can visualize how this platform will work in the factory.”**

It fails if the dominant impression is:

**“This is another system full of screens.”**
