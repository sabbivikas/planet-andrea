/**
 * Main container for the ActivitiesActivityId (Edit Activity) route
 */

import { useState, type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import {
  ImagePlus,
  Trash2,
  Link2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import type { TextStyle } from 'react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { CustomSwitch } from '@/comp-lib/core/custom-switch/CustomSwitch';
import {
  useActivitiesActivityIdStyles,
  type ImageUploadStyles,
  type CategoryChipStyles,
  type PriceChipStyles,
  type TagChipStyles,
  type CharCountStyles,
  type SectionStyles,
  type ValidationErrorStyles,
  type MetricCardStyles,
  type DealSectionStyles,
  type BoostStatusStyles,
  type PauseToggleStyles,
} from './ActivitiesActivityIdStyles';
import {
  useActivitiesActivityId,
  type CategoryOption,
  type PriceRangeOption,
  type TagOption,
  type PerformanceMetric,
  type LinkedDealInfo,
  type BoostStatusInfo,
  type ExistingDeal,
} from './ActivitiesActivityIdFunc';
import { ActivitiesActivityIdProps } from '@/app/business/activities/[activityId]';
import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { t } from '@/i18n';
import type { ActivityCategory, PriceRange } from '@shared/generated-db-types';
import type { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import type { CustomSwitchStyles } from '@/comp-lib/core/custom-switch/CustomSwitchStyles';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 60;
const UPLOAD_ICON_SIZE = 24;
const CATEGORY_ICON_FONT_SIZE = 16;
const TREND_ICON_SIZE = 12;
const NEAR_LIMIT_THRESHOLD = 0.9;

// ── Sub-components ──

interface ImageUploadAreaProps {
  imageUrl?: string;
  onPress: () => void;
  styles: ImageUploadStyles;
  hasError: boolean;
}

function ImageUploadArea(props: ImageUploadAreaProps): ReactNode {
  if (props.imageUrl != null) {
    return (
      <Pressable onPress={props.onPress}>
        <Image
          source={{ uri: props.imageUrl }}
          style={props.styles.uploadedImage}
          contentFit="cover"
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[props.styles.placeholder, props.hasError && props.styles.errorBorder]}
      onPress={props.onPress}
    >
      <View style={props.styles.placeholderIconWrapper}>
        <ImagePlus size={UPLOAD_ICON_SIZE} color={props.styles.placeholderIconColor} />
      </View>
      <CustomTextField styles={props.styles.placeholderText} title={t('bizActivityCreate.uploadImageHint')} />
      <CustomTextField styles={props.styles.placeholderSubtext} title={t('bizActivityCreate.uploadImageSubhint')} />
    </Pressable>
  );
}

interface CategoryChipRowProps {
  options: CategoryOption[];
  selectedCategory?: ActivityCategory;
  onSelect: (value: ActivityCategory) => void;
  styles: CategoryChipStyles;
  errorText?: string;
}

function CategoryChipRow(props: CategoryChipRowProps): ReactNode {
  return (
    <View>
      <View style={props.styles.scrollContainer}>
        {props.options.map((option) => {
          const isActive = props.selectedCategory === option.value;
          return (
            <Pressable
              key={option.value}
              style={[props.styles.chip, isActive && props.styles.chipActive]}
              onPress={() => props.onSelect(option.value)}
            >
              <CustomTextField
                styles={{ fontSize: CATEGORY_ICON_FONT_SIZE, lineHeight: 22 } as TextStyle}
                title={option.icon}
              />
              <CustomTextField
                styles={isActive ? props.styles.chipTextActive : props.styles.chipText}
                title={t(option.labelKey)}
              />
            </Pressable>
          );
        })}
      </View>
      {props.errorText != null && (
        <CustomTextField styles={props.styles.errorText} title={props.errorText} />
      )}
    </View>
  );
}

interface PriceChipRowProps {
  options: PriceRangeOption[];
  selectedPrice?: PriceRange;
  onSelect: (value: PriceRange) => void;
  styles: PriceChipStyles;
}

function PriceChipRow(props: PriceChipRowProps): ReactNode {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={props.styles.container}>
      {props.options.map((option) => {
        const isActive = props.selectedPrice === option.value;
        return (
          <Pressable
            key={option.value}
            style={[props.styles.chip, isActive && props.styles.chipActive]}
            onPress={() => props.onSelect(option.value)}
          >
            <CustomTextField
              styles={isActive ? props.styles.chipTextActive : props.styles.chipText}
              title={t(option.labelKey)}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface TagChipRowProps {
  options: TagOption[];
  selectedTags: string[];
  onToggle: (value: string) => void;
  styles: TagChipStyles;
}

function TagChipRow(props: TagChipRowProps): ReactNode {
  return (
    <View style={props.styles.container}>
      {props.options.map((option) => {
        const isActive = props.selectedTags.includes(option.value);
        return (
          <Pressable
            key={option.value}
            style={[props.styles.chip, isActive && props.styles.chipActive]}
            onPress={() => props.onToggle(option.value)}
          >
            <CustomTextField
              styles={isActive ? props.styles.chipTextActive : props.styles.chipText}
              title={t(option.labelKey)}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

interface MetricCardItemProps {
  metric: PerformanceMetric;
  styles: MetricCardStyles;
}

function MetricCardItem(props: MetricCardItemProps): ReactNode {
  const trendPercent = props.metric.trendPercent ?? 0;
  const isPositive = trendPercent >= 0;
  const trendLabel = isPositive ? `+${trendPercent}%` : `${trendPercent}%`;

  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.valueText} title={props.metric.value} />
      <CustomTextField styles={props.styles.labelText} title={t(props.metric.labelKey)} />
      {props.metric.trendPercent != null && (
        <View style={props.styles.trendRow}>
          <View style={props.styles.trendIconWrapper}>
            {isPositive ? (
              <TrendingUp size={TREND_ICON_SIZE} color={props.styles.trendUpText.color as string} />
            ) : (
              <TrendingDown size={TREND_ICON_SIZE} color={props.styles.trendDownText.color as string} />
            )}
          </View>
          <CustomTextField
            styles={isPositive ? props.styles.trendUpText : props.styles.trendDownText}
            title={trendLabel}
          />
        </View>
      )}
    </View>
  );
}

interface DealSectionContentProps {
  linkedDeal?: LinkedDealInfo;
  existingDeals: ExistingDeal[];
  showDealPicker: boolean;
  onLinkDeal: (dealId: string) => void;
  onUnlinkDeal: () => void;
  onToggleDealPicker: () => void;
  styles: DealSectionStyles;
  editButtonStyles: CustomButtonStyles;
  unlinkButtonStyles: CustomButtonStyles;
  linkButtonStyles: CustomButtonStyles;
}

function DealSectionContent(props: DealSectionContentProps): ReactNode {
  if (props.linkedDeal != null && !props.showDealPicker) {
    return (
      <View style={props.styles.container}>
        <View style={props.styles.dealCard}>
          <View style={props.styles.dealHeadlineWrapper}>
            <CustomTextField styles={props.styles.dealHeadline} title={props.linkedDeal.headline} />
          </View>
          <View style={props.styles.actionsRow}>
            <CustomButton
              styles={props.editButtonStyles}
              title={t('bizActivityEdit.editDeal')}
              onPress={props.onToggleDealPicker}
            />
            <CustomButton
              styles={props.unlinkButtonStyles}
              title={t('bizActivityEdit.unlinkDeal')}
              onPress={props.onUnlinkDeal}
            />
          </View>
        </View>
      </View>
    );
  }

  if (props.showDealPicker) {
    return (
      <View style={props.styles.container}>
        {props.existingDeals.map((deal) => {
          const isLinked = props.linkedDeal?.id === deal.id;
          return (
            <Pressable
              key={deal.id}
              style={[props.styles.dealPickerItem, isLinked && props.styles.dealPickerItemActive]}
              onPress={() => props.onLinkDeal(deal.id)}
            >
              <CustomTextField
                styles={isLinked ? props.styles.dealPickerTextActive : props.styles.dealPickerText}
                title={deal.headline}
              />
              {isLinked && (
                <View style={props.styles.linkedBadge}>
                  <CustomTextField styles={props.styles.linkedBadgeText} title={t('bizActivityCreate.dealLinked')} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.noDealText} title={t('bizActivityEdit.noDealLinked')} />
      <CustomButton
        styles={props.linkButtonStyles}
        title={t('bizActivityEdit.linkDeal')}
        onPress={props.onToggleDealPicker}
        leftIcon={(iconProps) => <Link2 size={iconProps.size} color={iconProps.color} />}
      />
    </View>
  );
}

interface BoostStatusContentProps {
  boostStatus: BoostStatusInfo;
  styles: BoostStatusStyles;
}

function BoostStatusContent(props: BoostStatusContentProps): ReactNode {
  const budgetPercent =
    props.boostStatus.totalBudgetInDollars > 0
      ? (props.boostStatus.remainingBudgetInDollars / props.boostStatus.totalBudgetInDollars) * 100
      : 0;

  return (
    <View style={props.styles.container}>
      <View style={props.styles.statusRow}>
        <CustomTextField styles={props.styles.tierText} title={props.boostStatus.tierLabel} />
        <View
          style={[
            props.styles.statusBadge,
            props.boostStatus.isActive && props.styles.statusBadgeActive,
          ]}
        >
          <CustomTextField
            styles={
              props.boostStatus.isActive
                ? props.styles.statusBadgeTextActive
                : props.styles.statusBadgeText
            }
            title={
              props.boostStatus.isActive
                ? t('bizActivityEdit.boostActive')
                : t('bizActivityEdit.boostInactive')
            }
          />
        </View>
      </View>
      <View style={props.styles.budgetRow}>
        <CustomTextField
          styles={props.styles.budgetText}
          title={t('bizActivityEdit.budgetRemaining', {
            amount: String(props.boostStatus.remainingBudgetInDollars),
          })}
        />
        <View style={props.styles.budgetBarTrack}>
          <View style={[props.styles.budgetBarFill, { width: `${budgetPercent}%` }]} />
        </View>
      </View>
      {props.boostStatus.boostedImpressions > 0 && (
        <CustomTextField
          styles={props.styles.impressionsText}
          title={t('bizActivityEdit.boostImpressions', {
            count: String(props.boostStatus.boostedImpressions),
          })}
        />
      )}
    </View>
  );
}

interface PauseToggleRowProps {
  isPaused: boolean;
  onToggle: () => void;
  styles: PauseToggleStyles;
  switchStyles: CustomSwitchStyles;
}

function PauseToggleRow(props: PauseToggleRowProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.labelRow}>
        <CustomTextField styles={props.styles.labelText} title={t('bizActivityEdit.pauseLabel')} />
        <CustomTextField styles={props.styles.hintText} title={t('bizActivityEdit.pauseHint')} />
      </View>
      <View
        style={[
          props.styles.statusBadge,
          props.isPaused && props.styles.statusBadgeActive,
        ]}
      >
        <CustomTextField
          styles={props.isPaused ? props.styles.statusTextActive : props.styles.statusText}
          title={props.isPaused ? t('bizActivityEdit.statusPaused') : t('bizActivityEdit.statusActive')}
        />
      </View>
      <CustomSwitch
        value={props.isPaused}
        onValueChange={props.onToggle}
        styles={props.switchStyles}
      />
    </View>
  );
}

// ── Main component ──

export default function ActivitiesActivityIdContainer(props: ActivitiesActivityIdProps): ReactNode {
  const {
    styles,
    headerStyles,
    imageUploadStyles,
    titleInputStyles,
    categoryChipStyles,
    descriptionInputStyles,
    charCountStyles,
    priceChipStyles,
    operatingHoursInputStyles,
    tagChipStyles,
    sectionStyles,
    validationErrorStyles,
    metricCardStyles,
    dealSectionStyles,
    boostStatusStyles,
    pauseToggleStyles,
    switchStyles,
    saveButtonStyles,
    deleteButtonStyles,
    dealEditButtonStyles,
    dealUnlinkButtonStyles,
    dealLinkButtonStyles,
  } = useActivitiesActivityIdStyles();

  const { colors } = useStyleContext();

  const {
    isLoading,
    isSaving,
    title,
    selectedCategory,
    description,
    descriptionMaxLength,
    primaryImageUrl,
    selectedPriceRange,
    operatingHours,
    selectedTags,
    isPaused,
    categoryOptions,
    priceRangeOptions,
    tagOptions,
    performanceMetrics,
    linkedDeal,
    existingDeals,
    boostStatus,
    validationErrors,
    onTitleChange,
    onCategorySelect,
    onDescriptionChange,
    onImageUpload,
    onPriceRangeSelect,
    onOperatingHoursChange,
    onTagToggle,
    onTogglePause,
    onLinkDeal,
    onUnlinkDeal,
    onSave,
    onDelete,
  } = useActivitiesActivityId(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  const charCountRatio = description.length / descriptionMaxLength;
  const isNearLimit = charCountRatio >= NEAR_LIMIT_THRESHOLD;

  // Local UI state for deal picker visibility is managed inline
  // since it's purely presentational toggling
  const [showDealPicker, setShowDealPicker] = useState(false);

  function onToggleDealPicker(): void {
    setShowDealPicker((prev) => !prev);
  }

  function onLinkDealAndClose(dealId: string): void {
    onLinkDeal(dealId);
    setShowDealPicker(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
        <CustomHeader
          showBackButton
          onGoBack={props.onGoBack}
          title={t('bizActivityEdit.title')}
          customHeaderStyles={headerStyles}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primaryAccent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizActivityEdit.title')}
        customHeaderStyles={headerStyles}
        RightComponent={
          <CustomButton
            styles={deleteButtonStyles}
            onPress={onDelete}
            leftIcon={(iconProps) => <Trash2 size={iconProps.size} color={iconProps.color} />}
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityCreate.sectionHeroImage')} />
            <ImageUploadArea
              imageUrl={primaryImageUrl}
              onPress={onImageUpload}
              styles={imageUploadStyles}
              hasError={validationErrors.primaryImageUrl != null}
            />
            {validationErrors.primaryImageUrl != null && (
              <CustomTextField styles={validationErrorStyles.text} title={validationErrors.primaryImageUrl} />
            )}
          </View>
        </Animated.View>

        {/* Details Section */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityCreate.sectionDetails')} />

            {/* Title */}
            <View style={styles.fieldSpacing}>
              <CustomTextInput
                styles={titleInputStyles}
                placeholder={t('bizActivityCreate.titlePlaceholder')}
                value={title}
                onChangeText={onTitleChange}
                maxLength={80}
                errorText={validationErrors.title}
                showErrorStyle={validationErrors.title != null}
              />
            </View>

            {/* Category */}
            <View style={styles.fieldSpacing}>
              <CustomTextField styles={styles.fieldLabel} title={t('bizActivityCreate.categoryLabel')} />
              <CategoryChipRow
                options={categoryOptions}
                selectedCategory={selectedCategory}
                onSelect={onCategorySelect}
                styles={categoryChipStyles}
                errorText={validationErrors.category}
              />
            </View>

            {/* Description */}
            <View>
              <CustomTextInput
                styles={descriptionInputStyles}
                placeholder={t('bizActivityCreate.descriptionPlaceholder')}
                value={description}
                onChangeText={onDescriptionChange}
                multiline
                maxLength={descriptionMaxLength}
                errorText={validationErrors.description}
                showErrorStyle={validationErrors.description != null}
              />
              <View style={charCountStyles.container}>
                <CustomTextField
                  styles={isNearLimit ? charCountStyles.textNearLimit : charCountStyles.text}
                  title={t('bizActivityCreate.charCount', {
                    count: String(description.length),
                    max: String(descriptionMaxLength),
                  })}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Optional Details */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 2).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityCreate.sectionOptional')} />

            {/* Price Range */}
            <View style={styles.fieldSpacing}>
              <CustomTextField styles={styles.fieldLabel} title={t('bizActivityCreate.priceRangeLabel')} />
              <PriceChipRow
                options={priceRangeOptions}
                selectedPrice={selectedPriceRange}
                onSelect={onPriceRangeSelect}
                styles={priceChipStyles}
              />
            </View>

            {/* Operating Hours */}
            <View style={styles.fieldSpacing}>
              <CustomTextInput
                styles={operatingHoursInputStyles}
                placeholder={t('bizActivityCreate.operatingHoursPlaceholder')}
                label={t('bizActivityCreate.operatingHoursLabel')}
                value={operatingHours}
                onChangeText={onOperatingHoursChange}
              />
            </View>

            {/* Tags */}
            <View>
              <CustomTextField styles={styles.fieldLabel} title={t('bizActivityCreate.tagsLabel')} />
              <TagChipRow
                options={tagOptions}
                selectedTags={selectedTags}
                onToggle={onTagToggle}
                styles={tagChipStyles}
              />
            </View>
          </View>
        </Animated.View>

        {/* Performance Metrics */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 3).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityEdit.sectionPerformance')} />
            <View style={styles.metricsRow}>
              {performanceMetrics.map((metric) => (
                <MetricCardItem key={metric.labelKey} metric={metric} styles={metricCardStyles} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Linked Deal */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 4).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityEdit.sectionDeal')} />
            <DealSectionContent
              linkedDeal={linkedDeal}
              existingDeals={existingDeals}
              showDealPicker={showDealPicker}
              onLinkDeal={onLinkDealAndClose}
              onUnlinkDeal={onUnlinkDeal}
              onToggleDealPicker={onToggleDealPicker}
              styles={dealSectionStyles}
              editButtonStyles={dealEditButtonStyles}
              unlinkButtonStyles={dealUnlinkButtonStyles}
              linkButtonStyles={dealLinkButtonStyles}
            />
          </View>
        </Animated.View>

        {/* Boost Status */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 5).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityEdit.sectionBoostStatus')} />
            <BoostStatusContent boostStatus={boostStatus} styles={boostStatusStyles} />
          </View>
        </Animated.View>

        {/* Pause Toggle */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 6).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityEdit.sectionVisibility')} />
            <PauseToggleRow
              isPaused={isPaused}
              onToggle={onTogglePause}
              styles={pauseToggleStyles}
              switchStyles={switchStyles}
            />
          </View>
        </Animated.View>

        {/* Delete Action */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 7).duration(400).springify()}>
          <CustomButton
            styles={deleteButtonStyles}
            title={t('bizActivityEdit.deleteActivity')}
            onPress={onDelete}
            leftIcon={(iconProps) => <Trash2 size={iconProps.size} color={iconProps.color} />}
          />
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <CustomButton
          styles={saveButtonStyles}
          title={isSaving ? t('bizActivityEdit.saving') : t('bizActivityEdit.saveChanges')}
          onPress={onSave}
          isLoading={isSaving}
          disabled={isSaving}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}

