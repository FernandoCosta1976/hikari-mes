import { useRef, useState, type ReactElement, type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ApplicationContextProvider } from '../app/providers/ApplicationContext';
import { WorkspaceSidebarContext } from '../app/providers/WorkspaceSidebarContext';

export function FoundationProviders({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  return <ApplicationContextProvider><WorkspaceSidebarContext.Provider value={{ expanded, setExpanded, toggleButtonRef }}>{children}</WorkspaceSidebarContext.Provider></ApplicationContextProvider>;
}

export function renderWithFoundation(element: ReactElement) {
  return render(<FoundationProviders><MemoryRouter initialEntries={['/demo/fundicao-dc/production-scheduling']}>{element}</MemoryRouter></FoundationProviders>);
}
