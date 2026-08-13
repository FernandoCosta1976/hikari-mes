# WF-001 — Domain Semantics
Entidades: Production Schedule, Production Order, Lot, Material, Work Center, Resource, Schedule Version, Inventory, Finished Goods Buffer, Buffer Coverage, Projected Buffer Coverage.

Preservar arquiteturalmente, mas ocultar quando desnecessário: Routing, Operation/Operation Activity, Execution Control Unit/SFC, Production Tool, Material Staging, Floor Stock, Release, Quality Disposition e Genealogy.

WF-001 trabalha predominantemente com `SCHEDULED`. Não usar RELEASED/ACTIVE/COMPLETED como sinônimos de planejamento. Resource permanece não atribuído quando o source schedule não o informa.
