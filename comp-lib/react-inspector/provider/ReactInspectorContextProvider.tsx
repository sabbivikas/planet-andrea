import { type PropsWithChildren, type ReactNode, createContext } from 'react';

import type { ReactElementData } from '@shared/inspector/element-inspector-types.ts';
import type { InspectorServerStatus } from '../react-inspector-types.ts';
import { useReactInspectorContextProvider } from './ReactInspectorContextProviderFunc.ts';

export type ReactInspectorContextValue = {
  status: InspectorServerStatus;
  onElementSelected: (selectionId: string, data?: ReactElementData) => void;
  onElementUnselected: (selectionId: string) => void;
  onClearAllElements: () => void;
  onStatusChange: (newStatus: InspectorServerStatus) => void;
};

const ReactInspectorContextDefaultValue: ReactInspectorContextValue = {
  status: 'off',
  onElementSelected: () => {
    throw new Error(
      'Element inspector is not implemented yet. Did you forget to wrap your component in <InspectorContextProvider>?',
    );
  },
  onElementUnselected: () => {
    throw new Error(
      'Element inspector is not implemented yet. Did you forget to wrap your component in <InspectorContextProvider>?',
    );
  },
  onClearAllElements: () => {
    throw new Error(
      'Element inspector is not implemented yet. Did you forget to wrap your component in <InspectorContextProvider>?',
    );
  },
  onStatusChange: (_newStatus: InspectorServerStatus) => {
    throw new Error(
      'Element inspector is not implemented yet. Did you forget to wrap your component in <InspectorContextProvider>?',
    );
  },
};

export const ReactInspectorContext = createContext<ReactInspectorContextValue>(ReactInspectorContextDefaultValue);

interface ReactInspectorContextProviderProps extends PropsWithChildren {}

export function ReactInspectorContextProvider(props: ReactInspectorContextProviderProps): ReactNode {
  const { value } = useReactInspectorContextProvider();
  return <ReactInspectorContext.Provider value={value}>{props.children}</ReactInspectorContext.Provider>;
}
