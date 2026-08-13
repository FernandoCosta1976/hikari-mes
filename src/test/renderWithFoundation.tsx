import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ApplicationContextProvider } from '../app/providers/ApplicationContext';

export function renderWithFoundation(element: ReactElement) {
  return render(<ApplicationContextProvider>{element}</ApplicationContextProvider>);
}
