export interface ProductiveArea {
  id: string;
  label: string;
}

export const productiveAreas = [{ id: 'fundicao-dc', label: 'Fundição DC' }] as const satisfies readonly ProductiveArea[];
export const defaultProductiveArea: ProductiveArea = productiveAreas[0];
