import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Orbit } from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { t } from '@/i18n';
import { useIndexStyles } from './IndexStyles';
import { useIndex } from './IndexFunc';
import { IndexProps } from '@/app/index';

const BACKGROUND_IMAGE_URI = 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&h=1280&w=720';
const ORBIT_ICON_COLOR = '#FF5C4D';
const ORBIT_ICON_SIZE = 80;

export default function IndexContainer(props: IndexProps): ReactNode {
  const { styles, getStartedButtonStyles } = useIndexStyles();
  const {
    contentOpacity,
    contentTranslateY,
    buttonsOpacity,
    buttonsTranslateY,
    onGetStartedPress,
    onHaveAccountPress,
  } = useIndex(props);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: BACKGROUND_IMAGE_URI }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.darkOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.topSection, contentAnimatedStyle]}>
            <CustomTextField styles={styles.appName} title={t('app.name')} />
            <CustomTextField styles={styles.heroTagline} title={t('index.heroTagline')} />
          </Animated.View>

          <Animated.View style={[styles.middleSection, contentAnimatedStyle]}>
            <View style={styles.orbitIcon}>
              <Orbit size={ORBIT_ICON_SIZE} color={ORBIT_ICON_COLOR} strokeWidth={1.5} />
            </View>
            <CustomTextField styles={styles.headline} title={t('index.headline')} />
            <CustomTextField styles={styles.subtitle} title={t('index.subtitle')} />
          </Animated.View>

          <Animated.View style={[styles.bottomSection, buttonsAnimatedStyle]}>
            <CustomButton
              styles={getStartedButtonStyles}
              title={t('index.getStarted')}
              onPress={onGetStartedPress}
            />
            <Pressable onPress={onHaveAccountPress}>
              <CustomTextField styles={styles.haveAccountText} title={t('index.haveAccount')} />
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
