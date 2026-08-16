import { useState } from 'react';
import { selectScenarioModified, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { Button } from '../ui/Button/Button';
import styles from './ScenarioResetControl.module.css';

/**
 * Single reset control shared by every operational perspective, so the
 * confirmation and the "cenário alterado" indicator behave identically
 * everywhere instead of each page owning its own reset button.
 */
export function ScenarioResetControl() {
  const modified = useScenarioStore(selectScenarioModified);
  const resetScenario = useScenarioStore((state) => state.resetScenario);
  const [confirming, setConfirming] = useState(false);
  return <div className={styles.control}>
    {modified ? <span className={styles.badge} tabIndex={0} data-tip="Este cenário contém decisões realizadas durante a demonstração." aria-label="Cenário demonstrativo · Alterado — este cenário contém decisões realizadas durante a demonstração"><span aria-hidden="true">●</span> Alterado</span> : null}
    <Button onClick={() => setConfirming(true)}>Reiniciar cenário</Button>
    {confirming ? <div className={styles.confirm} role="alertdialog" aria-modal="true" aria-labelledby="reset-confirm-title">
      <strong id="reset-confirm-title">Reiniciar cenário demonstrativo?</strong>
      <p>Todas as alterações realizadas nesta demonstração serão descartadas.</p>
      <div className={styles.confirmActions}>
        <Button onClick={() => setConfirming(false)}>Cancelar</Button>
        <Button onClick={() => { resetScenario(); setConfirming(false); }}>Reiniciar cenário</Button>
      </div>
    </div> : null}
  </div>;
}
