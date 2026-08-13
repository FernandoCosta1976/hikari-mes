# Traceability and Genealogy

**Document ID:** HIKARI-ARCH-RF-010  
**Status:** FUTURE_CORE_ARCHITECTURE

## 1. Purpose

Ensure the prototype data model does not create a dead end for MES traceability.

## 2. Conceptual chain

Future HIKARI traceability should be able to connect:

**Production Order → Lot → Routing → Operation → Execution Control Unit → Work Center → Resource → Production Tool → Consumed Material → Produced Quantity → Quality Disposition → Inventory/Buffer → Downstream consumption**

Not every link is required in Wave 1.

## 3. Lot continuity

The Yamaha Lot remains a key traceability anchor and is not replaced during resequencing.

## 4. Actual Resource

Actual Resource must eventually be captured separately from planned Work Center/context.

## 5. Production Tool

Where relevant, the tool used should be traceable to execution.

## 6. Material genealogy

Requires validated BOM/consumption data. Do not fabricate in the executive prototype.

## 7. Buffer continuity

Moving a produced part into Finished Goods Buffer must not break Lot identity.
