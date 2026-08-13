import { Surface } from '../../shared/ui/Surface/Surface';
import { Stack } from '../../shared/ui/Stack/Stack';
import styles from './ProductionSchedulingPlaceholder.module.css';

export function ProductionSchedulingPlaceholder() {
  return (
    <Stack gap="large">
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Programação da Produção</span>
        <h1>O que precisamos produzir?</h1>
        <p>Fundação arquitetural preparada. A experiência WF-001 ainda não foi implementada.</p>
      </header>
      <Surface>
        <h2>Fundação do protótipo</h2>
        <p>Este espaço validará futuramente a experiência governada do Plano Hora-Hora.</p>
      </Surface>
    </Stack>
  );
}
