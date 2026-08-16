import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { withBase } from '../routing/basePath';
import { useApplicationContext } from '../providers/ApplicationContext';
import { useWorkspaceSidebar } from '../providers/WorkspaceSidebarContext';
import { Button } from '../../shared/ui/Button/Button';
import { currentJourneyIndex, DEMO_JOURNEY } from './demoJourney';
import styles from './OperationalWorkspace.module.css';

export type OperationalPerspective = 'STRATEGIC' | 'PLAN' | 'READINESS' | 'EXECUTION' | 'MONITORING' | 'ADHERENCE' | 'QUALITY' | 'OEE' | 'ORDER';

/** Portaled to document.body (not the sidebar tree) so its z-index can actually win against Lot/Resource modals, which are portals too — a same-tree z-index cannot outrank a sibling portal's stacking context. */
function DemoJourneyBar({ pathname, search }: { pathname: string; search: string }) {
  const journeyIndex = currentJourneyIndex(pathname, search);
  if (journeyIndex === -1) return null;
  const journeyStep = DEMO_JOURNEY[journeyIndex];
  const previousStep = journeyIndex > 0 ? DEMO_JOURNEY[journeyIndex - 1] : undefined;
  const nextStep = journeyIndex < DEMO_JOURNEY.length - 1 ? DEMO_JOURNEY[journeyIndex + 1] : undefined;
  return createPortal(<nav className={styles.journey} aria-label="Navegação guiada da demonstração"><small>Demo guiada · Etapa {journeyStep.id}/08</small><strong>{journeyStep.label}</strong><div>{previousStep ? <a href={withBase(previousStep.href)}>← Anterior</a> : <span aria-hidden="true" />}{nextStep ? <a href={withBase(nextStep.href)}>Próximo →</a> : <a href={withBase('/demo/fundicao-dc')}>Visão Executiva →</a>}</div></nav>, document.body);
}

export function OperationalWorkspace({ perspective, lotId, sidebarContent, children }: { perspective: OperationalPerspective; lotId?: string | null; sidebarContent: ReactNode; children: ReactNode }) {
  const { expanded, setExpanded, toggleButtonRef } = useWorkspaceSidebar();
  const { productiveArea, availableProductiveAreas, setProductiveArea } = useApplicationContext();
  const location = useLocation();
  return <div className={styles.layout} data-sidebar-expanded={expanded}>
    {expanded ? <button className={styles.backdrop} aria-label="Recolher sidebar" onClick={() => { setExpanded(false); toggleButtonRef.current?.focus(); }} /> : null}
    <aside id="operational-workspace-sidebar" className={styles.sidebar} aria-label="Operational Workspace">
      <div className={styles.brand}><a href={withBase('/demo/fundicao-dc/production-scheduling')} aria-label="HIKARI MES — Operational Workspace"><span className={styles.brandMark}>H</span><span className={styles.brandName}><b>HIKARI</b> MES</span></a><Button ref={toggleButtonRef} aria-label={expanded ? 'Recolher sidebar' : 'Expandir sidebar'} aria-expanded={expanded} aria-controls="operational-workspace-sidebar" onClick={() => setExpanded(!expanded)}>{expanded ? '«' : '»'}</Button></div>
      <nav className={styles.perspectives} aria-label="Perspectivas operacionais"><a href={withBase('/demo/fundicao-dc')} title="Visão Executiva">⌂ <span>Visão Executiva<small>Programa HIKARI</small></span></a><a aria-current={perspective === 'STRATEGIC' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/strategic')} title="Visão Estratégica">★ <span>Visão Estratégica<small>Como está a saúde da Fundição DC?</small></span></a><strong title="Produção">P <span>Produção</span></strong><a aria-current={perspective === 'PLAN' ? 'page' : undefined} href={withBase(`/demo/fundicao-dc/production-scheduling${lotId ? `?lotId=${lotId}` : ''}`)} title="Plano">▤ <span>Plano<small>O que precisamos produzir?</small></span></a><a aria-current={perspective === 'READINESS' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/production-readiness')} title="Preparação">✓ <span>Preparação<small>Temos condições de produzir?</small></span></a><a aria-current={perspective === 'EXECUTION' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/production-execution')} title="Execução">▶ <span>Execução<small>O que está sendo executado agora?</small></span></a><a aria-current={perspective === 'MONITORING' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/production-monitoring')} title="Acompanhamento">◉ <span>Acompanhamento<small>O que está acontecendo agora?</small></span></a><a aria-current={perspective === 'ADHERENCE' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/production-adherence')} title="Aderência">◈ <span>Aderência<small>Estamos conforme o planejado?</small></span></a><a aria-current={perspective === 'QUALITY' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/production-quality')} title="Qualidade & Desempenho">◆ <span>Qualidade &amp; Desempenho<small>Quanto produzimos e quanto perdemos?</small></span></a><a aria-current={perspective === 'OEE' ? 'page' : undefined} href={withBase('/demo/fundicao-dc/oee')} title="OEE">● <span>OEE<small>Como estamos performando e por quê?</small></span></a></nav>
      <section className={styles.context} aria-label="Contexto da aplicação"><span aria-hidden="true">⌾</span><div><small>Área Produtiva</small><label><span className={styles.srOnly}>Área Produtiva</span><select aria-label="Área Produtiva" value={productiveArea.id} onChange={(event) => setProductiveArea(event.target.value as typeof productiveArea.id)}>{availableProductiveAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}</select></label><small>Cenário</small><strong>Demonstrativo</strong><span className={styles.srOnly}>Cenário demonstrativo</span></div></section>
      <div className={styles.sidebarContent}>{sidebarContent}</div>
    </aside>
    <div className={styles.workspace}>{children}</div>
    <DemoJourneyBar pathname={location.pathname} search={location.search} />
  </div>;
}
