import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import type { AllActionKeys } from '@shared/schema-types';
import { useNavigationAction } from './NavigationActionFunc';
import { useNavigationActionStyles } from './NavigationActionStyles';

export interface NavigationActionProps {
  actionType: AllActionKeys;
  description: string;
  onPress?: () => void;
}

export function NavigationAction(props: NavigationActionProps): ReactNode {
  const { styles } = useNavigationActionStyles();
  const { actionTitle, IconComponent } = useNavigationAction({ actionType: props.actionType });

  return (
    <Pressable style={styles.pressable} onPress={props.onPress}>
      <View style={styles.container}>
        {IconComponent && (
          <View style={styles.iconContainer}>
            <IconComponent size={14} color={styles.icon.backgroundColor} />
          </View>
        )}
        <View style={styles.content}>
          <CustomTextField title={actionTitle} styles={styles.titleText} />
          <CustomTextField title={props.description} styles={styles.descriptionText} />
        </View>
      </View>
    </Pressable>
  );
}
