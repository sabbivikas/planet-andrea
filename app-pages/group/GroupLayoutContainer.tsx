/**
 * Main container for the GroupLayout route
 * @todo AUTO-GENERATED STUB - replace with actual implementation and content
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';

import { GroupLayoutProps } from '@/app/group/_layout';
import { useGroupLayoutStyles } from './GroupLayoutStyles';

export default function GroupLayoutContainer(props: GroupLayoutProps): ReactNode {
  const { styles } = useGroupLayoutStyles();

  return <View style={styles.container}>{props.children}</View>;
}
