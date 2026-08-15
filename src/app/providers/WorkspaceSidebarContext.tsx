import { createContext, useContext, type RefObject } from 'react';

interface WorkspaceSidebarValue {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleButtonRef: RefObject<HTMLButtonElement | null>;
}

export const WorkspaceSidebarContext = createContext<WorkspaceSidebarValue | null>(null);

export function useWorkspaceSidebar() {
  const value = useContext(WorkspaceSidebarContext);
  if (!value) throw new Error('WorkspaceSidebarContext is not available');
  return value;
}
