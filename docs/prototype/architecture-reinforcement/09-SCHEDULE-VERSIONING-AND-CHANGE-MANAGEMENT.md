# Schedule Versioning and Change Management

**Document ID:** HIKARI-ARCH-RF-009  
**Status:** REQUIRED_REINFORCEMENT

## 1. Purpose

Data Freshness answers when data arrived. Versioning answers which planning baseline is active and what changed.

## 2. Canonical concepts

- Schedule Version;
- Effective From;
- Received At;
- Change Set.

External Balancing version format is TBD.

## 3. Minimum model

A schedule should conceptually preserve:
- source;
- business date;
- version/reference;
- received timestamp;
- active/inactive baseline;
- relationship to previous version.

## 4. Change Set

Potential changes:
- Lot added;
- Lot removed;
- quantity changed;
- Scheduled Start/Finish changed;
- sequence changed;
- destination changed.

## 5. Baseline preservation

When a new version becomes active, previous versions must remain conceptually available for comparison.

## 6. Already-started execution

Behavior when a new schedule arrives after Lots are Dispatched, Released, Active or Completed is a critical TBD before production engineering.

## 7. WF-001 implication

Freshness detail should be extensible to display Schedule Version without cluttering the main timeline.
