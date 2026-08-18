# WF-001 — Design Decisions
1. Balancing é fonte do Schedule: Lot, Material, Quantity, Scheduled Start/Finish, sequência e Work Center.
2. PyMAC fornece Production Orders; relação Order×Lot não é necessariamente 1:1.
3. Lot Yamaha é o objeto visual dominante.
4. Work Center precede Resource; máquina é atribuída posteriormente.
5. Preservar o conceito Yamaha de Plano Hora-Hora.
6. Supervisor/Líder podem reorganizar execução sem apagar o baseline.
7. Buffer aparece como contexto resumido.
8. Produzido ≠ Disponível.
9. Projected Coverage = Available + produção programada esperada − consumo futuro planejado.
10. Destinos: Montagem, Reposição, Engenharia.
11. Próximo consumidor físico do buffer da Fundição é a Usinagem; destino da demanda é outro conceito.
12. Mostrar freshness.
13. Arquitetura deve suportar Schedule Version e comparação.
14. Production Readiness é a próxima experiência.
# Approved UX refinement — sidebar-only workspace

**TOP APP BAR = REMOVED.**

The normative desktop composition for WF-001 is `SIDEBAR + WORKSPACE`. The application identity, Production Scheduling context, Productive Area, demonstrative-scenario identification, navigation controls, filters, plan actions, and scenario reset belong in the sidebar. The workspace begins visually with the H1 “O que precisamos produzir?”. No app bar, reserved header space, breadcrumb, eyebrow, or institutional strip may precede it.

The sidebar collapse control remains inside the sidebar and becomes the reopening control in rail mode. On small viewports, the same sidebar becomes an overlay drawer. This approved UX decision must not be reversed without an explicit Product Owner decision.
