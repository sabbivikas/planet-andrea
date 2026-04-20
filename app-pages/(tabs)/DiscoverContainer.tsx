import { type ReactNode } from 'react';
import 'react-native-reanimated';
import Animated, {
  type SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, Modal, Text, Image as RNImage, ScrollView, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, MapPin, RotateCcw, Info, ArrowUp, ArrowDown, Star, Navigation, Tag, Loader, DollarSign } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useDiscoverStyles } from './DiscoverStyles';
import { useDiscover, type ActivityCardData, type GroupMemberSwipeIndicator } from './DiscoverFunc';
import { DiscoverProps } from '@/app/(tabs)/discover';
import {
  type HeaderStyles,
  type CityPickerStyles,
  type CardStyles,
  type ActionButtonsStyles,
  type GroupIndicatorsStyles,
  type EmptyStateStyles,
  type InfoSheetStyles,
} from './DiscoverStyles';

const voltGreenHandIllustration = require('@/assets/images/volt-green-hand.png');

// ── Constants ──

const SWIPE_THRESHOLD_X = 120;
const SWIPE_THRESHOLD_Y = -100;
const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };
const CATEGORY_LABELS: Record<string, string> = {
  NIGHTLIFE: 'Nightlife',
  FOOD_AND_DRINKS: 'Food & Drinks',
  OUTDOOR: 'Outdoors',
  LIVE_MUSIC: 'Live Music',
  SPORTS: 'Sports',
  ARTS: 'Arts',
  GAMING: 'Trivia & Games',
  WELLNESS: 'Wellness',
  COMEDY: 'Comedy',
};

// ── Sub-components ──

interface DiscoverHeaderProps {
  styles: HeaderStyles;
  locationLabel: string;
  unreadCount: number;
  onNotificationPress: () => void;
  onLocationPress: () => void;
}

function DiscoverHeader(props: DiscoverHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.logoText} title="PLANET" />
      <Pressable style={props.styles.locationContainer} onPress={props.onLocationPress}>
        <View style={props.styles.locationIcon}>
          <MapPin size={14} color="#FFF5EC" />
        </View>
        <CustomTextField styles={props.styles.locationText} title={props.locationLabel} />
      </Pressable>
      <Pressable style={props.styles.bellContainer} onPress={props.onNotificationPress}>
        <View style={props.styles.bellIcon}>
          <Bell size={22} color="#FFF5EC" />
        </View>
        {props.unreadCount > 0 && (
          <View style={props.styles.badgeContainer}>
            <CustomTextField styles={props.styles.badgeText} title={String(props.unreadCount)} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

interface CityPickerProps {
  styles: CityPickerStyles;
  cities: string[];
  selectedCity: string;
  visible: boolean;
  onSelect: (city: string) => void;
  onClose: () => void;
}

function CityPicker(props: CityPickerProps): ReactNode {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <Pressable style={props.styles.overlay} onPress={props.onClose}>
        <Pressable style={props.styles.sheet} onPress={() => {}}>
          <Text style={props.styles.sheetTitle}>{t('discover.selectCity')}</Text>
          {props.cities.map((city) => {
            const isSelected = city === props.selectedCity;
            function onCityPress(): void {
              props.onSelect(city);
            }
            return (
              <Pressable
                key={city}
                style={[props.styles.cityItem, isSelected ? props.styles.cityItemSelected : undefined]}
                onPress={onCityPress}
              >
                <Text style={[props.styles.cityText, isSelected ? props.styles.cityTextSelected : undefined]}>
                  {city}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface ActivityCardContentProps {
  styles: CardStyles;
  card: ActivityCardData;
}

function ActivityCardContent(props: ActivityCardContentProps): ReactNode {
  const categoryLabel = CATEGORY_LABELS[props.card.category] ?? props.card.category;

  return (
    <View style={props.styles.container}>
      <Image
        source={{ uri: props.card.imageUrl }}
        style={props.styles.image}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(27, 42, 74, 0.95)']}
        style={props.styles.imageOverlay}
      />
      <View style={props.styles.categoryBadge}>
        <CustomTextField styles={props.styles.categoryBadgeText} title={categoryLabel} />
      </View>
      {props.card.dealHeadline != null && (
        <View style={props.styles.dealBanner}>
          <View style={{ width: 12, height: 12 }}>
            <Tag size={10} color="#FFF5EC" />
          </View>
          <CustomTextField styles={props.styles.dealBannerText} title={t('discover.dealBadge')} />
        </View>
      )}
      <View style={props.styles.contentContainer}>
        <CustomTextField styles={props.styles.venueName} title={props.card.venueName} />
        <CustomTextField styles={props.styles.activityTitle} title={props.card.title} />
        <View style={props.styles.metaRow}>
          <View style={props.styles.metaItem}>
            <View style={props.styles.metaIcon}>
              <Navigation size={12} color="rgba(255, 245, 236, 0.9)" />
            </View>
            <CustomTextField
              styles={props.styles.metaText}
              title={`${props.card.distanceInKm} km`}
            />
          </View>
          <View style={props.styles.metaItem}>
            <View style={props.styles.metaIcon}>
              <Star size={12} color="#CFFF47" fill="#CFFF47" />
            </View>
            <CustomTextField
              styles={props.styles.metaText}
              title={String(props.card.rating)}
            />
          </View>
          <View style={props.styles.metaItem}>
            <View style={props.styles.metaIcon}>
              <DollarSign size={12} color="rgba(255, 245, 236, 0.9)" />
            </View>
            <CustomTextField
              styles={props.styles.metaText}
              title={props.card.priceLabel}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

interface NextCardPreviewProps {
  styles: CardStyles;
  card: ActivityCardData;
}

function NextCardPreview(props: NextCardPreviewProps): ReactNode {
  return (
    <View style={props.styles.nextCard}>
      <Image
        source={{ uri: props.card.imageUrl }}
        style={props.styles.image}
        contentFit="cover"
      />
    </View>
  );
}

interface SwipeOverlayProps {
  styles: CardStyles;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
}

function SwipeOverlay(props: SwipeOverlayProps): ReactNode {
  const likeStyle = useAnimatedStyle(() => ({
    ...props.styles.swipeOverlay,
    ...props.styles.swipeLikeOverlay,
    opacity: interpolate(
      props.translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const passStyle = useAnimatedStyle(() => ({
    ...props.styles.swipeOverlay,
    ...props.styles.swipePassOverlay,
    opacity: interpolate(
      props.translateX.value,
      [0, -SWIPE_THRESHOLD_X],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const superLikeStyle = useAnimatedStyle(() => ({
    ...props.styles.swipeOverlay,
    ...props.styles.swipeSuperLikeOverlay,
    opacity: interpolate(
      props.translateY.value,
      [0, SWIPE_THRESHOLD_Y],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const likeTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const passTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.translateX.value,
      [0, -SWIPE_THRESHOLD_X],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const superLikeTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.translateY.value,
      [0, SWIPE_THRESHOLD_Y],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const scrollDownStyle = useAnimatedStyle(() => ({
    ...props.styles.swipeOverlay,
    ...props.styles.swipeScrollDownOverlay,
    opacity: interpolate(
      props.translateY.value,
      [0, 200],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const scrollDownTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.translateY.value,
      [0, 200],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <>
      <Animated.View style={likeStyle} pointerEvents="none">
        <Animated.Text
          allowFontScaling={false}
          style={[props.styles.swipeOverlayText, props.styles.swipeLikeText, likeTextStyle]}
        >
          {t('discover.swipeLike')}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={passStyle} pointerEvents="none">
        <Animated.Text
          allowFontScaling={false}
          style={[props.styles.swipeOverlayText, props.styles.swipePassText, passTextStyle]}
        >
          {t('discover.swipeNope')}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={superLikeStyle} pointerEvents="none">
        <Animated.Text
          allowFontScaling={false}
          style={[props.styles.swipeOverlayText, props.styles.swipeSuperLikeText, superLikeTextStyle]}
        >
          {t('discover.swipeSuper')}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={scrollDownStyle} pointerEvents="none">
        <Animated.Text
          allowFontScaling={false}
          style={[props.styles.swipeOverlayText, props.styles.swipeScrollDownText, scrollDownTextStyle]}
        >
          {t('discover.swipeScrollDown')}
        </Animated.Text>
      </Animated.View>
    </>
  );
}

interface DiscoverActionButtonsProps {
  styles: ActionButtonsStyles;
  onUndo: () => void;
  onInfo: () => void;
  onSuperLike: () => void;
  onScrollDown: () => void;
  canUndo: boolean;
}

function DiscoverActionButtons(props: DiscoverActionButtonsProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomButton
        onPress={props.onUndo}
        styles={props.styles.undoButton}
        disabled={!props.canUndo}
        leftIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <RotateCcw size={size ?? 22} color={color as string} />
          </View>
        )}
      />
      <CustomButton
        onPress={props.onScrollDown}
        styles={props.styles.scrollDownButton}
        leftIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <ArrowDown size={size ?? 28} color={color as string} />
          </View>
        )}
      />
      <CustomButton
        onPress={props.onSuperLike}
        styles={props.styles.superLikeButton}
        leftIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <ArrowUp size={size ?? 28} color={color as string} />
          </View>
        )}
      />
      <CustomButton
        onPress={props.onInfo}
        styles={props.styles.infoButton}
        leftIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <Info size={size ?? 22} color={color as string} />
          </View>
        )}
      />
    </View>
  );
}

interface GroupSwipeIndicatorsProps {
  styles: GroupIndicatorsStyles;
  members: GroupMemberSwipeIndicator[];
}

function GroupSwipeIndicators(props: GroupSwipeIndicatorsProps): ReactNode {
  const swipingMembers = props.members.filter((m) => m.isSwiping);
  if (swipingMembers.length === 0) return undefined;

  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.label} title={t('discover.crewSwiping')} />
      <View style={props.styles.avatarsRow}>
        {swipingMembers.map((member) => (
          <View key={member.id} style={props.styles.avatarContainer}>
            <CustomTextField styles={props.styles.avatarText} title={member.avatarInitial} />
            <View style={props.styles.swipingDot} />
          </View>
        ))}
      </View>
    </View>
  );
}

interface DiscoverEmptyStateProps {
  styles: EmptyStateStyles;
  onRefresh: () => void;
}

function DiscoverEmptyState(props: DiscoverEmptyStateProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <RNImage source={voltGreenHandIllustration} style={props.styles.illustration} />
      </View>
      <CustomTextField styles={props.styles.title} title={t('discover.emptyTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('discover.emptySubtitle')} />
      <View style={props.styles.refreshButtonContainer}>
        <CustomButton
          styles={props.styles.refreshButton}
          title={t('discover.refreshButton')}
          onPress={props.onRefresh}
        />
      </View>
    </View>
  );
}

interface InfoSheetProps {
  styles: InfoSheetStyles;
  card: ActivityCardData;
  onClose: () => void;
}

function InfoSheet(props: InfoSheetProps): ReactNode {
  const categoryLabel = CATEGORY_LABELS[props.card.category] ?? props.card.category;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={props.onClose}>
      <Pressable style={props.styles.overlay} onPress={props.onClose}>
        <Pressable style={props.styles.sheet} onPress={() => {}}>
          <Text style={props.styles.activityName}>{props.card.title}</Text>
          <Text style={props.styles.venueName}>{props.card.venueName}</Text>
          <View style={props.styles.metaRow}>
            <View style={props.styles.categoryPill}>
              <Text style={props.styles.categoryPillText}>{categoryLabel}</Text>
            </View>
            <Text style={props.styles.price}>{props.card.priceLabel}</Text>
          </View>
          {props.card.description != null && (
            <Text style={props.styles.description}>{props.card.description}</Text>
          )}
          {props.card.dealHeadline != null && (
            <View style={props.styles.dealBanner}>
              <Text style={props.styles.dealBannerText}>{props.card.dealHeadline}</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Container ──

export default function DiscoverContainer(props: DiscoverProps): ReactNode {
  const {
    styles,
    headerStyles,
    cityPickerStyles,
    cardStyles,
    actionButtonsStyles,
    groupIndicatorsStyles,
    emptyStateStyles,
    infoSheetStyles,
  } = useDiscoverStyles();
  const {
    isLoading,
    isRefreshing,
    currentCard,
    nextCard,
    isAllSwiped,
    canUndo,
    unreadNotificationCount,
    locationLabel,
    groupMembers,
    cities,
    isCityPickerOpen,
    isInfoSheetOpen,
    onToggleCityPicker,
    onSelectCity,
    onSwipe,
    onUndo,
    onOpenDetail,
    onCloseInfoSheet,
    onRefreshDeck,
    onPullToRefresh,
  } = useDiscover(props);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  function handleSwipeComplete(action: 'LIKE' | 'PASS' | 'SUPER_LIKE'): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSwipe(action);
    translateX.value = 0;
    translateY.value = 0;
  }

  function handleSuperLikeButton(): void {
    if (currentCard == null) return;
    translateY.value = withSpring(SWIPE_THRESHOLD_Y * 2, SPRING_CONFIG, () => {
      runOnJS(handleSwipeComplete)('SUPER_LIKE');
    });
  }

  function handleScrollDownButton(): void {
    if (currentCard == null) return;
    translateY.value = withSpring(600, SPRING_CONFIG, () => {
      runOnJS(handleSwipeComplete)('PASS');
    });
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD_X) {
        translateX.value = withSpring(500, SPRING_CONFIG, () => {
          runOnJS(handleSwipeComplete)('LIKE');
        });
      } else if (event.translationX < -SWIPE_THRESHOLD_X) {
        translateX.value = withSpring(-500, SPRING_CONFIG, () => {
          runOnJS(handleSwipeComplete)('PASS');
        });
      } else if (event.translationY < SWIPE_THRESHOLD_Y) {
        translateY.value = withSpring(-600, SPRING_CONFIG, () => {
          runOnJS(handleSwipeComplete)('SUPER_LIKE');
        });
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-300, 0, 300],
          [-15, 0, 15],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flex: 1 }}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onPullToRefresh}
              tintColor="#CFFF47"
              colors={['#CFFF47']}
            />
          }
        >
          <DiscoverHeader
            styles={headerStyles}
            locationLabel={locationLabel}
            unreadCount={unreadNotificationCount}
            onNotificationPress={() => props.onNavigateToNotifications()}
            onLocationPress={onToggleCityPicker}
          />

          <CityPicker
            styles={cityPickerStyles}
            cities={cities}
            selectedCity={locationLabel}
            visible={isCityPickerOpen}
            onSelect={onSelectCity}
            onClose={onToggleCityPicker}
          />

          {isInfoSheetOpen && currentCard != null && (
            <InfoSheet
              styles={infoSheetStyles}
              card={currentCard}
              onClose={onCloseInfoSheet}
            />
          )}

          {isLoading ? (
            <View style={emptyStateStyles.container}>
              <View style={emptyStateStyles.iconContainer}>
                <Loader size={36} color="rgba(255, 245, 236, 0.4)" />
              </View>
            </View>
          ) : isAllSwiped ? (
            <DiscoverEmptyState styles={emptyStateStyles} onRefresh={onRefreshDeck} />
          ) : (
            <>
              <View style={styles.cardArea}>
                {nextCard != null && (
                  <NextCardPreview styles={cardStyles} card={nextCard} />
                )}
                {currentCard != null && (
                  <GestureDetector gesture={panGesture}>
                    <Animated.View style={[cardStyles.wrapper, cardAnimatedStyle]}>
                      <ActivityCardContent styles={cardStyles} card={currentCard} />
                      <SwipeOverlay
                        styles={cardStyles}
                        translateX={translateX}
                        translateY={translateY}
                      />
                    </Animated.View>
                  </GestureDetector>
                )}
              </View>

              <GroupSwipeIndicators styles={groupIndicatorsStyles} members={groupMembers} />

              <DiscoverActionButtons
                styles={actionButtonsStyles}
                onUndo={onUndo}
                onInfo={onOpenDetail}
                onSuperLike={handleSuperLikeButton}
                onScrollDown={handleScrollDownButton}
                canUndo={canUndo}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
