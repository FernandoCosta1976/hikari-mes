# PERSONA-006 — Quality Professional

**Role:** Quality Professional  
**UI reference:** Qualidade  
**Layer:** Operational / Tactical / Specialist  
**Status:** PROTOTYPE_BASELINE

## Mission

Determine whether production quality is acceptable, identify losses or blocked quantities and provide disposition context that affects downstream availability and performance.

## Primary questions

- Minha produção perdeu qualidade?
- Quanto foi produzido bom?
- Quanto foi refugado?
- Quanto precisa de retrabalho?
- Existe quantidade bloqueada?
- O Material pode seguir para a próxima área?
- Qual Lot/Resource está relacionado à perda?
- A qualidade está reduzindo o OEE?

## Interaction moments

- during/after execution;
- when a quality event occurs;
- before quantity becomes downstream-available when quality release is relevant;
- performance analysis.

## Required information

- Lot;
- Material;
- Resource;
- produced quantity;
- good quantity;
- Scrap;
- Rework;
- blocked/released state when applicable;
- event context;
- quality component of OEE.

## Decisions/actions

Detailed quality-disposition authority is not yet defined by this prototype and must not be invented.

## Important domain effect

Produced Quantity must not automatically become Available Quantity if a relevant release condition prevents downstream consumption.

## Experience principle

Quality information should answer operational impact, not merely show defect statistics.
