# WF-001 — Demo Data Contract
Contrato conceitual, não schema produtivo.

`DemoSchedule`: id, source=Balancing, businessDate, version, receivedAt, workCenter, lots, demonstrative=true.
`DemoLot`: lotNumber, material, quantity, scheduledStart/Finish, workCenter, destination, productionOrderId, resourceId=null, bufferImpact, materialAttention, state=SCHEDULED.
`DemoProductionOrder`: id, source=PyMAC, material, quantity, date, correlatedLots, receivedAt, reconciliationStatus.
`DemoBufferPosition`: material, onHand, available, reserved, holdBlocked, currentCoverage, projectedCoverage, targetCoverage.
Destinos internos: ASSEMBLY, SPARE_PARTS, ENGINEERING; UX: Montagem, Reposição, Engenharia.

Cenário coerente: Lot 251/252/253 = 100 peças cada; OP 4500123 = 300 peças. Todo número deve ser real identificado ou demonstrativo identificado.
