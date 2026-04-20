/**
 * Main container for the Create Activity route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Pressable, Modal } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { ImagePlus, Eye, X, Zap, Link2, Tag, Check } from 'lucide-react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import {
  useCreateStyles,
  type ImageUploadStyles,
  type CategoryChipStyles,
  type PriceChipStyles,
  type TagChipStyles,
  type DealLinkStyles,
  type BoostSectionStyles,
  type SectionStyles,
  type PreviewModalStyles,
  type CharCountStyles,
  type ValidationErrorStyles,
} from './CreateStyles';
import {
  useCreate,
  type CategoryOption,
  type PriceRangeOption,
  type TagOption,
  type BoostTier,
  type ExistingDeal,
} from './CreateFunc';
import { CreateProps } from '@/app/business/activities/create';
import { t } from '@/i18n';
import type { ActivityCategory, PriceRange } from '@shared/generated-db-types';
import type { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 60;
const UPLOAD_ICON_SIZE = 24;
const SECTION_ICON_SIZE = 16;
const DEAL_CHECK_ICON_SIZE = 14;
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
                styles={{ fontSize: SECTION_ICON_SIZE, lineHeight: 22 } as TextStyle}
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

interface DealLinkSectionProps {
  deals: ExistingDeal[];
  linkedDealId?: string;
  onLinkDeal: (dealId: string) => void;
  onUnlinkDeal: () => void;
  styles: DealLinkStyles;
  unlinkButtonStyles: CustomButtonStyles;
}

function DealLinkSection(props: DealLinkSectionProps): ReactNode {
  return (
    <View style={props.styles.container}>
      {props.deals.map((deal) => {
        const isLinked = props.linkedDealId === deal.id;
        return (
          <Pressable
            key={deal.id}
            style={[props.styles.dealItem, isLinked && props.styles.dealItemActive]}
            onPress={() => props.onLinkDeal(deal.id)}
          >
            <CustomTextField
              styles={isLinked ? props.styles.dealTextActive : props.styles.dealText}
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
      {props.linkedDealId != null && (
        <CustomButton
          styles={props.unlinkButtonStyles}
          title={t('common.cancel')}
          onPress={props.onUnlinkDeal}
          leftIcon={(iconProps) => <X size={iconProps.size} color={iconProps.color} />}
        />
      )}
      {props.deals.length === 0 && (
        <CustomTextField styles={props.styles.noDealText} title={t('bizActivityCreate.noDealLinked')} />
      )}
    </View>
  );
}

interface BoostConfigProps {
  enabled: boolean;
  tiers: BoostTier[];
  selectedTierId?: string;
  budgetInDollars: number;
  minBudget: number;
  maxBudget: number;
  estimatedImpressions: number;
  onTierSelect: (tierId: string) => void;
  onBudgetChange: (value: number) => void;
  styles: BoostSectionStyles;
  accentColor: string;
  trackColor: string;
}

function BoostConfig(props: BoostConfigProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.tierRow}>
        {props.tiers.map((tier) => {
          const isActive = props.selectedTierId === tier.id;
          return (
            <Pressable
              key={tier.id}
              style={[props.styles.tierChip, isActive && props.styles.tierChipActive]}
              onPress={() => props.onTierSelect(tier.id)}
            >
              <CustomTextField
                styles={isActive ? props.styles.tierChipTextActive : props.styles.tierChipText}
                title={t(tier.labelKey)}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={props.styles.sliderContainer}>
        <CustomTextField
          styles={props.styles.sliderValue}
          title={t('bizActivityCreate.boostBudgetValue', { amount: String(props.budgetInDollars) })}
        />
        <Slider
          minimumValue={props.minBudget}
          maximumValue={props.maxBudget}
          step={1}
          value={props.budgetInDollars}
          onValueChange={props.onBudgetChange}
          minimumTrackTintColor={props.accentColor}
          maximumTrackTintColor={props.trackColor}
          tapToSeek
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CustomTextField styles={props.styles.sliderLabel} title={`$${props.minBudget}`} />
          <CustomTextField styles={props.styles.sliderLabel} title={`$${props.maxBudget}`} />
        </View>
      </View>
      {props.estimatedImpressions > 0 && (
        <CustomTextField
          styles={props.styles.estimateText}
          title={t('bizActivityCreate.boostEstimate', { count: String(props.estimatedImpressions) })}
        />
      )}
    </View>
  );
}

interface PreviewCardModalProps {
  visible: boolean;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  priceLabel?: string;
  tags: string[];
  hasDeal: boolean;
  onClose: () => void;
  styles: PreviewModalStyles;
  closeButtonStyles: CustomButtonStyles;
}

function PreviewCardModal(props: PreviewCardModalProps): ReactNode {
  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <Pressable style={props.styles.overlay} onPress={props.onClose}>
        <Animated.View entering={FadeIn.duration(300)} style={props.styles.card}>
          {props.imageUrl != null ? (
            <Image source={{ uri: props.imageUrl }} style={props.styles.cardImage} contentFit="cover" />
          ) : (
            <View style={[props.styles.cardImage, { backgroundColor: 'rgba(255,92,77,0.2)' }]} />
          )}
          <View style={props.styles.cardOverlay}>
            {props.category != null && (
              <View style={props.styles.cardCategoryBadge}>
                <CustomTextField styles={props.styles.cardCategoryText} title={props.category} />
              </View>
            )}
            {props.hasDeal && (
              <View style={props.styles.dealBadge}>
                <CustomTextField styles={props.styles.dealBadgeText} title={t('discover.dealBadge')} />
              </View>
            )}
            <CustomTextField styles={props.styles.cardTitle} title={props.title || '...'} />
          </View>
          {props.description.length > 0 && (
            <CustomTextField styles={props.styles.cardDescription} title={props.description} />
          )}
          {(props.priceLabel != null || props.tags.length > 0) && (
            <View style={props.styles.cardFooter}>
              {props.priceLabel != null && (
                <CustomTextField styles={props.styles.cardPriceText} title={props.priceLabel} />
              )}
              <View style={props.styles.cardTagsRow}>
                {props.tags.map((tag) => (
                  <View key={tag} style={props.styles.cardTag}>
                    <CustomTextField styles={props.styles.cardTagText} title={tag} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
        <CustomButton
          styles={props.closeButtonStyles}
          title={t('common.close')}
          onPress={props.onClose}
        />
      </Pressable>
    </Modal>
  );
}

// ── Main component ──

export default function CreateContainer(props: CreateProps): ReactNode {
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
    dealLinkStyles,
    boostSectionStyles,
    sectionStyles,
    validationErrorStyles,
    previewModalStyles,
    previewButtonStyles,
    submitButtonStyles,
    closePreviewButtonStyles,
    boostToggleButtonStyles,
    unlinkDealButtonStyles,
  } = useCreateStyles();

  const {
    isLoading,
    isSubmitting,
    title,
    selectedCategory,
    description,
    descriptionMaxLength,
    primaryImageUrl,
    selectedPriceRange,
    operatingHours,
    selectedTags,
    linkedDealId,
    boostEnabled,
    selectedBoostTierId,
    boostBudgetInDollars,
    minBoostBudgetInDollars,
    maxBoostBudgetInDollars,
    isPreviewVisible,
    categoryOptions,
    priceRangeOptions,
    tagOptions,
    boostTiers,
    existingDeals,
    validationErrors,
    hasAttemptedSubmit,
    onTitleChange,
    onCategorySelect,
    onDescriptionChange,
    onImageUpload,
    onPriceRangeSelect,
    onOperatingHoursChange,
    onTagToggle,
    onLinkDeal,
    onUnlinkDeal,
    onToggleBoost,
    onBoostTierSelect,
    onBoostBudgetChange,
    onTogglePreview,
    onSubmit,
    isFormValid,
    estimatedBoostImpressions,
    linkedDealHeadline,
  } = useCreate(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
        <CustomHeader
          showBackButton
          onGoBack={props.onGoBack}
          title={t('bizActivityCreate.title')}
          customHeaderStyles={headerStyles}
        />
      </SafeAreaView>
    );
  }

  const charCountRatio = description.length / descriptionMaxLength;
  const isNearLimit = charCountRatio >= NEAR_LIMIT_THRESHOLD;

  // Build preview data
  const selectedCategoryOption = categoryOptions.find((opt) => opt.value === selectedCategory);
  const selectedPriceOption = priceRangeOptions.find((opt) => opt.value === selectedPriceRange);
  const previewPriceLabel = selectedPriceOption != null ? t(selectedPriceOption.labelKey) : undefined;
  const previewTags = selectedTags.map((tagValue) => {
    const tagOption = tagOptions.find((opt) => opt.value === tagValue);
    return tagOption != null ? t(tagOption.labelKey) : tagValue;
  });
  const previewCategoryLabel = selectedCategoryOption != null ? t(selectedCategoryOption.labelKey) : undefined;

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizActivityCreate.title')}
        customHeaderStyles={headerStyles}
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
            <View style={{ marginBottom: spacingPresets.md2 }}>
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
            <View style={{ marginBottom: spacingPresets.md2 }}>
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
            <View style={{ marginBottom: spacingPresets.md2 }}>
              <CustomTextField styles={styles.fieldLabel} title={t('bizActivityCreate.priceRangeLabel')} />
              <PriceChipRow
                options={priceRangeOptions}
                selectedPrice={selectedPriceRange}
                onSelect={onPriceRangeSelect}
                styles={priceChipStyles}
              />
            </View>

            {/* Operating Hours */}
            <View style={{ marginBottom: spacingPresets.md2 }}>
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

        {/* Deal Attachment */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 3).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizActivityCreate.sectionDeal')} />
            <DealLinkSection
              deals={existingDeals}
              linkedDealId={linkedDealId}
              onLinkDeal={onLinkDeal}
              onUnlinkDeal={onUnlinkDeal}
              styles={dealLinkStyles}
              unlinkButtonStyles={unlinkDealButtonStyles}
            />
          </View>
        </Animated.View>

        {/* Boost Options */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 4).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacingPresets.md1 }}>
              <CustomTextField styles={sectionStyles.header} title={t('bizActivityCreate.sectionBoost')} />
              <CustomButton
                styles={boostToggleButtonStyles}
                title={boostEnabled ? t('common.cancel') : t('bizActivityCreate.sectionBoost')}
                onPress={onToggleBoost}
                leftIcon={(iconProps) => <Zap size={iconProps.size} color={iconProps.color} />}
              />
            </View>
            {!boostEnabled && (
              <CustomTextField
                styles={{
                  ...charCountStyles.text,
                  textAlign: 'left',
                } as TextStyle}
                title={t('bizActivityCreate.boostDescription')}
              />
            )}
            {boostEnabled && (
              <BoostConfig
                enabled={boostEnabled}
                tiers={boostTiers}
                selectedTierId={selectedBoostTierId}
                budgetInDollars={boostBudgetInDollars}
                minBudget={minBoostBudgetInDollars}
                maxBudget={maxBoostBudgetInDollars}
                estimatedImpressions={estimatedBoostImpressions}
                onTierSelect={onBoostTierSelect}
                onBudgetChange={onBoostBudgetChange}
                styles={boostSectionStyles}
                accentColor={boostToggleButtonStyles.icon.color as string}
                trackColor={operatingHoursInputStyles.container?.borderColor as string}
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <CustomButton
          styles={previewButtonStyles}
          title={t('bizActivityCreate.preview')}
          onPress={onTogglePreview}
          leftIcon={(iconProps) => <Eye size={iconProps.size} color={iconProps.color} />}
        />
        <CustomButton
          styles={submitButtonStyles}
          title={isSubmitting ? t('bizActivityCreate.creating') : t('bizActivityCreate.createButton')}
          onPress={onSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </SafeAreaView>

      {/* Preview Modal */}
      <PreviewCardModal
        visible={isPreviewVisible}
        title={title}
        description={description}
        imageUrl={primaryImageUrl}
        category={previewCategoryLabel}
        priceLabel={previewPriceLabel}
        tags={previewTags}
        hasDeal={linkedDealId != null}
        onClose={onTogglePreview}
        styles={previewModalStyles}
        closeButtonStyles={closePreviewButtonStyles}
      />
    </SafeAreaView>
  );
}

// ── Inline style helper (used in JSX for simple spacing) ──
const spacingPresets = {
  md1: 12,
  md2: 16,
};
