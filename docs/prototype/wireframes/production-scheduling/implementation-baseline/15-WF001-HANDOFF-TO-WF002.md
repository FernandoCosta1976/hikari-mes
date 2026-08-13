# WF-001 → WF-002
WF-001: **O que precisamos produzir?**
WF-002: **Temos condições de produzir?**

Trigger: `Avaliar preparação`.

Transferir: Área, Schedule Version, Lot, Material, Quantity, Scheduled Start/Finish, Work Center, Production Order, Destination, buffer context e atenção conhecida.

WF-002 avalia Resource Eligibility, Resource Availability, Production Tool, Setup/Changeover, Material Availability, Material Staging, restrição técnica/manutenção e, quando governado, Labor/Competency.

WF-002 não executa produção, não substitui Balancing e não faz APS global. Sua saída prepara Resource Orchestration / Operational Rescheduling / Dispatching.
