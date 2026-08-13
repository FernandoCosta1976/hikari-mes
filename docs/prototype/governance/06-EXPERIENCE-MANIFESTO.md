# HIKARI Prototype — Experience Manifesto

## 1. Experience philosophy

HIKARI is a decision-support experience for manufacturing. The interface must reduce the cognitive distance between factory reality and the decision the user needs to make.

Every experience starts with a business question, not a system function.

## 2. One dominant question

Each major screen/mode MUST have one dominant question. Supporting information may exist only if it helps answer that question.

Examples:

- **What do we need to produce?** → Production Schedule
- **Do we have the conditions to produce?** → Production Readiness
- **Is this the best operational sequence?** → Rescheduling
- **Where should we produce?** → Dispatching
- **Are we fulfilling the plan?** → Execution Monitoring
- **How much did we lose?** → Losses
- **Has production quality deteriorated?** → Quality
- **Where is the bottleneck?** → Bottleneck/Performance
- **Are we efficient?** → OEE/Performance
- **Will we fulfill the next days' demand?** → Projection/Buffer

## 3. Experience hierarchy by organizational level

### Operational
Immediate action, current Lot, current Resource, next action, status, exception.

### Leadership/Supervision
Shift/day commitment, sequence, readiness, constraints, resource allocation, Setup, buffer, intervention.

### Technical/Engineering/Quality
Root context, recurring constraint, quality state, blocked quantity, performance behavior.

### Management
Adherence, loss, bottleneck, buffer risk, cross-area exceptions.

### Executive
Efficiency, predictability, risk, trend, strategic contribution, first-wave value.

## 4. Graph-first executive principle

For executive experiences:

1. visual signal/graph;
2. large number or concise status;
3. executive interpretation;
4. detail on demand.

Long explanatory text must not dominate.

## 5. Progressive disclosure

The interface must reveal detail progressively. A Director should not be exposed to the same information density as a Supervisor. A Supervisor should not need to navigate engineering internals to make an operational decision.

## 6. Context before action

Actions such as Rescheduling or Resource assignment must be preceded by enough context to understand impact. Relevant context may include Setup, buffer, raw material, eligibility, availability, and shift/day commitment.

## 7. Baseline preservation experience

When the user changes operational sequence, the experience must retain visibility of the original planning baseline. “Before → after” or equivalent comparison should make the change understandable.

## 8. Plano Hora-Hora experience

The Plano Hora-Hora is represented as a continuous timeline with hour markers. Lots have visual duration based on Scheduled Start/Finish and are identifiable by Lot, Material/part, quantity, destination, and relevant status.

The timeline must make it immediately understandable that a Production Order consolidated by PyMAC may correspond to multiple Lots distributed through the day.

## 9. Buffer experience

Buffer information must answer both current and future questions:

- What is available now?
- What is reserved?
- How much protects Assembly?
- What is the current coverage?
- If the planned production is executed, what will projected coverage become?
- What future demand consumes that coverage?

Assembly, Replacement, and Engineering must not be visually aggregated in a way that hides reservation.

## 10. Data freshness experience

The user must always be able to determine whether planning/order information is current.

Main experience: concise consolidated freshness indicator.

On demand: source-level detail for Balancing and PyMAC, including last-update date/time and status.

If expected current data has not arrived, the UI must explicitly state that the current-day information is missing and identify the date/time of the last available data.

## 11. Exception language

Avoid definitive claims not supported by validated data. Use language such as:

- potential risk;
- projected impact;
- contribution to mitigation;
- attention required;
- current information suggests;
- demonstrative scenario.

Do not use “problem solved”, “pain eliminated”, or equivalent certainty without evidence.

## 12. Prototype trust

Simulated behavior must be credible and internally coherent. The user must know when a scenario is demonstrative. Demonstrative data must never masquerade as official plant measurement.

## 13. Navigation

The executive demonstration must support guided Previous/Next navigation and direct access to major narrative stages. Complex enterprise menus must not be required to understand the story.

A narrative progress indicator may use:

Plan → Organize → Release → Execute → Monitor → Control → Measure.

## 14. Productive Area context

The selected Productive Area persists globally. Changing the area changes the context of applicable data without requiring repeated selection on every screen.

## 15. Avoid generic dashboard syndrome

HIKARI must not look like a generic administrative dashboard. Every chart/card must map to a manufacturing question, use case, or decision.

## 16. Avoid ERP-form syndrome

The prototype should not default to dense tables and forms when a timeline, flow, comparison, progress representation, or contextual panel communicates the decision more effectively.

## 17. Wireframe V0.1 experience boundary

The first wireframe is **Production Programming — Plano Hora-Hora**.

Dominant question: **What do we need to produce?**

It should include only enough secondary context to support understanding:

- Productive Area and horizon;
- data freshness;
- continuous Plano Hora-Hora timeline;
- Lot details;
- Production Order correlation/reconciliation;
- demand destination;
- concise current/projected buffer context;
- concise raw-material risk context where relevant;
- next-step transition to Production Readiness.

OEE, detailed quality, detailed losses, bottlenecks, and full architecture views do not belong in this first operational screen.
