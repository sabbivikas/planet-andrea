import { type ReactNode, useEffect } from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
  FadeOutDown,
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useMergePlanetsScreenStyles } from './MergePlanetsScreenStyles';
import { useMergePlanetsScreen, type MergePlanetsScreenProps } from './MergePlanetsScreenFunc';
import type { OrbitScreenDataV1 } from '@shared/generated-db-types';

// ── Constants ──

const DRIFT_DISTANCE_IN_PX = 8;
const DRIFT_DURATION_IN_MS = 3000;
const PARTICLE_COUNT = 4;
const PARTICLE_ORBIT_RADIUS = 52;

// ── Sub-components ──

interface SingleParticleProps {
  rotation: SharedValue<number>;
  index: number;
  color: string;
}

function SingleParticle(props: SingleParticleProps): ReactNode {
  const angle = (props.index / PARTICLE_COUNT) * 2 * Math.PI;
  const color = props.color;

  const particleStyle = useAnimatedStyle(() => {
    const currentAngle = (props.rotation.value * Math.PI) / 180 + angle;
    return {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: color,
      transform: [
        { translateX: Math.cos(currentAngle) * PARTICLE_ORBIT_RADIUS },
        { translateY: Math.sin(currentAngle) * PARTICLE_ORBIT_RADIUS },
      ],
    };
  });

  return <Animated.View style={particleStyle} />;
}

interface PlanetOrbitParticlesProps {
  style: object;
  colors: string[];
}

function PlanetOrbitParticles(props: PlanetOrbitParticlesProps): ReactNode {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  return (
    <>
      <SingleParticle rotation={rotation} index={0} color={props.colors[0 % props.colors.length]} />
      <SingleParticle rotation={rotation} index={1} color={props.colors[1 % props.colors.length]} />
      <SingleParticle rotation={rotation} index={2} color={props.colors[2 % props.colors.length]} />
      <SingleParticle rotation={rotation} index={3} color={props.colors[3 % props.colors.length]} />
    </>
  );
}

interface AnimatedPlanetProps {
  style: object;
  driftDirection: 1 | -1;
  particleColors: string[];
}

function AnimatedPlanet(props: AnimatedPlanetProps): ReactNode {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(props.driftDirection * DRIFT_DISTANCE_IN_PX, {
        duration: DRIFT_DURATION_IN_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <View style={props.style} />
      <PlanetOrbitParticles style={{}} colors={props.particleColors} />
    </Animated.View>
  );
}

const PULSE_SCALE_MIN = 1.0;
const PULSE_SCALE_MAX = 1.3;
const PULSE_DURATION_IN_MS = 1500;

interface WaitingForApprovalProps {
  mergeSymbolStyle: object;
}

function WaitingForApproval(props: WaitingForApprovalProps): ReactNode {
  const scale = useSharedValue(PULSE_SCALE_MIN);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(PULSE_SCALE_MAX, { duration: PULSE_DURATION_IN_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <Animated.View style={animatedStyle}>
        <CustomTextField styles={props.mergeSymbolStyle} title="⊕" />
      </Animated.View>
      <CustomTextField
        styles={{
          fontFamily: 'strenuous',
          fontSize: 16,
          color: 'rgba(255, 245, 236, 0.7)',
          textAlign: 'center',
        }}
        title="Waiting for Their Crew to approve..."
        numberOfLines={2}
      />
    </View>
  );
}

interface ToastBannerProps {
  message: string;
  style: object;
  textStyle: object;
}

function ToastBanner(props: ToastBannerProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={props.style}>
      <CustomTextField styles={props.textStyle} title={props.message} />
    </Animated.View>
  );
}

// ── Main Component ──

export default function MergePlanetsScreen(props: MergePlanetsScreenProps): ReactNode {
  const styles = useMergePlanetsScreenStyles();
  const {
    isLoading,
    screenData,
    isSubmitting,
    isOptimisticWaiting,
    toastMessage,
    onCollide,
    onSolo,
  } = useMergePlanetsScreen(props);

  const initiatingGroupName = screenData?.initiatingGroupName ?? 'Your Crew';
  const initiatingMemberCount = screenData?.initiatingGroupMemberCount ?? 0;
  const otherGroupName = screenData?.otherGroupName ?? 'Their Crew';
  const otherMemberCount = screenData?.otherGroupMemberCount ?? 0;
  const activityName = screenData?.activityName;
  const activityAddress = screenData?.activityAddress;
  const isInitiating = screenData?.isInitiatingGroup ?? true;
  const mergeStatus = screenData?.mergeRequest?.status;

  const collideButtonLabel = isInitiating ? "LET'S COLLIDE 🌍" : 'APPROVE MERGE 🌍';

  // Disable button if already submitted or wrong state
  const isActionable =
    !isSubmitting &&
    mergeStatus !== 'MERGED' &&
    mergeStatus !== 'DECLINED' &&
    (isInitiating ? mergeStatus !== 'INITIATED' : true);

  return (
    <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Eyebrow label */}
        <View style={styles.header}>
          <CustomTextField styles={styles.eyebrowText} title="PLANET COLLISION" />
        </View>

        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={props.onClose}>
          <CustomTextField styles={styles.closeButtonText} title="✕" />
        </Pressable>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#FF5C4D" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          >
            {/* Animation area */}
            <View style={styles.animationArea}>
              <View style={styles.planetRow}>
                {/* Left planet */}
                <View style={styles.planetWrapper}>
                  <AnimatedPlanet
                    style={styles.leftPlanet}
                    driftDirection={1}
                    particleColors={['#FF5C4D', '#CFFF47', '#FF5C4D', '#CFFF47']}
                  />
                  <View style={styles.planetLabel}>
                    <CustomTextField
                      styles={styles.planetGroupName}
                      title={initiatingGroupName}
                      numberOfLines={2}
                    />
                    <CustomTextField
                      styles={styles.planetMemberCount}
                      title={`${initiatingMemberCount} members`}
                    />
                  </View>
                </View>

                {/* Merge symbol */}
                <CustomTextField styles={styles.mergeSymbol} title="⊕" />

                {/* Right planet */}
                <View style={styles.planetWrapper}>
                  <AnimatedPlanet
                    style={styles.rightPlanet}
                    driftDirection={-1}
                    particleColors={['#CFFF47', '#FF5C4D', '#CFFF47', '#FF5C4D']}
                  />
                  <View style={styles.planetLabel}>
                    <CustomTextField
                      styles={styles.planetGroupName}
                      title={otherGroupName}
                      numberOfLines={2}
                    />
                    <CustomTextField
                      styles={styles.planetMemberCount}
                      title={`${otherMemberCount} members`}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Content */}
            <View style={styles.contentArea}>
              <CustomTextField styles={styles.title} title="MERGE PLANETS?" />
              {activityName != null && (
                <CustomTextField
                  styles={styles.activityName}
                  title={`${activityName}${activityAddress != null ? ` · ${activityAddress}` : ''}`}
                  numberOfLines={2}
                />
              )}
              <CustomTextField
                styles={styles.tagline}
                title="Both crews are heading here tonight. Join forces?"
                numberOfLines={3}
              />
            </View>

            {/* Bottom buttons */}
            <View style={styles.bottomArea}>
              {(isOptimisticWaiting || (mergeStatus === 'INITIATED' && isInitiating)) ? (
                <WaitingForApproval mergeSymbolStyle={styles.mergeSymbol} />
              ) : isActionable ? (
                <CustomButton
                  styles={styles.collideButton}
                  title={collideButtonLabel}
                  onPress={onCollide}
                  disabled={isSubmitting}
                />
              ) : (
                <CustomButton
                  styles={styles.collideButton}
                  title={collideButtonLabel}
                  onPress={onCollide}
                  disabled
                />
              )}
              <Pressable onPress={onSolo}>
                <CustomTextField styles={styles.soloLink} title="Stay Solo" />
              </Pressable>
            </View>
          </ScrollView>
        )}

        {toastMessage != null && (
          <ToastBanner
            message={toastMessage}
            style={styles.toastContainer}
            textStyle={styles.toastText}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
