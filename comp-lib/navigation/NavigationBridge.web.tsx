import { ReactNode } from 'react';

import { type NavigationBridgeProps } from './NavigationBridge';

export function NavigationBridge(props: NavigationBridgeProps): ReactNode {
  return props.children;
}
