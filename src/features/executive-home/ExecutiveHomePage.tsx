import { useState } from 'react';
import { withBase } from '../../app/routing/basePath';
import { useScenarioPath } from '../../app/routing/useScenarioPath';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { computeFundicaoDcOeeSummary } from '../../demo/adapters/oeeSummaryAdapter';
import { downstreamHealthForScenario, idealCycleTimeSecondsForScenario, moldsForScenario, qualityConfirmationsForScenario } from '../../demo/scenario-engine/scenarioFixtures';
import { selectProductionConfirmations, selectProductionExecutions, selectProductionScheduling, selectScenarioDefinition, selectSessionClock, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import type { DownstreamAreaStatus } from '../../domain/downstream/models';
import { classifyMoldLife, mostCriticalMold } from '../../domain/mold/models';
import type { OeeDimension } from '../../domain/oee/calculations';
import { Bar } from '../../shared/ui/Bar/Bar';
import styles from './ExecutiveHomePage.module.css';

const dimensionLabel: Record<OeeDimension, string> = { AVAILABILITY: 'Disponibilidade', PERFORMANCE: 'Desempenho', QUALITY: 'Qualidade' };
const downstreamStatusLabel: Record<DownstreamAreaStatus, string> = { PROTECTED: 'Sem risco', ATTENTION: 'Atenção', RISK: 'Risco', UNKNOWN: 'Sem dados' };
const downstreamStatusTone: Record<DownstreamAreaStatus, 'positive' | 'attention' | 'neutral'> = { PROTECTED: 'positive', ATTENTION: 'attention', RISK: 'attention', UNKNOWN: 'neutral' };
const pct = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;

type CapabilityStatus = 'MATERIALIZED' | 'NEXT' | 'FUTURE';
type Moment = { id: string; title: string; capabilities: readonly Capability[] };
type Capability = { id: string; name: string; priority: 'CORE' | 'ESSENCIAL' | 'ESSENCIAL + OEE' | 'OEE'; status: CapabilityStatus; href?: string };

const moments: readonly Moment[] = [
  { id: 'plan', title: 'Planejar e Organizar', capabilities: [
    { id: '01', name: 'Receber Planejamento da Produção', priority: 'CORE', status: 'MATERIALIZED', href: '/production-scheduling' },
    { id: '02', name: 'Atualizar Alterações do Plano', priority: 'ESSENCIAL', status: 'MATERIALIZED', href: '/production-scheduling' },
    { id: '03', name: 'Organizar Sequenciamento Operacional da Área', priority: 'CORE', status: 'MATERIALIZED', href: '/production-scheduling' },
    { id: '04', name: 'Liberar Produção', priority: 'CORE', status: 'MATERIALIZED', href: '/production-scheduling?lotId=lot-sd-501' },
  ] },
  { id: 'execute', title: 'Executar e Registrar', capabilities: [
    { id: '05', name: 'Executar Ordens de Produção', priority: 'CORE', status: 'MATERIALIZED', href: '/production-execution' },
    { id: '06', name: 'Acompanhar Situação / WIP / Eventos', priority: 'CORE', status: 'MATERIALIZED', href: '/production-monitoring' },
    { id: '07', name: 'Controlar Aderência / Desvios / Gargalos', priority: 'ESSENCIAL', status: 'MATERIALIZED', href: '/production-adherence' },
    { id: '08', name: 'Registrar Qualidade / Perdas / Desempenho', priority: 'ESSENCIAL + OEE', status: 'MATERIALIZED', href: '/production-quality' },
    { id: '09', name: 'Controlar WIP', priority: 'ESSENCIAL', status: 'MATERIALIZED', href: '/production-monitoring' },
  ] },
  { id: 'control', title: 'Controlar e Explicar', capabilities: [
    { id: '10', name: 'Comparar Planejado × Executado', priority: 'ESSENCIAL', status: 'MATERIALIZED', href: '/production-adherence' },
    { id: '11', name: 'Identificar Desvios Operacionais', priority: 'ESSENCIAL', status: 'MATERIALIZED', href: '/production-adherence' },
    { id: '12', name: 'Monitorar Produção em Tempo Real', priority: 'ESSENCIAL + OEE', status: 'MATERIALIZED', href: '/production-monitoring' },
  ] },
  { id: 'measure', title: 'Medir e Evoluir', capabilities: [
    { id: '13', name: 'Estruturar Fundação para Indicadores Operacionais', priority: 'ESSENCIAL + OEE', status: 'MATERIALIZED', href: '/production-quality' },
    { id: '14', name: 'Calcular e Disponibilizar OEE', priority: 'OEE', status: 'MATERIALIZED', href: '/oee' },
  ] },
];

const questions = [
  { id: '01', group: 'PLANO', text: 'O que foi planejado?', capabilities: ['01', '02', '03'] },
  { id: '02', group: 'PLANO', text: 'O que está sendo produzido?', capabilities: ['05', '07', '12'] },
  { id: '03', group: 'PLANO', text: 'Estou aderente ao plano?', capabilities: ['10', '11', '12'] },
  { id: '04', group: 'OPERAÇÃO', text: 'Qual é a situação da produção?', capabilities: ['04', '05', '07', '12'] },
  { id: '05', group: 'OPERAÇÃO', text: 'Onde estão os materiais?', capabilities: ['09'] },
  { id: '06', group: 'OPERAÇÃO', text: 'Quais máquinas impactam?', capabilities: ['03', '08', '11', '12'] },
  { id: '07', group: 'EFICIÊNCIA', text: 'Por que a eficiência variou?', capabilities: ['08', '10', '11', '13', '14'] },
  { id: '08', group: 'EFICIÊNCIA', text: 'Quanto perdi?', capabilities: ['08', '10', '11', '13', '14'] },
  { id: '09', group: 'EFICIÊNCIA', text: 'Qualidade impactou?', capabilities: ['06', '07', '11', '13', '14'] },
  { id: '10', group: 'GOVERNANÇA', text: 'Quem executou?', capabilities: ['05', '06'] },
  { id: '11', group: 'GOVERNANÇA', text: 'Os dados estão integrados?', capabilities: ['01', '02', '06', '08', '13'] },
] as const;

const capabilityNames = Object.fromEntries(moments.flatMap((moment) => moment.capabilities).map((capability) => [capability.id, capability.name]));
const statusLabel: Record<CapabilityStatus, string> = { MATERIALIZED: 'Materializado', NEXT: 'Próxima cena', FUTURE: 'Futuro' };
const priorityLabel: Record<Capability['priority'], string> = { CORE: 'Núcleo', ESSENCIAL: 'Essencial', 'ESSENCIAL + OEE': 'Essencial + OEE', OEE: 'OEE' };

export function ExecutiveHomePage() {
  const scenarioPath = useScenarioPath();
  const [selectedQuestionId, setSelectedQuestionId] = useState('01');
  const selectedQuestion = questions.find((question) => question.id === selectedQuestionId)!;
  const groups = ['PLANO', 'OPERAÇÃO', 'EFICIÊNCIA', 'GOVERNANÇA'] as const;
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const productionConfirmationsByLot = useScenarioStore(selectProductionConfirmations);
  const sessionClock = useScenarioStore(selectSessionClock);
  const resetScenario = useScenarioStore((state) => state.resetScenario);
  const currentTime = useLiveScenarioTime(sessionClock ?? scenario?.currentScenarioTime);
  const oee = definition && scenario ? computeFundicaoDcOeeSummary(definition, executionsByLot, currentTime, qualityConfirmationsForScenario(scenario.id), idealCycleTimeSecondsForScenario(scenario.id), Object.values(productionConfirmationsByLot).flat()) : null;
  const usinagem = downstreamHealthForScenario(scenario?.id);
  const criticalMold = mostCriticalMold(moldsForScenario(scenario?.id));
  const nextExpectedLot = definition?.lots.find((lot) => lot.id === usinagem.nextExpectedLotId);
  const actionItems = [
    oee?.mainImpact ? { title: `${oee.mainImpact.resourceId} · ${dimensionLabel[oee.mainImpact.dimension]} abaixo do esperado`, detail: 'Principal fator de redução do OEE da Fundição hoje.' } : null,
    usinagem.status !== 'PROTECTED' ? { title: `USINAGEM · buffer projetado abaixo da meta`, detail: `${usinagem.criticalMaterial} em atenção · cobertura projetada ${usinagem.projectedCoverageHours}h / meta ${usinagem.targetCoverageHours}h` } : null,
    criticalMold && classifyMoldLife(criticalMold.lifeUsedRatio) !== 'NORMAL' ? { title: `${criticalMold.resourceId} · Molde ${criticalMold.code}`, detail: `${Math.round(criticalMold.lifeUsedRatio * 100)}% da vida útil demonstrativa · avaliar manutenção` } : null,
  ].filter((item): item is { title: string; detail: string } => item !== null).slice(0, 3);
  return <div className={styles.page}>
    <header className={styles.topbar}><a href={withBase(scenarioPath(''))} className={styles.brand} aria-label="Programa HIKARI — início"><span>H</span><b>HIKARI</b><small>MES</small></a><div className={styles.topbarActions}>{scenario ? <button type="button" onClick={resetScenario}>Reiniciar demonstração</button> : null}<a className={styles.workspaceLink} href={withBase(scenarioPath('/production-scheduling'))}>Entrar na demonstração <span aria-hidden="true">→</span></a></div></header>
    <main>
      <section className={styles.hero} aria-labelledby="executive-title">
        <div className={styles.heroCopy}><span className={styles.eyebrow}>Primeira Onda · Fundação Operacional</span><h1 id="executive-title">PROGRAMA HIKARI</h1><h2>Da programação à visibilidade completa da eficiência operacional.</h2><p>Construímos progressivamente as capacidades para saber o que foi planejado, o que está acontecendo, por que houve desvios e qual foi o impacto na eficiência operacional.</p><div className={styles.heroActions}><a className={styles.primaryCta} href={withBase(scenarioPath('/production-scheduling'))}><span aria-hidden="true">▶</span> Iniciar demonstração</a><a href="#primeira-onda">Ver Primeira Onda ↓</a></div></div>
        <div className={styles.heroJourney} aria-label="Jornada da Primeira Onda até OEE"><div className={styles.journeySteps}><span><b>Planejar</b><small>e organizar</small></span><i>→</i><span><b>Executar</b><small>e registrar</small></span><i>→</i><span><b>Controlar</b><small>e explicar</small></span><i>→</i><span><b>Medir</b><small>e evoluir</small></span><i>→</i></div><div className={styles.oeeDestination} aria-label="OEE demonstrativo da Fundição DC"><strong>OEE {pct(oee?.areaOee ?? null)}</strong><span>Disponibilidade {pct(oee?.areaAvailability ?? null)}</span><span>Desempenho {pct(oee?.areaPerformance ?? null)}</span><span>Qualidade {pct(oee?.areaQuality ?? null)}</span>{oee?.mainImpact ? <em>Maior perda: {dimensionLabel[oee.mainImpact.dimension]}</em> : null}</div></div>
        <div className={styles.downstreamPanel} aria-label="Saúde da próxima área: Usinagem">
          <span>Próxima área</span><strong>Usinagem</strong><b data-tone={downstreamStatusTone[usinagem.status]}>{downstreamStatusLabel[usinagem.status]}</b>
          <Bar ratio={usinagem.projectedCoverageHours / usinagem.targetCoverageHours} tone={downstreamStatusTone[usinagem.status] === 'positive' ? 'positive' : 'attention'} label={`Cobertura projetada ${usinagem.projectedCoverageHours}h de meta ${usinagem.targetCoverageHours}h`} />
          <small>Atual {usinagem.currentCoverageHours}h · Projetado {usinagem.projectedCoverageHours}h · Meta {usinagem.targetCoverageHours}h</small>
          <em>Material crítico: {usinagem.criticalMaterial} · Próximo abastecimento: Lote {nextExpectedLot?.lotNumber ?? '—'} · Fundição DC</em>
        </div>
        <div className={styles.heroFacts}><article><span aria-hidden="true">◎</span><div><strong>Propósito</strong><small>Visibilidade operacional completa para decisões baseadas em dados.</small></div></article><article><span aria-hidden="true">≡</span><div><strong>Escopo</strong><small>Fundação operacional e primeiros indicadores corporativos.</small></div></article><article><span aria-hidden="true">↗</span><div><strong>Resultado</strong><small>Dados conectados que explicam a eficiência e viabilizam OEE.</small></div></article><article><span aria-hidden="true">◉</span><div><strong>Para quem</strong><small>Gestão, liderança e operação com a mesma informação.</small></div></article></div>
        {actionItems.length ? <div className={styles.actionNow} aria-label="O que exige ação agora"><h3>O que exige ação agora</h3><ol>{actionItems.map((item, index) => <li key={index}><strong>{item.title}</strong><span>{item.detail}</span></li>)}</ol></div> : null}
      </section>

      <section id="primeira-onda" className={styles.section} aria-labelledby="first-wave-title"><header><span>01</span><div><h2 id="first-wave-title">Primeira Onda — Fundação Operacional</h2><p>Quatorze capacidades em quatro momentos, preservando a ordem que constrói a base para o OEE.</p></div></header><div className={styles.roadmap}>{moments.map((moment) => <section key={moment.id} className={styles.moment} data-moment={moment.id} aria-labelledby={`moment-${moment.id}`}><h3 id={`moment-${moment.id}`}>{moment.title}</h3><div>{moment.capabilities.map((capability) => { const content = <><span className={styles.capabilityNumber}>{capability.id}</span><strong>{capability.name}</strong><small className={styles.priority}>{priorityLabel[capability.priority]}</small><span className={styles.status} data-status={capability.status}>{statusLabel[capability.status]}</span></>; return capability.href ? <a key={capability.id} href={withBase(scenarioPath(capability.href))} aria-label={`${capability.id} ${capability.name}, ${statusLabel[capability.status]}`}>{content}</a> : <article key={capability.id} aria-label={`${capability.id} ${capability.name}, ${statusLabel[capability.status]}`}>{content}</article>; })}</div></section>)}</div><div className={styles.roadmapLegend}><span data-status="MATERIALIZED">Materializado</span><span data-status="NEXT">Próxima cena</span><span data-status="FUTURE">Futuro</span><strong>Foco da Primeira Onda: fundação operacional → OEE</strong></div></section>

      <section className={styles.section} aria-labelledby="questions-title"><header><span>02</span><div><h2 id="questions-title">O que o HIKARI passa a responder?</h2><p>A Primeira Onda transforma dados operacionais em respostas para gestão e tomada de decisão.</p></div></header><div className={styles.questionMap}>{groups.map((group) => <section key={group} data-group={group}><h3>{group}</h3>{questions.filter((question) => question.group === group).map((question) => <button key={question.id} type="button" aria-pressed={selectedQuestionId === question.id} onClick={() => setSelectedQuestionId(question.id)} onFocus={() => setSelectedQuestionId(question.id)}><span>{question.id}</span>{question.text}</button>)}</section>)}</div><aside className={styles.questionDetail} aria-live="polite" aria-label="Capacidades relacionadas à pergunta selecionada"><div><span>{selectedQuestion.id}</span><strong>{selectedQuestion.text}</strong></div><p>Capacidades que contribuem:</p><ul>{selectedQuestion.capabilities.map((id) => <li key={id}><b>{id}</b> {capabilityNames[id]}</li>)}</ul></aside><p className={styles.visibilityStatement}>A combinação das capacidades e dos dados coletados constrói <strong>visibilidade operacional completa</strong>.</p></section>

      <section className={`${styles.section} ${styles.oeeSection}`} aria-labelledby="oee-title"><header><span>03</span><div><h2 id="oee-title">OEE como consequência da execução conectada</h2><p>A cadeia transforma dados operacionais qualificados em indicadores explicáveis.</p></div></header><div className={styles.dataChain}><article><span>01</span><strong>Dados de Plano</strong><p>O que produzir, quando e onde.</p></article><i>→</i><article><span>02</span><strong>Execução e Registro</strong><p>O que foi produzido, por quem e em qual máquina.</p></article><i>→</i><article><span>03</span><strong>Eventos e Contexto</strong><p>Paradas, motivos, restrições e interrupções.</p></article><i>→</i><article><span>04</span><strong>Produção e Qualidade</strong><p>Quantidades totais, boas, rejeitadas e retrabalho.</p></article><i>→</i><article><span>05</span><strong>Indicadores</strong><p>Disponibilidade, Desempenho e Qualidade.</p></article><i>→</i><div className={styles.oeeResult}><strong>OEE</strong><span>Disponibilidade</span><b>×</b><span>Desempenho</span><b>×</b><span>Qualidade</span></div></div><div className={styles.oeeQuestions}><span><b>Disponibilidade</b>Quanto tempo realmente produzimos?</span><span><b>Desempenho</b>Produzimos no ritmo esperado?</span><span><b>Qualidade</b>Quanto produzimos corretamente?</span><strong>Primeira Onda concluída · OEE disponível na perspectiva OEE</strong></div>
        <p className={styles.automationNote}><b>MES HIKARI ↕ Automação/Digitalização</b> A camada de Automação/Digitalização fornece fatos operacionais (estado, contagem, eventos) e reduz dependência de apontamentos manuais.</p>
        <p className={styles.businessQuestion}><b>Estamos protegendo a cadeia para atender a necessidade da Montagem hoje?</b> Condição atual: {oee?.mainImpact ? `${dimensionLabel[oee.mainImpact.dimension]} é o principal fator limitando o ritmo da Fundição — ` : ''}Usinagem em {downstreamStatusLabel[usinagem.status].toLowerCase()} de cobertura de {usinagem.criticalMaterial}. Avaliar buffer e prioridade de atendimento à Montagem com base apenas nos fatos demonstrativos capturados.</p>
      </section>

      <section className={styles.finalCta}><div><h2>Pronto para a demonstração?</h2><p>Explore o Plano Hora-Hora por máquina e veja como o HIKARI conecta planejamento, preparação e decisões operacionais.</p></div><a className={styles.primaryCta} href={withBase(scenarioPath('/production-scheduling'))}><span aria-hidden="true">▶</span> Iniciar demonstração</a></section>
    </main>
    <footer className={styles.footer}>HIKARI MES · Cenário demonstrativo · Regras e fontes sujeitas à validação e governança.</footer>
  </div>;
}
