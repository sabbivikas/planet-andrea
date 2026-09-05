/**
 * Main container for the Create Deal route
 */

import { type ReactNode } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Pressable, Modal , ActivityIndicator } from 'react-native';
import { Eye, X, Check, Calendar, Clock, Users, DollarSign, Tag, Link2 } from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { DatePickerControl } from '@/comp-lib/form/controls/date-picker-control/DatePickerControl';
import {
  useCreateStyles,
  type DealTypeChipStyles,
  type DayChipStyles,
  type ActivityLinkStyles,
  type PreviewModalStyles,
  type SectionStyles,
  type CharCountStyles,
  type ValidationErrorStyles,
  type DateRowStyles,
  type RequirementRowStyles,
} from './CreateStyles';
import {
  useCreate,
  type DealTypeOption,
  type DayOption,
  type VenueActivity,
} from './CreateFunc';
import { CreateProps } from '@/app/business/deals/create';
import { t } from '@/i18n';
import type { DealType } from '@shared/generated-db-types';
import type { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 60;
const CHECK_ICON_SIZE = 14;
const NEAR_LIMIT_THRESHOLD = 0.9;

// ── Sub-components ──

interface DealTypeChipRowProps {
  options: DealTypeOption[];
  selectedType?: DealType;
  onSelect: (value: DealType) => void;
  styles: DealTypeChipStyles;
  errorText?: string;
}

function DealTypeChipRow(props: DealTypeChipRowProps): ReactNode {
  return (
    <View>
      <View style={props.styles.container}>
        {props.options.map((option) => {
          const isActive = props.selectedType === option.value;
          return (
            <Pressable
              key={option.value}
              style={[props.styles.chip, isActive && props.styles.chipActive]}
              onPress={() => props.onSelect(option.value)}
            >
              <CustomTextField
                styles={isActive ? props.styles.chipIconActive : props.styles.chipIcon}
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

interface DayChipRowProps {
  options: DayOption[];
  selectedDays: string[];
  onToggle: (day: string) => void;
  styles: DayChipStyles;
}

function DayChipRow(props: DayChipRowProps): ReactNode {
  return (
    <View style={props.styles.container}>
      {props.options.map((option) => {
        const isActive = props.selectedDays.includes(option.value);
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

interface ActivityLinkListProps {
  activities: VenueActivity[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  styles: ActivityLinkStyles;
  errorText?: string;
}

function ActivityLinkList(props: ActivityLinkListProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.hintText} title={t('bizDealCreate.activitiesHint')} />
      {props.activities.map((activity) => {
        const isLinked = props.selectedIds.includes(activity.id);
        return (
          <Pressable
            key={activity.id}
            style={[props.styles.item, isLinked && props.styles.itemActive]}
            onPress={() => props.onToggle(activity.id)}
          >
            <View style={props.styles.itemContent}>
              <CustomTextField
                styles={isLinked ? props.styles.itemTitleActive : props.styles.itemTitle}
                title={activity.title}
              />
              <CustomTextField styles={props.styles.itemCategory} title={activity.category} />
            </View>
            {isLinked && (
              <View style={props.styles.checkIcon}>
                <Check size={CHECK_ICON_SIZE} color={props.styles.checkIconColor} />
              </View>
            )}
          </Pressable>
        );
      })}
      {props.selectedIds.length > 0 && (
        <CustomTextField
          styles={props.styles.linkedCountText}
          title={t('bizDealCreate.linkedCount', { count: String(props.selectedIds.length) })}
        />
      )}
      {props.errorText != null && (
        <CustomTextField styles={props.styles.errorText} title={props.errorText} />
      )}
    </View>
  );
}

interface DealPreviewModalProps {
  visible: boolean;
  headline: string;
  dealType?: DealType;
  dealValue: string;
  termsAndConditions: string;
  minimumGroupSize: string;
  minimumSpendInDollars: string;
  startDate?: Date;
  endDate?: Date;
  validTimeStart: string;
  validTimeEnd: string;
  dayRestrictions: string[];
  linkedActivityCount: number;
  onClose: () => void;
  styles: PreviewModalStyles;
  closeButtonStyles: CustomButtonStyles;
  dealTypeOptions: DealTypeOption[];
  dayOptions: DayOption[];
}

function DealPreviewModal(props: DealPreviewModalProps): ReactNode {
  const dealTypeLabel = props.dealTypeOptions.find((opt) => opt.value === props.dealType);
  const dealDisplayValue = getDealDisplayValue(props.dealType, props.dealValue, dealTypeLabel);

  const dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const startDateStr = props.startDate != null ? props.startDate.toLocaleDateString(undefined, dateFormat) : '—';
  const endDateStr = props.endDate != null ? props.endDate.toLocaleDateString(undefined, dateFormat) : '—';

  const selectedDayLabels = props.dayRestrictions.map((day) => {
    const dayOpt = props.dayOptions.find((d) => d.value === day);
    return dayOpt != null ? t(dayOpt.labelKey) : day;
  });

  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <Pressable style={props.styles.overlay} onPress={props.onClose}>
        <Animated.View entering={FadeIn.duration(300)} style={props.styles.card}>
          <View style={props.styles.cardHeader}>
            <CustomTextField
              styles={props.styles.cardHeadline}
              title={props.headline || '...'}
            />
            <View style={props.styles.cardBadge}>
              <CustomTextField styles={props.styles.cardBadgeText} title={t('discover.dealBadge')} />
            </View>
          </View>

          {dealDisplayValue.length > 0 && (
            <>
              <View style={props.styles.cardRow}>
                <CustomTextField styles={props.styles.cardLabel} title={t('bizDealCreate.dealTypeLabel')} />
                <CustomTextField styles={props.styles.cardValue} title={dealDisplayValue} />
              </View>
              <View style={props.styles.cardDivider} />
            </>
          )}

          <View style={props.styles.cardRow}>
            <CustomTextField styles={props.styles.cardLabel} title={t('bizDealCreate.startDateLabel')} />
            <CustomTextField styles={props.styles.cardValue} title={startDateStr} />
          </View>
          <View style={props.styles.cardRow}>
            <CustomTextField styles={props.styles.cardLabel} title={t('bizDealCreate.endDateLabel')} />
            <CustomTextField styles={props.styles.cardValue} title={endDateStr} />
          </View>

          {(props.validTimeStart.length > 0 || props.validTimeEnd.length > 0) && (
            <View style={props.styles.cardRow}>
              <CustomTextField styles={props.styles.cardLabel} title={t('bizDealCreate.timeWindowLabel')} />
              <CustomTextField
                styles={props.styles.cardValue}
                title={`${props.validTimeStart || '—'} - ${props.validTimeEnd || '—'}`}
              />
            </View>
          )}

          {props.minimumGroupSize.length > 0 && (
            <View style={props.styles.cardRow}>
              <CustomTextField styles={props.styles.cardLabel} title={t('bizDealCreate.groupSizeLabel')} />
              <CustomTextField
                styles={props.styles.cardValue}
                title={t('bizDealCreate.previewGroupMin', { count: props.minimumGroupSize })}
              />
            </View>
          )}

          {props.minimumSpendInDollars.length > 0 && (
            <View style={props.styles.cardRow}>
              <CustomTextField styles={props.styles.cardLabel} title={t('bizDealCreate.spendAmountLabel')} />
              <CustomTextField
                styles={props.styles.cardValue}
                title={t('bizDealCreate.previewSpendMin', { amount: props.minimumSpendInDollars })}
              />
            </View>
          )}

          {props.termsAndConditions.length > 0 && (
            <>
              <View style={props.styles.cardDivider} />
              <CustomTextField styles={props.styles.cardTermsLabel} title={t('bizDealCreate.previewTermsLabel')} />
              <CustomTextField styles={props.styles.cardTerms} title={props.termsAndConditions} />
            </>
          )}

          {selectedDayLabels.length > 0 && (
            <View style={props.styles.cardChipRow}>
              {selectedDayLabels.map((label) => (
                <View key={label} style={props.styles.cardChip}>
                  <CustomTextField styles={props.styles.cardChipText} title={label} />
                </View>
              ))}
            </View>
          )}

          {props.linkedActivityCount > 0 && (
            <View style={props.styles.cardChipRow}>
              <View style={props.styles.cardChip}>
                <CustomTextField
                  styles={props.styles.cardChipText}
                  title={t('bizDealCreate.linkedCount', { count: String(props.linkedActivityCount) })}
                />
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

function getDealDisplayValue(
  dealType: DealType | undefined,
  dealValue: string,
  dealTypeLabel: DealTypeOption | undefined,
): string {
  if (dealType == null || dealTypeLabel == null) return '';
  if (dealType === 'BOGO') return t('bizDealCreate.typeBogo');
  if (dealType === 'FREE_ITEM') return t('bizDealCreate.typeFreeItem');
  if (dealType === 'PERCENTAGE_OFF' && dealValue.length > 0) return `${dealValue}% ${t('bizDeals.off')}`;
  if (dealType === 'FIXED_AMOUNT' && dealValue.length > 0) return `$${dealValue} ${t('bizDeals.off')}`;
  return t(dealTypeLabel.labelKey);
}

// ── Main component ──

export default function CreateContainer(props: CreateProps): ReactNode {
  const {
    styles,
    headerStyles,
    headlineInputStyles,
    dealTypeChipStyles,
    valueInputStyles,
    termsInputStyles,
    charCountStyles,
    groupSizeInputStyles,
    spendAmountInputStyles,
    dateInputStyles,
    timeInputStyles,
    dayChipStyles,
    limitInputStyles,
    activityLinkStyles,
    sectionStyles,
    validationErrorStyles,
    dateRowStyles,
    requirementRowStyles,
    previewModalStyles,
    previewButtonStyles,
    submitButtonStyles,
    closePreviewButtonStyles,
  } = useCreateStyles();

  const {
    isLoading,
    isSubmitting,
    headline,
    selectedDealType,
    dealValue,
    termsAndConditions,
    termsMaxLength,
    minimumGroupSize,
    minimumSpendInDollars,
    startDate,
    endDate,
    validTimeStart,
    validTimeEnd,
    dayRestrictions,
    totalRedemptionLimit,
    perUserLimit,
    linkedActivityIds,
    isPreviewVisible,
    dealTypeOptions,
    dayOptions,
    venueActivities,
    validationErrors,
    isValueInputVisible,
    valueLabel,
    onHeadlineChange,
    onDealTypeSelect,
    onDealValueChange,
    onTermsChange,
    onGroupSizeChange,
    onSpendAmountChange,
    onStartDateChange,
    onEndDateChange,
    onTimeStartChange,
    onTimeEndChange,
    onDayToggle,
    onTotalLimitChange,
    onPerUserLimitChange,
    onActivityToggle,
    onTogglePreview,
    onSubmit,
  } = useCreate(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  const termsCharRatio = termsAndConditions.length / termsMaxLength;
  const isTermsNearLimit = termsCharRatio >= NEAR_LIMIT_THRESHOLD;

  const startDateDisplay = startDate != null
    ? startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const endDateDisplay = endDate != null
    ? endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizDealCreate.title')}
        customHeaderStyles={headerStyles}
        RightComponent={
          <View style={{ width: 24, height: 24 }}>
            <Pressable onPress={props.onGoBack}>
              <X size={24} color={headerStyles.title.color} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Deal Details */}
        <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizDealCreate.sectionDetails')} />

            {/* Headline */}
            <View style={{ marginBottom: 16 }}>
              <CustomTextInput
                styles={headlineInputStyles}
                placeholder={t('bizDealCreate.headlinePlaceholder')}
                value={headline}
                onChangeText={onHeadlineChange}
                maxLength={80}
                errorText={validationErrors.headline}
                showErrorStyle={validationErrors.headline != null}
              />
            </View>

            {/* Deal Type */}
            <View style={{ marginBottom: 16 }}>
              <CustomTextField styles={styles.fieldLabel} title={t('bizDealCreate.dealTypeLabel')} />
              <DealTypeChipRow
                options={dealTypeOptions}
                selectedType={selectedDealType}
                onSelect={onDealTypeSelect}
                styles={dealTypeChipStyles}
                errorText={validationErrors.dealType}
              />
            </View>

            {/* Value Input (dynamic) */}
            {isValueInputVisible && (
              <View>
                <CustomTextInput
                  styles={valueInputStyles}
                  label={valueLabel}
                  placeholder={t('bizDealCreate.valuePlaceholder')}
                  value={dealValue}
                  onChangeText={onDealValueChange}
                  keyboardType="decimal-pad"
                  errorText={validationErrors.dealValue}
                  showErrorStyle={validationErrors.dealValue != null}
                />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Terms & Conditions */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizDealCreate.sectionTerms')} />
            <CustomTextInput
              styles={termsInputStyles}
              placeholder={t('bizDealCreate.termsPlaceholder')}
              value={termsAndConditions}
              onChangeText={onTermsChange}
              multiline
              maxLength={termsMaxLength}
            />
            <View style={charCountStyles.container}>
              <CustomTextField
                styles={isTermsNearLimit ? charCountStyles.textNearLimit : charCountStyles.text}
                title={t('bizDealCreate.termsCharCount', {
                  count: String(termsAndConditions.length),
                  max: String(termsMaxLength),
                })}
              />
            </View>
          </View>
        </Animated.View>

        {/* Minimum Requirements */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 2).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizDealCreate.sectionRequirements')} />
            <View style={requirementRowStyles.container}>
              <View style={requirementRowStyles.field}>
                <CustomTextInput
                  styles={groupSizeInputStyles}
                  label={t('bizDealCreate.groupSizeLabel')}
                  placeholder={t('bizDealCreate.groupSizePlaceholder')}
                  value={minimumGroupSize}
                  onChangeText={onGroupSizeChange}
                  keyboardType="number-pad"
                />
              </View>
              <View style={requirementRowStyles.field}>
                <CustomTextInput
                  styles={spendAmountInputStyles}
                  label={t('bizDealCreate.spendAmountLabel')}
                  placeholder={t('bizDealCreate.spendAmountPlaceholder')}
                  value={minimumSpendInDollars}
                  onChangeText={onSpendAmountChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Scheduling */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 3).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizDealCreate.sectionScheduling')} />

            {/* Start / End Date */}
            <View style={dateRowStyles.container}>
              <View style={dateRowStyles.field}>
                <CustomTextInput
                  styles={dateInputStyles}
                  label={t('bizDealCreate.startDateLabel')}
                  placeholder={t('bizDealCreate.startDatePlaceholder')}
                  value={startDateDisplay}
                  pressableOnly
                  onPress={() => {
                    // TODO: Integrate DatePickerControl or modal date picker
                    onStartDateChange(new Date());
                  }}
                  showErrorStyle={validationErrors.startDate != null}
                  errorText={validationErrors.startDate}
                  rightIcon={({ size, color }) => <Calendar size={size} color={color} />}
                />
              </View>
              <View style={dateRowStyles.field}>
                <CustomTextInput
                  styles={dateInputStyles}
                  label={t('bizDealCreate.endDateLabel')}
                  placeholder={t('bizDealCreate.endDatePlaceholder')}
                  value={endDateDisplay}
                  pressableOnly
                  onPress={() => {
                    // TODO: Integrate DatePickerControl or modal date picker
                    const twoWeeksFromNow = new Date();
                    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
                    onEndDateChange(twoWeeksFromNow);
                  }}
                  showErrorStyle={validationErrors.endDate != null || validationErrors.dateRange != null}
                  errorText={validationErrors.endDate ?? validationErrors.dateRange}
                  rightIcon={({ size, color }) => <Calendar size={size} color={color} />}
                />
              </View>
            </View>

            {/* Time Window */}
            <View style={{ marginTop: 16 }}>
              <CustomTextField styles={styles.fieldLabel} title={t('bizDealCreate.timeWindowLabel')} />
              <View style={dateRowStyles.container}>
                <View style={dateRowStyles.field}>
                  <CustomTextInput
                    styles={timeInputStyles}
                    placeholder={t('bizDealCreate.timeStartPlaceholder')}
                    value={validTimeStart}
                    onChangeText={onTimeStartChange}
                    rightIcon={({ size, color }) => <Clock size={size} color={color} />}
                  />
                </View>
                <View style={dateRowStyles.field}>
                  <CustomTextInput
                    styles={timeInputStyles}
                    placeholder={t('bizDealCreate.timeEndPlaceholder')}
                    value={validTimeEnd}
                    onChangeText={onTimeEndChange}
                    rightIcon={({ size, color }) => <Clock size={size} color={color} />}
                  />
                </View>
              </View>
            </View>

            {/* Day Restrictions */}
            <View style={{ marginTop: 16 }}>
              <CustomTextField styles={styles.fieldLabel} title={t('bizDealCreate.dayRestrictionsLabel')} />
              <DayChipRow
                options={dayOptions}
                selectedDays={dayRestrictions}
                onToggle={onDayToggle}
                styles={dayChipStyles}
              />
            </View>
          </View>
        </Animated.View>

        {/* Redemption Limits */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 4).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizDealCreate.sectionLimits')} />
            <View style={requirementRowStyles.container}>
              <View style={requirementRowStyles.field}>
                <CustomTextInput
                  styles={limitInputStyles}
                  label={t('bizDealCreate.totalLimitLabel')}
                  placeholder={t('bizDealCreate.totalLimitPlaceholder')}
                  value={totalRedemptionLimit}
                  onChangeText={onTotalLimitChange}
                  keyboardType="number-pad"
                />
              </View>
              <View style={requirementRowStyles.field}>
                <CustomTextInput
                  styles={limitInputStyles}
                  label={t('bizDealCreate.perUserLimitLabel')}
                  placeholder={t('bizDealCreate.perUserLimitPlaceholder')}
                  value={perUserLimit}
                  onChangeText={onPerUserLimitChange}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <CustomTextField styles={charCountStyles.text} title={t('bizDealCreate.unlimitedHint')} />
          </View>
        </Animated.View>

        {/* Link to Activities */}
        <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 5).duration(400).springify()}>
          <View style={sectionStyles.container}>
            <CustomTextField styles={sectionStyles.header} title={t('bizDealCreate.sectionActivities')} />
            {isLoading ? (
              <ActivityIndicator size="small" />
            ) : venueActivities.length === 0 ? (
              <CustomTextField styles={activityLinkStyles.hintText} title={t('bizDealCreate.noActivities')} />
            ) : (
              <ActivityLinkList
                activities={venueActivities}
                selectedIds={linkedActivityIds}
                onToggle={onActivityToggle}
                styles={activityLinkStyles}
                errorText={validationErrors.linkedActivities}
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <CustomButton
          styles={previewButtonStyles}
          title={t('bizDealCreate.preview')}
          onPress={onTogglePreview}
          leftIcon={(iconProps) => <Eye size={iconProps.size} color={iconProps.color} />}
        />
        <CustomButton
          styles={submitButtonStyles}
          title={isSubmitting ? t('bizDealCreate.creating') : t('bizDealCreate.createButton')}
          onPress={onSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </SafeAreaView>

      {/* Preview Modal */}
      <DealPreviewModal
        visible={isPreviewVisible}
        headline={headline}
        dealType={selectedDealType}
        dealValue={dealValue}
        termsAndConditions={termsAndConditions}
        minimumGroupSize={minimumGroupSize}
        minimumSpendInDollars={minimumSpendInDollars}
        startDate={startDate}
        endDate={endDate}
        validTimeStart={validTimeStart}
        validTimeEnd={validTimeEnd}
        dayRestrictions={dayRestrictions}
        linkedActivityCount={linkedActivityIds.length}
        onClose={onTogglePreview}
        styles={previewModalStyles}
        closeButtonStyles={closePreviewButtonStyles}
        dealTypeOptions={dealTypeOptions}
        dayOptions={dayOptions}
      />
    </SafeAreaView>
  );
}
