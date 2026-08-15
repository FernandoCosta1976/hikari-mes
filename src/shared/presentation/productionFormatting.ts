import type { DemandDestination } from '../../domain/production-scheduling/models';

export const destinationLabels: Record<DemandDestination, string> = {
  ASSEMBLY: 'Montagem',
  SPARE_PARTS: 'Reposição',
  ENGINEERING: 'Engenharia',
};

export function formatDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}
