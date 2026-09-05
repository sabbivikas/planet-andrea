import { Camera, Map as MapLibreMap, Marker } from '@maplibre/maplibre-react-native';
import { type ReactElement, type ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { View, ScrollView, FlatList, Pressable, Modal, type ListRenderItemInfo, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Star,
  Navigation,
  DollarSign,
  Heart,
  Share2,
  MapPin,
  Clock,
  Phone,
  Users,
  Tag,
  ExternalLink,
  AlertTriangle,
  X,
} from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useActivityActivityIdStyles } from './ActivityActivityIdStyles';
import {
  useActivityActivityId,
  type ActivityImageData,
  type ReviewData,
} from './ActivityActivityIdFunc';
import { ActivityActivityIdProps } from '@/app/activity/[activityId]';
import {
  type HeroImageStyles,
  type VenueInfoStyles,
  type DealBannerStyles,
  type DealModalStyles,
  type DescriptionStyles,
  type VenueContactStyles,
  type ReviewCardStyles,
  type GroupInterestStyles,
  type ActionBarStyles,
  type MapPreviewStyles,
  type LoadingStyles,
  type ErrorStyles,
} from './ActivityActivityIdStyles';

// ── Constants ──

const DESCRIPTION_COLLAPSED_LINES = 3;

// ── Sub-components ──

interface HeroImageSectionProps {
  styles: HeroImageStyles;
  images: ActivityImageData[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onGoBack: () => void;
  topInset: number;
  imageWidth: number;
}

function HeroImageSection(props: HeroImageSectionProps): ReactNode {
  function renderImageItem(info: ListRenderItemInfo<ActivityImageData>): ReactElement {
    return (
      <Image
        source={{ uri: info.item.url }}
        style={[props.styles.image, { width: props.imageWidth }]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  function handleScrollEnd(event: { nativeEvent: { contentOffset: { x: number } } }): void {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / props.imageWidth);
    props.onIndexChange(newIndex);
  }

  return (
    <View style={props.styles.container}>
      <FlatList
        data={props.images}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        bounces={false}
      />
      <LinearGradient
        colors={['rgba(27, 42, 74, 0.6)', 'transparent', 'rgba(27, 42, 74, 0.9)']}
        locations={[0, 0.3, 1]}
        style={props.styles.gradientOverlay}
      />
      <View style={[props.styles.backButtonContainer, { top: props.topInset + 8 }]}>
        <CustomButton
          onPress={props.onGoBack}
          styles={props.styles.backButton}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <ChevronLeft size={size ?? 22} color={color as string} />
            </View>
          )}
        />
      </View>
      {props.images.length > 1 && (
        <View style={props.styles.indicatorRow}>
          {props.images.map((img, index) => (
            <View
              key={img.id}
              style={index === props.activeIndex ? props.styles.indicatorDotActive : props.styles.indicatorDot}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface VenueInfoSectionProps {
  styles: VenueInfoStyles;
  venueName: string;
  activityTitle: string;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  distanceInKm: number;
  priceLabel: string;
  tags: string[];
}

function VenueInfoSection(props: VenueInfoSectionProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={props.styles.container}>
      <CustomTextField styles={props.styles.venueName} title={props.venueName} />
      <CustomTextField styles={props.styles.activityTitle} title={props.activityTitle} />
      <View style={props.styles.metaRow}>
        <View style={props.styles.metaItem}>
          <View style={props.styles.metaIcon}>
            <Star size={14} color={props.styles.starIconColor} fill={props.styles.starIconColor} />
          </View>
          <CustomTextField
            styles={props.styles.metaText}
            title={`${props.rating} (${props.reviewCount})`}
          />
        </View>
        <View style={props.styles.metaItem}>
          <View style={props.styles.metaIcon}>
            <Navigation size={14} color={props.styles.secondaryIconColor} />
          </View>
          <CustomTextField
            styles={props.styles.metaText}
            title={`${props.distanceInKm} km`}
          />
        </View>
        <View style={props.styles.metaItem}>
          <View style={props.styles.metaIcon}>
            <DollarSign size={14} color={props.styles.secondaryIconColor} />
          </View>
          <CustomTextField styles={props.styles.metaText} title={props.priceLabel} />
        </View>
      </View>
      <View style={props.styles.categoryBadge}>
        <CustomTextField styles={props.styles.categoryBadgeText} title={props.categoryLabel} />
      </View>
      {props.tags.length > 0 && (
        <View style={props.styles.tagsRow}>
          {props.tags.map((tag) => (
            <View key={tag} style={props.styles.tag}>
              <CustomTextField styles={props.styles.tagText} title={tag} />
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

interface DealBannerSectionProps {
  styles: DealBannerStyles;
  headline: string;
  discountLabel: string;
  expiryDate: string;
  termsPreview: string;
  onViewDeal: () => void;
}

function DealBannerSection(props: DealBannerSectionProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={props.styles.container}>
      <View style={props.styles.topRow}>
        <View style={props.styles.discountBadge}>
          <CustomTextField styles={props.styles.discountBadgeText} title={props.discountLabel} />
        </View>
        <CustomTextField styles={props.styles.headline} title={props.headline} />
      </View>
      <CustomTextField
        styles={props.styles.expiryText}
        title={`${t('activityDetail.dealExpiresPrefix')} ${props.expiryDate} · ${t('activityDetail.termsApply')}`}
      />
      <CustomTextField styles={props.styles.termsText} title={props.termsPreview} />
      <CustomButton
        onPress={props.onViewDeal}
        title={t('activityDetail.viewDeal')}
        styles={props.styles.viewDealButton}
        rightIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <Tag size={(size ?? 14) - 2} color={color as string} />
          </View>
        )}
      />
    </Animated.View>
  );
}

interface DescriptionSectionProps {
  styles: DescriptionStyles;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function DescriptionSection(props: DescriptionSectionProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={props.styles.container}>
      <CustomTextField styles={props.styles.sectionTitle} title={t('activityDetail.about')} />
      <CustomTextField
        styles={props.styles.text}
        title={props.description}
        numberOfLines={props.isExpanded ? undefined : DESCRIPTION_COLLAPSED_LINES}
      />
      <Pressable onPress={props.onToggle}>
        <CustomTextField
          styles={props.styles.readMoreText}
          title={props.isExpanded ? t('activityDetail.readLess') : t('activityDetail.readMore')}
        />
      </Pressable>
    </Animated.View>
  );
}

/** Free map tiles (OpenStreetMap data), no API key required. Dark style matches the app theme. */
const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';

interface VenueContactSectionProps {
  styles: VenueContactStyles;
  mapPreviewStyles: MapPreviewStyles;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  phone: string;
  onOpenDirections: () => void;
}

interface MapPreviewSectionProps {
  styles: MapPreviewStyles;
  address: string;
  latitude: number;
  longitude: number;
  onOpenDirections: () => void;
}

function MapPreviewSection(props: MapPreviewSectionProps): ReactNode {
  const coordinate: [number, number] = [props.longitude, props.latitude];
  return (
    <Pressable onPress={props.onOpenDirections} style={props.styles.container}>
      {/* Free map: MapLibre SDK + OpenFreeMap tiles (OpenStreetMap data) - no API key needed */}
      <MapLibreMap
        style={props.styles.map}
        mapStyle={OPENFREEMAP_STYLE_URL}
        dragPan={false}
        touchZoom={false}
        doubleTapZoom={false}
        doubleTapHoldZoom={false}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera initialViewState={{ center: coordinate, zoom: 15 }} />
        <Marker lngLat={coordinate}>
          <View style={props.styles.pinContainer}>
            <MapPin size={18} color="#FFF5EC" />
          </View>
        </Marker>
      </MapLibreMap>
      <View style={props.styles.mapAddressBar}>
        <CustomTextField styles={props.styles.mapAddressText} title={props.address} />
        <CustomTextField styles={props.styles.mapTapHint} title={t('activityDetail.getDirections')} />
      </View>
    </Pressable>
  );
}

function VenueContactSection(props: VenueContactSectionProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(400).duration(400)} style={props.styles.container}>
      <CustomTextField styles={props.styles.sectionTitle} title={t('activityDetail.venueInfo')} />

      <MapPreviewSection
        styles={props.mapPreviewStyles}
        address={props.address}
        latitude={props.latitude}
        longitude={props.longitude}
        onOpenDirections={props.onOpenDirections}
      />

      <View style={props.styles.row}>
        <View style={props.styles.rowIcon}>
          <Clock size={18} color={props.styles.rowIconColor} />
        </View>
        <View style={props.styles.rowTextContainer}>
          <CustomTextField styles={props.styles.rowLabel} title={t('activityDetail.hours')} />
          <CustomTextField styles={props.styles.rowValue} title={props.operatingHours} />
        </View>
      </View>
      <View style={props.styles.row}>
        <View style={props.styles.rowIcon}>
          <Phone size={18} color={props.styles.rowIconColor} />
        </View>
        <View style={props.styles.rowTextContainer}>
          <CustomTextField styles={props.styles.rowLabel} title={t('activityDetail.contact')} />
          <CustomTextField styles={props.styles.rowValue} title={props.phone} />
        </View>
      </View>
    </Animated.View>
  );
}

interface ReviewsSectionProps {
  styles: ReviewCardStyles;
  reviews: ReviewData[];
}

function ReviewsSection(props: ReviewsSectionProps): ReactNode {
  if (props.reviews.length === 0) return undefined;

  function renderStars(rating: number): ReactNode {
    const stars: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <View key={i} style={props.styles.starIcon}>
          <Star
            size={12}
            color={i < rating ? props.styles.starActiveColor : props.styles.starInactiveColor}
            fill={i < rating ? props.styles.starActiveColor : 'transparent'}
          />
        </View>,
      );
    }
    return stars;
  }

  return (
    <Animated.View entering={FadeInDown.delay(500).duration(400)} style={props.styles.container}>
      <CustomTextField styles={props.styles.sectionTitle} title={t('activityDetail.reviews')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={props.styles.scrollContent}
      >
        {props.reviews.map((review) => (
          <View key={review.id} style={props.styles.card}>
            <View style={props.styles.cardHeader}>
              <View style={props.styles.avatar}>
                <CustomTextField styles={props.styles.avatarText} title={review.authorInitial} />
              </View>
              <CustomTextField styles={props.styles.authorName} title={review.authorName} />
              <CustomTextField styles={props.styles.sourceText} title={review.source} />
            </View>
            <View style={props.styles.starsRow}>{renderStars(review.rating)}</View>
            <CustomTextField styles={props.styles.reviewText} title={review.text} numberOfLines={3} />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

interface GroupInterestSectionProps {
  styles: GroupInterestStyles;
  count: number;
}

function GroupInterestSection(props: GroupInterestSectionProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(600).duration(400)} style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <Users size={20} color={props.styles.iconColor} />
      </View>
      <CustomTextField
        styles={props.styles.text}
        title={t('activityDetail.groupsLikedCount', { count: props.count })}
      />
    </Animated.View>
  );
}

interface BottomActionBarProps {
  styles: ActionBarStyles;
  isLiked: boolean;
  hasDeal: boolean;
  bottomInset: number;
  onToggleLike: () => void;
  onShare: () => void;
  onGetDeal: () => void;
}

function BottomActionBar(props: BottomActionBarProps): ReactNode {
  const likeStyles = props.isLiked ? props.styles.likeButtonActive : props.styles.likeButton;

  return (
    <View style={props.styles.container}>
      <View style={[props.styles.innerContainer, { paddingBottom: Math.max(props.bottomInset, 16) }]}>
        <CustomButton
          onPress={props.onToggleLike}
          styles={likeStyles}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <Heart
                size={size ?? 24}
                color={color as string}
                fill={props.isLiked ? (color as string) : 'transparent'}
              />
            </View>
          )}
        />
        <CustomButton
          onPress={props.onShare}
          styles={props.styles.shareButton}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <Share2 size={size ?? 22} color={color as string} />
            </View>
          )}
        />
        {props.hasDeal && (
          <CustomButton
            onPress={props.onGetDeal}
            title={t('activityDetail.getDeal')}
            styles={props.styles.getDealButton}
          />
        )}
      </View>
    </View>
  );
}

// ── Loading State ──

interface LoadingStateProps {
  styles: LoadingStyles;
  onGoBack: () => void;
  backButtonStyles: HeroImageStyles;
  topInset: number;
}

function LoadingState(props: LoadingStateProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={[props.backButtonStyles.backButtonContainer, { top: props.topInset + 8 }]}>
        <CustomButton
          onPress={props.onGoBack}
          styles={props.backButtonStyles.backButton}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <ChevronLeft size={size ?? 22} color={color as string} />
            </View>
          )}
        />
      </View>
      <ActivityIndicator size="large" color={props.styles.indicatorColor} />
    </View>
  );
}

// ── Error State ──

interface ErrorStateProps {
  styles: ErrorStyles;
  onGoBack: () => void;
  backButtonStyles: HeroImageStyles;
  topInset: number;
}

function ErrorState(props: ErrorStateProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={[props.backButtonStyles.backButtonContainer, { top: props.topInset + 8 }]}>
        <CustomButton
          onPress={props.onGoBack}
          styles={props.backButtonStyles.backButton}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <ChevronLeft size={size ?? 22} color={color as string} />
            </View>
          )}
        />
      </View>
      <View style={props.styles.iconContainer}>
        <AlertTriangle size={36} color={props.styles.iconColor} />
      </View>
      <CustomTextField styles={props.styles.title} title={t('errors.technicalTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('errors.technicalDescription')} />
    </View>
  );
}

// ── Deal Detail Modal ──

interface DealDetailModalProps {
  styles: DealModalStyles;
  headline: string;
  discountLabel: string;
  expiryDate: string;
  termsPreview: string;
  onClose: () => void;
  onRedeemDeal: () => void;
}

function DealDetailModal(props: DealDetailModalProps): ReactNode {
  return (
    <View style={props.styles.overlay}>
      <Animated.View entering={FadeInDown.duration(300)}>
        <View style={props.styles.sheet}>
          <View style={props.styles.header}>
            <View style={props.styles.discountBadge}>
              <CustomTextField styles={props.styles.discountBadgeText} title={props.discountLabel} />
            </View>
            <Pressable style={props.styles.closeButton} onPress={props.onClose}>
              <X size={18} color={props.styles.closeIconColor} />
            </Pressable>
          </View>
          <CustomTextField styles={props.styles.headline} title={props.headline} />
          <CustomTextField
            styles={props.styles.detailsText}
            title={`${t('activityDetail.dealExpiresPrefix')} ${props.expiryDate} · ${t('activityDetail.termsApply')}`}
          />
          <CustomTextField styles={props.styles.termsText} title={props.termsPreview} />
          <View style={props.styles.divider} />
          <CustomButton
            onPress={props.onRedeemDeal}
            title={t('activityDetail.redeemDeal')}
            styles={props.styles.redeemButton}
            rightIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Tag size={(size ?? 14) - 2} color={color as string} />
              </View>
            )}
          />
        </View>
      </Animated.View>
    </View>
  );
}

// ── Main Container ──

export default function ActivityActivityIdContainer(props: ActivityActivityIdProps): ReactNode {
  const {
    styles,
    heroImageStyles,
    venueInfoStyles,
    dealBannerStyles,
    dealModalStyles,
    descriptionStyles,
    venueContactStyles,
    mapPreviewStyles,
    reviewCardStyles,
    groupInterestStyles,
    actionBarStyles,
    loadingStyles,
    errorStyles,
  } = useActivityActivityIdStyles();
  const {
    isLoading,
    error,
    activity,
    deal,
    reviews,
    groupInterestCount,
    isLiked,
    activeImageIndex,
    isDescriptionExpanded,
    showDealModal,
    onToggleLike,
    onShare,
    onGetDeal,
    onViewDeal,
    onCloseDealModal,
    onRedeemDeal,
    onImageIndexChange,
    onToggleDescription,
    onOpenDirections,
  } = useActivityActivityId(props);

  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <LoadingState
        styles={loadingStyles}
        onGoBack={props.onGoBack}
        backButtonStyles={heroImageStyles}
        topInset={insets.top}
      />
    );
  }

  if (error != null || activity == null) {
    return (
      <ErrorState
        styles={errorStyles}
        onGoBack={props.onGoBack}
        backButtonStyles={heroImageStyles}
        topInset={insets.top}
      />
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <HeroImageSection
          styles={heroImageStyles}
          images={activity.images}
          activeIndex={activeImageIndex}
          onIndexChange={onImageIndexChange}
          onGoBack={props.onGoBack}
          topInset={insets.top}
          imageWidth={heroImageStyles.container.width as number}
        />

        <View style={styles.contentContainer}>
          <VenueInfoSection
            styles={venueInfoStyles}
            venueName={activity.venueName}
            activityTitle={activity.title}
            categoryLabel={activity.categoryLabel}
            rating={activity.rating}
            reviewCount={activity.reviewCount}
            distanceInKm={activity.distanceInKm}
            priceLabel={activity.priceLabel}
            tags={activity.tags}
          />

          {deal != null && (
            <>
              <View style={styles.sectionDivider} />
              <DealBannerSection
                styles={dealBannerStyles}
                headline={deal.headline}
                discountLabel={deal.discountLabel}
                expiryDate={deal.expiryDate}
                termsPreview={deal.termsPreview}
                onViewDeal={onViewDeal}
              />
            </>
          )}

          <View style={styles.sectionDivider} />

          <DescriptionSection
            styles={descriptionStyles}
            description={activity.description}
            isExpanded={isDescriptionExpanded}
            onToggle={onToggleDescription}
          />

          <View style={styles.sectionDivider} />

          <VenueContactSection
            styles={venueContactStyles}
            mapPreviewStyles={mapPreviewStyles}
            address={activity.address}
            latitude={activity.latitude}
            longitude={activity.longitude}
            operatingHours={activity.operatingHours}
            phone={activity.phone}
            onOpenDirections={onOpenDirections}
          />
        </View>

        <View style={styles.sectionDivider} />

        <ReviewsSection styles={reviewCardStyles} reviews={reviews} />

        <View style={[styles.contentContainer, { paddingTop: 0 }]}>
          <GroupInterestSection styles={groupInterestStyles} count={groupInterestCount} />
        </View>
      </ScrollView>

      <BottomActionBar
        styles={actionBarStyles}
        isLiked={isLiked}
        hasDeal={deal != null}
        bottomInset={insets.bottom}
        onToggleLike={onToggleLike}
        onShare={onShare}
        onGetDeal={onGetDeal}
      />

      <Modal
        visible={showDealModal}
        transparent
        animationType="slide"
        onRequestClose={onCloseDealModal}
      >
        {deal != null && (
          <DealDetailModal
            styles={dealModalStyles}
            headline={deal.headline}
            discountLabel={deal.discountLabel}
            expiryDate={deal.expiryDate}
            termsPreview={deal.termsPreview}
            onClose={onCloseDealModal}
            onRedeemDeal={onRedeemDeal}
          />
        )}
      </Modal>
    </View>
  );
}
