/**
 * Main container for the ActivityLayout route
 * @todo AUTO-GENERATED STUB - replace with actual implementation and content
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';

import { ActivityLayoutProps } from '@/app/activity/_layout';
import { useActivityLayoutStyles } from './ActivityLayoutStyles';

export default function ActivityLayoutContainer(props: ActivityLayoutProps): ReactNode {
  const { styles } = useActivityLayoutStyles();

  return <View style={styles.container}>{props.children}</View>;
}
