/**
 * Main container for the BusinessLayout route
 * @todo AUTO-GENERATED STUB - replace with actual implementation and content
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';

import { BusinessLayoutProps } from '@/app/business/_layout';
import { useBusinessLayoutStyles } from './BusinessLayoutStyles';

export default function BusinessLayoutContainer(props: BusinessLayoutProps): ReactNode {
  const { styles } = useBusinessLayoutStyles();

  return <View style={styles.container}>{props.children}</View>;
}
