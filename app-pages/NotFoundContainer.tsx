/**
 * Main container for the NotFound route
 */
import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Compass } from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { t } from '@/i18n';
import { useNotFoundStyles } from './NotFoundStyles';
import { useNotFound } from './NotFoundFunc';
import { NotFoundProps } from '@/app/+not-found';

const COMPASS_ICON_SIZE = 48;
const COMPASS_ICON_COLOR = '#FF5C4D';

export default function NotFoundContainer(props: NotFoundProps): ReactNode {
  const { styles, ctaButtonStyles } = useNotFoundStyles();
  const {
    isAuthenticated,
    iconOpacity,
    iconScale,
    compassRotation,
    contentOpacity,
    contentTranslateY,
    buttonOpacity,
    buttonTranslateY,
    onCtaPress,
  } = useNotFound(props);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const compassAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const ctaTitle = isAuthenticated
    ? t('notFound.backToDiscover')
    : t('notFound.goHome');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.iconArea, iconAnimatedStyle]}>
          <CustomTextField styles={styles.errorCode} title={t('notFound.errorCode')} />
          <View style={styles.compassGlow} />
          <Animated.View style={[styles.compassRing, compassAnimatedStyle]}>
            <View style={styles.compassIconView}>
              <Compass size={COMPASS_ICON_SIZE} color={COMPASS_ICON_COLOR} />
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
          <CustomTextField styles={styles.title} title={t('notFound.title')} />
          <CustomTextField styles={styles.subtitle} title={t('notFound.subtitle')} />
        </Animated.View>

        <Animated.View style={[styles.buttonArea, buttonAnimatedStyle]}>
          <CustomButton
            styles={ctaButtonStyles}
            title={ctaTitle}
            onPress={onCtaPress}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
