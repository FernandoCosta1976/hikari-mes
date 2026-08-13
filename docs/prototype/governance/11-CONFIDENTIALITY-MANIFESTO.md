# HIKARI Prototype — Confidentiality Manifesto

## 1. Purpose

The prototype is an executive alignment artifact and may be shown in contexts where unnecessary technical disclosure creates reuse or competitive risk.

## 2. Information allowed

The prototype may show:

- business capabilities;
- MES functional concepts;
- user journeys;
- personas and decision moments;
- operational flow;
- qualitative module collaboration;
- conceptual data lineage;
- simulated scenarios;
- business outcomes;
- qualitative strategic-pain coverage;
- reusable-wave concept;
- non-proprietary MES terminology.

## 3. Information prohibited from executive prototype

Do not expose:

- API definitions;
- endpoints;
- event contracts;
- event payloads;
- schemas;
- topics;
- queues;
- broker technology;
- physical database design;
- table structures;
- infrastructure topology;
- cloud/on-prem implementation details;
- proprietary algorithms;
- optimization formulas that reveal implementation;
- internal component architecture beyond high-level modules;
- detailed APF;
- detailed functional sizing;
- detailed effort by function;
- detailed cost model;
- detailed security architecture;
- CI/CD and DevOps internals;
- observability internals.

## 4. Architectural diagrams

Permitted diagrams are conceptual: module collaboration, factory flow, planning-to-execution flow, and data-to-OEE narrative.

Technical sequence diagrams, broker topology, detailed integration contracts, or deployment diagrams are outside the executive prototype.

## 5. Source-system references

Balancing, PyMAC, WMS/Inventory, and HIKARI may be named where necessary to explain business flow. The prototype must not expose confidential interface details.

## 6. Competitive-reuse test

Before adding technical detail, ask:

**Does the Director need this information to validate how the solution works or the decision to proceed?**

If no, exclude it.

## 7. Codex rule

If a screen request would require prohibited technical disclosure, Codex must implement a conceptual abstraction or stop and request a governance decision. It must not “helpfully” add technical diagrams.
