# WF-002 — Functional Wireframe V1

**Status:** CANDIDATE FOR PRODUCT OWNER REVIEW
**Format:** Textual functional wireframe; no visual asset or implementation
**Approach:** Hybrid Constraint-First
**Granularity:** Lot × Resource plus consolidated Lot Readiness Summary

## Dominant Question

> Temos condições de produzir?

## Information Architecture

```text
Context Bar
→ Selected Lot Context
→ Readiness Summary
→ Eligibility Filter
→ Eligible Resource Cards
→ Constraints and Attentions
→ Detail on Demand / Optional Comparison
→ Return and Future Handoff
```

## Complete Textual Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ CONTEXT BAR                                                                  │
│ Fundição DC · Preparação da Produção                                         │
│ Lote 252 · Material A · 100 peças · 16:43 → 17:48 · Montagem                │
│ Programação v3 · Cenário demonstrativo                                      │
│ [← Voltar ao Plano Hora-Hora]                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ DOMINANT QUESTION                                                            │
│ Temos condições de produzir?                                                 │
│ Avaliação para o intervalo previsto 16:43 → 17:48                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ SELECTED LOT                                                                 │
│ Lote 252             Material A             Quantidade 100 peças             │
│ Início 16:43         Término 17:48          Destino Montagem                 │
│ Centro de Trabalho: Fundição DC          Ordem de Produção: contexto PyMAC   │
│ Cobertura projetada abaixo da referência · Prioridade de preparação          │
├──────────────────────────────────────────────────────────────────────────────┤
│ READINESS SUMMARY                                                            │
│ EXISTE CAMINHO VIÁVEL                                                        │
│ Há evidência demonstrativa de pelo menos um caminho para produzir este Lot.  │
│                                                                              │
│ 3 máquinas elegíveis · 1 com condições atendidas · 1 requer atenção          │
│ 1 com condição impeditiva/informação insuficiente                            │
│                                                                              │
│ A avaliação não seleciona nem recomenda uma máquina.                         │
│ Dados de readiness: demonstrativos · [Ver atualização dos dados]             │
├──────────────────────────────────────────────────────────────────────────────┤
│ ELIGIBILITY FILTER                                                           │
│ Máquinas elegíveis: DC01 · DC03 · DC05                                      │
│ Não elegíveis para Material A: DC02 · DC04 [Entender inelegibilidade]        │
│ Condições operacionais não são avaliadas para máquinas inelegíveis.          │
├──────────────────────────────────────────────────────────────────────────────┤
│ ELIGIBLE RESOURCE CARDS                                                      │
│                                                                              │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐   │
│ │ DC01 · Elegível      │ │ DC03 · Elegível      │ │ DC05 · Elegível      │   │
│ │ Condições atendidas  │ │ Atenção              │ │ Informação insufic.  │   │
│ │                      │ │                      │ │                      │   │
│ │ Agora                │ │ Agora                │ │ Agora                │   │
│ │ Produção conhecida   │ │ Sem produção corrente│ │ Informação parcial   │   │
│ │ Lote demonstrativo   │ │ conhecida            │ │                      │   │
│ │ Não indica prontidão │ │ Não indica prontidão │ │ Não indica prontidão │   │
│ │                      │ │                      │ │                      │   │
│ │ Para 16:43 → 17:48   │ │ Para 16:43 → 17:48   │ │ Para 16:43 → 17:48   │   │
│ │ Molde: compatível    │ │ Molde: troca requerida│ │ Molde: não confirmado│   │
│ │ Setup: não requerido │ │ Setup: necessário    │ │ Setup: desconhecido  │   │
│ │ Manut.: sem restrição│ │ Manut.: sem restrição│ │ Restrição conhecida  │   │
│ │ Material: disponível │ │ Material: disponível │ │ Material: disponível │   │
│ │ Abastecimento: pronto│ │ Abastecimento: pend. │ │ Abastecimento: incerto│   │
│ │ Cap.: sem restrição  │ │ Cap.: sem restrição  │ │ Cap.: informação ins.│   │
│ │                      │ │                      │ │                      │   │
│ │ Por quê?             │ │ Por quê?             │ │ Por quê?             │   │
│ │ Evidências atendidas │ │ Troca e staging      │ │ Restrição e dados     │   │
│ │ no cenário.          │ │ exigem preparação.   │ │ ausentes impedem      │   │
│ │                      │ │                      │ │ conclusão segura.     │   │
│ │ [Ver condições]      │ │ [Ver condições]      │ │ [Ver condições]      │   │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘   │
│                                                                              │
│ [Comparar condições] — leitura lado a lado; sem seleção ou ranking           │
├──────────────────────────────────────────────────────────────────────────────┤
│ RESTRICTIONS / ATTENTIONS                                                    │
│ • DC03 · Troca de molde requerida antes do intervalo 16:43 → 17:48.          │
│ • DC03 · Material disponível, mas abastecimento da área está pendente.       │
│ • DC05 · Restrição conhecida; impacto completo ainda não confirmado.         │
│ • DC05 · Freshness de ferramenta/capacidade requer atenção.                  │
│ [Abrir detalhes das condições]                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ ACTIONS                                                                      │
│ [← Voltar ao Plano Hora-Hora]                                                │
│ [Continuar para organização]                                                 │
│ Nenhum Recurso será atribuído nesta etapa.                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

All values above are **CENÁRIO DEMONSTRATIVO** and do not represent Yamaha master data or actual plant conditions.

## Desktop Composition — 1440 px

- centered application content at approximately 1280–1320 px usable width;
- 12-column conceptual grid with 24 px gutters;
- Context Bar and dominant question span 12 columns;
- Selected Lot uses 8 columns and compact urgency/freshness context uses 4 when space permits;
- Readiness Summary spans 12 columns;
- three eligible Resource cards use 4 columns each;
- constraints span 8 columns and assessment/freshness context may use 4;
- footer actions span 12 columns.

Above the fold should contain the Context Bar, dominant question, Selected Lot, Readiness Summary, Eligibility Filter and the opening portion of Resource cards. Condition detail and action footer may require vertical scroll.

## Resource Card Rules

- identical width and structural hierarchy;
- no card is visually presented as first/best/recommended;
- textual result is always visible;
- Current Resource State appears under **Agora** and explicitly says it does not indicate readiness;
- scheduled evaluation appears under **Para [intervalo]**;
- only relevant dimensions are shown;
- reason precedes detail action;
- card action opens evidence only and never selects the Resource.

## Ineligible Resource Design

DC02 and DC04 appear in a compact neutral strip:

```text
DC02 · Não elegível para Material A
DC04 · Não elegível para Material A
```

Availability, Tool, Setup, Maintenance, Material and Capacity are not evaluated after structural elimination. The explanation remains available on demand.

## Comparison View

**Comparar condições** opens a compact read-only comparison of DC01, DC03 and DC05. Rows are limited to the dimensions present in cards. The view:

- does not select;
- does not rank;
- does not recommend;
- preserves text labels and reason links;
- offers a linear accessible alternative on narrow screens.

## Handoff

Recommended future CTA: **Continuar para organização**.

It is clearer and less action-final than “Organizar produção”, while preserving WF-003's question. Supporting text is mandatory: **“Nenhum Recurso será atribuído nesta etapa.”** The CTA remains conceptual and inactive until WF-003 is approved and authorized.
