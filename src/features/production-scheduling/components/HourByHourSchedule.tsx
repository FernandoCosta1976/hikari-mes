import { useRef } from 'react';
import type { Lot, Material, WorkCenter } from '../../../domain/production-scheduling/models';
import { timelinePosition, timelineWidth } from '../../../domain/production-scheduling/temporalMath';
import { destinationLabels, formatTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';

export function HourByHourSchedule({ lots, materials, workCenter, selectedLotId, onSelectLot }: { lots: readonly Lot[]; materials: readonly Material[]; workCenter: WorkCenter; selectedLotId: string | null; onSelectLot: (lot: Lot) => void }) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const day = lots[0]?.scheduledStart.slice(0, 10) ?? '2025-05-15';
  const rangeStart = `${day}T16:00:00-03:00`;
  const rangeFinish = `${day}T23:30:00-03:00`;
  const hours = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const moveFocus = (index: number, direction: number) => {
    const target = (index + direction + lots.length) % lots.length;
    buttons.current[target]?.focus();
  };
  return (
    <section className={styles.timelineSection} aria-labelledby="timeline-title">
      <div className={styles.sectionHeading}>
        <div><span className={styles.step}>3</span><h2 id="timeline-title">Plano Hora-Hora</h2><p><strong>Plano recebido — Balancing</strong> · sequência planejada no Centro de Trabalho</p></div>
        <span className={styles.timelineHint}>Use ← → para navegar entre Lotes</span>
      </div>
      <div className={styles.timelineScroller} tabIndex={0} aria-label="Linha do tempo contínua do plano">
        <div className={styles.timeline}>
          <div className={styles.hourAxis} aria-hidden="true">{hours.map((hour) => <span key={hour}>{hour}</span>)}</div>
          <div className={styles.workCenterLabel}><strong>Centro de Trabalho</strong><span>{workCenter.name}</span><small>Recurso ainda não atribuído</small><em>Sequência operacional será definida posteriormente</em></div>
          <div className={styles.lotTrack} aria-label="Lotes programados">
            {lots.map((lot, index) => {
              const material = materials.find((item) => item.id === lot.materialId)!;
              const label = `Lote ${lot.lotNumber}, ${material.name}, ${lot.quantity} peças, início previsto ${formatTime(lot.scheduledStart)}, término previsto ${formatTime(lot.scheduledFinish)}`;
              return <button key={lot.id} ref={(node) => { buttons.current[index] = node; }} type="button" className={styles.lotBlock} data-destination={lot.destination} data-lot-id={lot.id} aria-pressed={selectedLotId === lot.id} style={{ left: `${timelinePosition(lot.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(lot.scheduledStart, lot.scheduledFinish, rangeStart, rangeFinish)}%` }} aria-label={label} onClick={() => onSelectLot(lot)} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(index, 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(index, -1); } }}>
                <strong>Lote {lot.lotNumber}</strong><span>{material.name}</span><span>{lot.quantity} peças</span><small>{formatTime(lot.scheduledStart)} → {formatTime(lot.scheduledFinish)}</small><em>{destinationLabels[lot.destination]}</em>
              </button>;
            })}
            {lots.length === 0 ? <p className={styles.emptyTimeline}>Nenhum Lote neste destino.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
