import { useEffect, useRef, useState } from 'react';
import type { Lot, Material, ProductionOrder, WorkCenter } from '../../../domain/production-scheduling/models';
import { Badge } from '../../../shared/ui/Badge/Badge';
import { Button } from '../../../shared/ui/Button/Button';
import { destinationLabels, formatTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';

export function LotDetail({ lot, material, order, workCenter, onClose }: { lot: Lot; material: Material; order: ProductionOrder; workCenter: WorkCenter; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const [handoffReady, setHandoffReady] = useState(false);
  useEffect(() => { closeButton.current?.focus(); }, [lot.id]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <aside className={styles.detail} role="dialog" aria-modal="false" aria-labelledby="lot-detail-title">
      <header><div><span className={styles.overline}>Detalhe contextual</span><h2 id="lot-detail-title">Lote {lot.lotNumber}</h2></div><Button ref={closeButton} aria-label="Fechar detalhe do Lote" onClick={onClose}>Fechar</Button></header>
      <Badge tone="informational">Programado</Badge>
      <dl>
        <div><dt>Material</dt><dd>{material.name} ({material.code})</dd></div>
        <div><dt>Quantidade</dt><dd>{lot.quantity} peças</dd></div>
        <div><dt>Início previsto</dt><dd>{formatTime(lot.scheduledStart)}</dd></div>
        <div><dt>Término previsto</dt><dd>{formatTime(lot.scheduledFinish)}</dd></div>
        <div><dt>Centro de Trabalho</dt><dd>{workCenter.name}</dd></div>
        <div><dt>Destino</dt><dd>{destinationLabels[lot.destination]}</dd></div>
        <div><dt>Ordem de Produção</dt><dd>OP {order.orderNumber}</dd></div>
        <div><dt>Conciliação</dt><dd>{order.correlatedLotIds.length} Lotes relacionados</dd></div>
        <div><dt>Cobertura do buffer</dt><dd>2,4 → 3,1 dias (demonstrativo)</dd></div>
        <div><dt>Matéria-prima</dt><dd>{lot.materialAttention ? 'Requer atenção na preparação' : 'Sem atenção conhecida'}</dd></div>
        <div><dt>Recurso</dt><dd>Ainda não atribuído</dd></div>
      </dl>
      <div className={styles.detailAction}><Button onClick={() => setHandoffReady(true)}>Avaliar preparação</Button><small>{handoffReady ? 'Contexto preparado para a futura Preparação para Produção. Nenhuma liberação foi realizada.' : 'Prepara a transição futura; não libera nem inicia produção.'}</small></div>
    </aside>
  );
}
