# HIKARI Prototype — Personas Manifesto

## 1. Purpose

HIKARI must support decisions across the manufacturing organization, from shop-floor execution to executive governance. Personas are not decorative user profiles; they define information needs, decision rights, cognitive load, interaction moments, and appropriate level of detail.

Every major experience must identify its primary and supporting personas.

## 2. Persona design principle

A persona is modeled as:

**Role → responsibility → business questions → decision moment → required information → permitted interaction → escalation/hand-off.**

Screens MUST NOT be designed only around organizational titles.

## 3. Operator

### Mission
Execute assigned production safely and correctly and provide reliable actual-production information.

### Dominant questions
- What do I need to produce now?
- Which Lot am I executing?
- On which Resource?
- What quantity is required?
- What is the expected sequence?
- Is there any instruction/restriction I need to know?
- How much have I already produced?
- What do I do if execution is interrupted?

### Primary moments
Execution, production confirmation, operational event reporting, completion.

### Information level
Immediate, contextual, action-oriented. The Operator should not be forced to interpret strategic dashboards or scheduling complexity.

### Expected interactions
Start/pause/resume/finish conceptual execution, confirm quantity, report event/exception where applicable, view current work context.

## 4. Production Leader

### Mission
Coordinate the shift execution, maintain flow, support Resource assignment and respond to operational deviations.

### Dominant questions
- What must be produced this shift?
- What is being produced now?
- Are we fulfilling the plan?
- Which Lot should go next?
- Where is intervention needed?
- Which Resources are available?
- Can we reduce Setup?
- Is a constraint threatening the shift commitment?

### Primary moments
Schedule review, readiness, rescheduling, dispatching, execution monitoring, deviation handling.

### Collaboration
Works jointly with the Foundry Supervisor on Resource assignment and operational sequence.

## 5. Foundry Supervisor

### Mission
Transform the planning baseline into an executable operational plan while protecting daily/shift commitments, efficiency, buffer, material availability, and downstream flow.

### Dominant questions
- What do we need to produce?
- Is this the best operational sequence?
- Which Resource should produce each Lot?
- Can we reduce Setup without compromising commitments?
- Do we have raw material?
- How is the finished-parts buffer?
- If we execute this plan, will buffer coverage remain protected?
- Can the next area consume what we plan to produce?
- Are we likely to meet the shift/day target?
- What requires action now?

### Primary moments
Production Schedule review, Production Readiness, Rescheduling, Dispatching, Buffer review, operational monitoring.

### Decision rights in prototype
May jointly organize/resequence Lots and select Resources with the Production Leader. May not be assumed to have authority for cross-area reservation reallocation approval until validated.

## 6. Technician

### Mission
Resolve or support technical conditions that restrict production Resources, tooling, equipment, or process execution.

### Dominant questions
- What technical condition is preventing execution?
- Which Resource is affected?
- Which Lots are at risk?
- What is the production impact?
- Is there an alternative eligible Resource?
- What intervention is required?

### Primary moments
Readiness restrictions, events, maintenance-related constraints, technical deviations.

## 7. Manufacturing / Process Engineer

### Mission
Analyze recurring process behavior, structural constraints, capacity, performance degradation, and opportunities for process improvement.

### Dominant questions
- Where are structural constraints recurring?
- Which setups or sequences create avoidable loss?
- Where is capacity being consumed?
- Which Resources/material families show recurring deviations?
- What is degrading performance?
- What should be improved in the operating model?

### Primary moments
Performance analysis, bottleneck analysis, historical deviation analysis, capability evolution.

## 8. Quality

### Mission
Protect product/process quality and ensure that only acceptable output is treated as available for downstream consumption.

### Dominant questions
- Has production quality deteriorated?
- How much is good production?
- How much was scrapped?
- How much requires rework?
- Is any quantity blocked/not yet available?
- Which Lot/Material/Resource is affected?
- Can the produced quantity enter the downstream buffer?

### Primary moments
Quality/performance, availability release context, deviation analysis.

### Critical domain impact
Produced Quantity must not automatically be interpreted as Available Quantity.

## 9. Production Manager

### Mission
Ensure area performance, plan fulfillment, flow stability, and timely intervention across supervisors and support functions.

### Dominant questions
- Are we fulfilling the production plan?
- Which areas/Lots are at risk?
- Where is the bottleneck?
- How much did we lose?
- What is our efficiency?
- What is the buffer projection?
- What threatens tomorrow's production?
- Where should management attention be directed?

### Primary moments
Operational overview, adherence, losses, bottlenecks, buffer projection, escalation.

## 10. Industrial Executive / Director

### Mission
Direct industrial performance and ensure predictable delivery of the production plan with efficient use of factory capability.

### Dominant questions
1. **What is our operational efficiency?**
2. **Do we have predictability that we will produce what is required?**

Supporting questions:
- Are we on plan?
- Where are the major operational risks?
- Where are the largest losses?
- Which area requires attention?
- Is buffer protection sufficient?
- Where is the bottleneck?
- Is OEE improving or deteriorating?
- Is the first wave creating reusable capability?

### Experience rule
Executive screens must lead with graphics, large numbers, trends, exceptions, and concise decision messages. Technical implementation detail is prohibited.

## 11. PCP / Planning persona

### Mission
Maintain production priorities and planning commitments and understand how the MES operationalizes the short-term schedule.

### Dominant questions
- Was the current plan received?
- Are Production Orders reconciled with scheduled Lots?
- Has the operation materially resequenced the plan?
- Will required daily quantities be fulfilled?
- Which planning commitments are at risk?

### Primary moments
Schedule freshness, reconciliation, plan adherence, planning changes.

## 12. Cross-persona progression

The same operational fact must be presented differently according to role:

- Operator: “What do I execute now?”
- Leader: “What requires intervention this shift?”
- Supervisor: “How should I organize execution?”
- Engineer/Technician: “What constraint is causing this?”
- Quality: “Is output acceptable and available?”
- Manager: “Where is performance at risk?”
- Director: “Are we efficient and predictable?”

## 13. Persona-to-screen rule

Every screen or major mode MUST declare:

- primary persona;
- supporting personas;
- dominant business question;
- decision supported;
- information intentionally hidden because it is irrelevant to that persona.

Codex MUST NOT add complexity merely because another persona could theoretically use the same page.
