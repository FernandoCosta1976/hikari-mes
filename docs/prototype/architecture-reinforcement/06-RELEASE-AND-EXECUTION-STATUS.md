# Release and Execution Status

**Document ID:** HIKARI-ARCH-RF-006  
**Status:** REQUIRED_BEFORE_EXECUTION

## 1. Purpose

Separate Scheduling, Readiness, Dispatching, Release and Execution.

## 2. Working light-MES lifecycle

**RECEIVED → SCHEDULED → READY → DISPATCHED → RELEASED → ACTIVE → COMPLETED**

Exception concepts:
- HOLD;
- CANCELLED or equivalent, subject to validation.

This is a HIKARI conceptual lifecycle inspired by standard MES patterns, not a claim that these are exact Yamaha or SAP status codes.

## 3. Definitions

### RECEIVED
Requirement/order/schedule is known by HIKARI.

### SCHEDULED
Lot/Operation is present in the schedule.

### READY
Minimum readiness conditions are satisfied.

### DISPATCHED
Operational sequence/Resource context has been established.

### RELEASED
Work is formally authorized for execution.

### ACTIVE
Execution has started.

### COMPLETED
Execution has completed according to the governed completion rule.

### HOLD
Execution/release is intentionally prevented or paused.

## 4. Critical distinction

Dispatching is not automatically identical to Release.

## 5. Prototype use

WF-001 mainly uses SCHEDULED. WF-002 may derive READY. Dispatching may produce demonstrative DISPATCHED. Execution shall wait for governed Release/Active semantics.
