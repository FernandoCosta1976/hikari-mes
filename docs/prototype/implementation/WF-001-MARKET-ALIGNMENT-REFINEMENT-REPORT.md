# WF-001 MARKET ALIGNMENT REFINEMENT REPORT

Data da revisão: 13/08/2026
Escopo: WF-001 — Production Scheduling / Programação da Produção — Plano Hora-Hora
Classificação: cenário exclusivamente demonstrativo

## A. Product Decision Recorded

- Arquivo criado: `docs/prototype/wireframes/production-scheduling/WF-001-MARKET-ALIGNMENT-REVIEW.md`.
- Foram registrados os sete princípios aprovados, a inspiração de mercado sem reprodução de produto externo, a preservação da identidade HIKARI/Yamaha, a fronteira funcional do WF-001 e os três níveis de revelação progressiva.
- Permanecem fora do escopo Dispatching funcional, Resource Assignment, WF-002, liberação, execução, eficiência e decisões MES ainda TBD.

## B. Files Changed

### Criados nesta evolução

- `docs/prototype/wireframes/production-scheduling/WF-001-MARKET-ALIGNMENT-REVIEW.md`
- `docs/prototype/implementation/WF-001-MARKET-ALIGNMENT-REFINEMENT-REPORT.md`
- `src/features/production-scheduling/components/QuickAttentionSummary.tsx`
- `src/features/production-scheduling/components/ScheduleRevisionSummary.tsx`
- `src/features/production-scheduling/components/HourByHourSchedule.test.tsx`
- `e2e/wf001-production-scheduling.spec.ts-snapshots/wf001-production-scheduling-before-market-alignment-chromium-darwin.png`
- `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-MARKET-ALIGNMENT-CANDIDATE-chromium-darwin.png`

### Modificados nesta evolução

- `src/features/production-scheduling/ProductionSchedulingPage.tsx`
- `src/features/production-scheduling/ProductionSchedulingPage.module.css`
- `src/features/production-scheduling/ProductionSchedulingPage.test.tsx`
- `src/features/production-scheduling/components/HourByHourSchedule.tsx`
- `src/features/production-scheduling/components/ProductionOrderCorrelation.tsx`
- `src/features/production-scheduling/components/BufferCoverageSummary.tsx`
- `src/features/production-scheduling/components/OperationalAttentionSummary.tsx`
- `e2e/wf001-production-scheduling.spec.ts`

Os demais arquivos locais do Sprint 1 já estavam em evolução antes deste refinamento e continuam sem commit.

## C. Market Principle Implementation

| Principle | Implemented? | How | Files | Notes |
|---|---|---|---|---|
| Continuous time axis | YES | Eixo único, marcas horárias e posicionamento absoluto calculado sobre a janela temporal | `temporalMath.ts`, `HourByHourSchedule.tsx` | Sem colunas discretas por hora |
| Duration proportional blocks | YES | `left` e `width` são percentuais derivados de início, término e duração | `temporalMath.ts`, `HourByHourSchedule.tsx`, teste temporal | Blocos não possuem largura mínima que invalide a proporção |
| Contextual detail | YES | Seleção do Lote abre detalhe contextual sem retirar o plano da tela | `LotDetail.tsx`, `ProductionSchedulingPage.tsx` | Lote continua sendo a unidade visual principal |
| Schedule × Dispatch separation | YES | Rótulo “Plano recebido — Balancing” e aviso de que a sequência operacional será definida posteriormente | `HourByHourSchedule.tsx` | Nenhuma ação de Dispatch foi criada |
| Change/revision visibility | YES | Versão atual, recepção, contagens e detalhe comparativo sob demanda | `ScheduleRevisionSummary.tsx` | Não presume mecanismo técnico de versionamento |
| Quick restriction reading | YES | Faixa superior resume matéria-prima, buffer, conciliação e revisão | `QuickAttentionSummary.tsx` | Sinais levam aos detalhes correspondentes |
| Progressive drill-down | YES | Visão principal compacta, resumos expansíveis e detalhe de Lote | componentes de correlação, buffer, atenção e revisão | Evita densidade permanente na tela |

## D. Timeline Review

- Escala: contínua, das 16:00 às 23:30 no cenário atual, com marcas horárias regulares.
- Temporal math: início e término são convertidos em minutos; deslocamento e largura são calculados como fração da janela total.
- Proportional blocks: a largura representa a duração real. Teste dedicado verifica que 60 minutos ocupam aproximadamente o dobro de 30 minutos.
- Hour-crossing behavior: intervalos como 18:43–19:48 atravessam a marca horária sem quebra ou duplicação do bloco.
- Responsive behavior: a trilha conserva largura mínima e usa rolagem horizontal em viewports estreitos, preservando a matemática temporal e a legibilidade.

## E. Schedule × Dispatch Review

1. Schedule claramente identificado? **YES**
2. Dispatch funcional foi implementado? **NO**
3. Resource Assignment foi implementado? **NO**
4. Scheduled/Dispatched/Actual continuam conceitualmente separados? **YES**

O WF-001 continua respondendo somente “O que precisamos produzir?”.

## F. Revision / Version Review

- Current version: Versão demonstrativa 08, recebida em 15/05/2025 às 05:42.
- Previous version: Versão demonstrativa 07.
- Change summary: 1 Lote incluído e 2 Lotes reposicionados.
- Change detail behavior: o resumo permanece visível; a lista por Lote é revelada sob demanda em elemento semântico `details/summary`.

## G. Restriction Reading

Sinais apresentados na visão principal:

- 1 Lote requer atenção de matéria-prima;
- 2 Materiais abaixo da referência atual de buffer;
- plano atual sem divergência de conciliação;
- versão do plano atualizada, com acesso às alterações.

Production Readiness completa **NÃO** foi implementada. Os sinais apenas preparam uma transição futura e não liberam, iniciam ou atribuem produção.

## H. Drill-down Levels

- Level 1 — leitura executiva: compromisso, destinos, fonte/versão, sinais rápidos, plano temporal e próxima decisão.
- Level 2 — contexto sob demanda: revisão do plano, correlação Balancing × PyMAC, cobertura Atual → Após o plano e atenção de matéria-prima.
- Level 3 — detalhe do Lote selecionado: material, quantidade, horários previstos, Centro de Trabalho, destino, Ordem de Produção correlacionada, buffer e indicação explícita de Recurso ainda não atribuído.

## I. Buffer Review

“Atual → Após o plano” aparece no resumo compacto. Ao expandir, cada Material apresenta cobertura atual, projetada após o plano e referência demonstrativa. A projeção permanece distinta de disponibilidade: considera quantidade disponível mais produção programada esperada menos consumo futuro planejado, sem tratar reserva como disponibilidade livre.

## J. Test Results

| Gate | PASS / FAIL | Quantity | Errors | Warnings |
|---|---|---:|---:|---:|
| TypeScript typecheck | PASS | 1 execução | 0 | 0 |
| Unit/component tests | PASS | 18 testes em 7 arquivos | 0 | 0 |
| Production build | PASS | 109 módulos | 0 | 0 |
| E2E/browser | PASS | 4 testes | 0 | 0 |
| Automated accessibility (axe) | PASS | 1 varredura E2E | 0 violações | 0 |
| Visual snapshot | PASS | 1 candidata validada | 0 diferenças inesperadas | 0 |
| Static red scan | PASS | `src` + `e2e` | 0 violações | 0 |
| Git whitespace check | PASS | árvore de trabalho | 0 | 0 |
| Lint | NOT CONFIGURED | 0 | 0 | script `lint` inexistente no projeto |

## K. Accessibility

- Timeline keyboard: Lotes são botões navegáveis; setas esquerda/direita transferem seleção entre Lotes.
- Lot selection: estado selecionado exposto por `aria-pressed` e nome acessível contextual.
- Progressive disclosure: elementos nativos `details/summary`, operáveis por teclado.
- Focus: abertura e fechamento do detalhe preservam/devolvem foco ao Lote; foco visível é mantido.
- Axe: zero violações automaticamente detectáveis no fluxo E2E.

## L. Visual Review

- Previous screenshot: `e2e/wf001-production-scheduling.spec.ts-snapshots/wf001-production-scheduling-before-market-alignment-chromium-darwin.png`
- New candidate screenshot: `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-MARKET-ALIGNMENT-CANDIDATE-chromium-darwin.png`
- Baseline técnica anterior preservada: `e2e/wf001-production-scheduling.spec.ts-snapshots/wf001-production-scheduling-chromium-darwin.png` (hash idêntico à cópia anterior ao refinamento).

| Aspecto | Classificação | Comparação |
|---|---|---|
| Layout | IMPROVED | Leitura rápida e revisão entram antes do plano sem retirar o plano do primeiro viewport |
| Hierarchy | IMPROVED | Compromisso, atenção, controle, revisão e plano formam uma sequência decisória clara |
| Timeline | IMPROVED | Fonte do Schedule e fronteira com sequência operacional ficam explícitas |
| Density | IMPROVED | Correlação, buffer e atenção passam a revelação progressiva |
| Restrictions | IMPROVED | Sinais críticos são reunidos em faixa escaneável |
| Detail | IMPROVED | Detalhe contextual permanece disponível sem dominar a visão principal |
| Revision visibility | IMPROVED | Versão e mudanças ficam visíveis e expansíveis |

A nova imagem é **candidata para Product Review**, não aprovada.

## M. Red Scan

RED COLOR VIOLATIONS: 0

## N. Architectural Audit

1. ADR-001 preservado? **YES**
2. Application Context preservado? **YES**
3. Zustand restrito ao Scenario State? **YES**
4. Domain independente de React? **YES**
5. Nenhum backend? **YES**
6. Nenhuma integração? **YES**
7. Nenhum Resource Assignment? **YES**
8. Nenhum Dispatch funcional? **YES**
9. Nenhum WF-002 antecipado? **YES**
10. Nenhum TBD MES resolvido? **YES**

## O. Domain Audit

- Production Order != Lot — **preservado**
- Work Center != Resource — **preservado**
- Scheduled != Dispatched != Actual — **preservado**
- Produced != Available — **preservado**
- Reserved != Available — **preservado**
- Balancing = Schedule source — **preservado**
- PyMAC = Order source — **preservado**

## P. Issues / Warnings

- O projeto não possui script de lint configurado; typecheck, build e testes cobrem os gates atualmente definidos.
- A screenshot candidata ainda requer decisão explícita do Product Owner antes de qualquer promoção de baseline.
- A varredura axe automatizada complementa, mas não substitui, revisão manual de acessibilidade.
- Não há bloqueador técnico ou de domínio identificado para a Product Review do WF-001.

## Q. Product Owner Review Items

O Product Owner deve observar visualmente:

1. se a faixa “Leitura rápida” permite reconhecer restrições sem abrir detalhes;
2. se “Plano recebido — Balancing” separa claramente Schedule de sequência operacional futura;
3. se posição e duração dos Lotes são compreensíveis no eixo contínuo;
4. se a revisão 08 e suas alterações têm destaque suficiente sem competir com o plano;
5. se correlação, buffer e matéria-prima funcionam melhor recolhidos e sob demanda;
6. se o detalhe do Lote mantém contexto suficiente sem sugerir atribuição de Recurso;
7. se “Atual → Após o plano” comunica projeção sem parecer disponibilidade oficial;
8. se a próxima decisão conduz à preparação futura sem sugerir liberar ou iniciar produção;
9. se nenhum tratamento visual utiliza vermelho;
10. se a experiência permanece reconhecível como HIKARI/Yamaha, sem copiar SAP ou Siemens.

## R. Review URL

`http://127.0.0.1:5173/demo/fundicao-dc/production-scheduling`

## S. Recommended Decision

**A. MARKET REFINEMENT READY FOR PRODUCT REVIEW**

Os sete princípios foram implementados dentro da fronteira do WF-001; os gates técnicos e visuais passaram; não houve antecipação de Dispatching, Resource Assignment, WF-002 ou decisão MES TBD. A decisão seguinte é exclusivamente de produto sobre a candidata visual.

WF-001 MARKET REFINEMENT PASSED — READY FOR PRODUCT REVIEW
