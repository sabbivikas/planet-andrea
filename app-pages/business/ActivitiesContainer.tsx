/**
 * Main container for the Activities route
 */

import React, { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, FlatList, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import {
  Plus,
  Eye,
  ArrowLeftRight,
  Tag,
  Zap,
  Trash2,
  Pause,
  Play,
  Search,
  TrendingUp,
  ChevronRight,
  Check,
  CheckSquare,
} from 'lucide-react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import {
  useActivitiesStyles,
  type FilterPillStyles,
  type SortToggleStyles,
  type ActivityCardStyles,
  type EmptyStateStyles,
  type CountBadgeStyles,
  type BulkActionBarStyles,
  type SelectionCheckboxStyles,
} from './ActivitiesStyles';
import {
  useActivities,
  type ActivityCardItem,
  type ActivityStatusFilter,
  type FilterOption,
  type SortMode,
  type SortOption,
} from './ActivitiesFunc';
import { ActivitiesProps } from '@/app/business/activities';
import { t } from '@/i18n';
import type { ActivityStatus } from '@shared/generated-db-types';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 80;
const EYE_ICON_SIZE = 12;
const SWIPE_ICON_SIZE = 12;
const TAG_ICON_SIZE = 10;
const EMPTY_ICON_SIZE = 28;
const BENEFIT_ICON_SIZE = 18;
const CHEVRON_ICON_SIZE = 18;

// ── Helpers ──

function getStatusBadgeStyle(status: ActivityStatus, styles: ActivityCardStyles): ViewStyle[] {
  const base = styles.statusBadge;
  switch (status) {
    case 'ACTIVE':
      return [base, styles.statusBadgeActive];
    case 'PAUSED':
      return [base, styles.statusBadgePaused];
    case 'PENDING_REVIEW':
      return [base, styles.statusBadgePending];
  }
}

function getStatusBadgeTextStyle(status: ActivityStatus, styles: ActivityCardStyles): TextStyle {
  const base = styles.statusBadgeText;
  switch (status) {
    case 'ACTIVE':
      return { ...base, ...styles.statusBadgeTextActive };
    case 'PAUSED':
      return { ...base, ...styles.statusBadgeTextPaused };
    case 'PENDING_REVIEW':
      return { ...base, ...styles.statusBadgeTextPending };
  }
}

function getStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'ACTIVE':
      return t('bizActivities.statusActive');
    case 'PAUSED':
      return t('bizActivities.statusPaused');
    case 'PENDING_REVIEW':
      return t('bizActivities.statusPending');
  }
}

// ── Sub-components ──

interface FilterPillRowProps {
  options: FilterOption[];
  activeFilter: ActivityStatusFilter;
  onFilterChange: (filter: ActivityStatusFilter) => void;
  styles: FilterPillStyles;
}

function FilterPillRow(props: FilterPillRowProps): ReactNode {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={props.styles.container}
    >
      {props.options.map((option) => {
        const isActive = props.activeFilter === option.value;
        return (
          <Pressable
            key={option.value}
            style={[props.styles.pill, isActive && props.styles.pillActive]}
            onPress={() => props.onFilterChange(option.value)}
          >
            <CustomTextField
              styles={isActive ? props.styles.pillTextActive : props.styles.pillText}
              title={t(option.labelKey)}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface SortToggleRowProps {
  options: SortOption[];
  activeSort: SortMode;
  onSortChange: (mode: SortMode) => void;
  styles: SortToggleStyles;
}

function SortToggleRow(props: SortToggleRowProps): ReactNode {
  return (
    <View style={props.styles.container}>
      {props.options.map((option) => {
        const isActive = props.activeSort === option.value;
        return (
          <Pressable
            key={option.value}
            style={[props.styles.option, isActive && props.styles.optionActive]}
            onPress={() => props.onSortChange(option.value)}
          >
            <CustomTextField
              styles={isActive ? props.styles.optionTextActive : props.styles.optionText}
              title={t(option.labelKey)}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

interface CountBadgeProps {
  count: number;
  styles: CountBadgeStyles;
}

function CountBadge(props: CountBadgeProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField
        styles={props.styles.text}
        title={t('bizActivities.activityCount', { count: String(props.count) })}
      />
    </View>
  );
}

interface SelectionCheckboxComponentProps {
  isSelected: boolean;
  onToggle: () => void;
  styles: SelectionCheckboxStyles;
}

function SelectionCheckbox(props: SelectionCheckboxComponentProps): ReactNode {
  return (
    <Pressable style={props.styles.container} onPress={props.onToggle}>
      <View style={[props.styles.checkbox, props.isSelected && props.styles.checkboxSelected]}>
        {props.isSelected && (
          <Check size={props.styles.checkIcon.size} color={props.styles.checkIcon.color} />
        )}
      </View>
    </Pressable>
  );
}

interface BulkActionBarComponentProps {
  selectedCount: number;
  totalCount: number;
  styles: BulkActionBarStyles;
  pauseButtonStyles: CustomButtonStyles;
  activateButtonStyles: CustomButtonStyles;
  deleteButtonStyles: CustomButtonStyles;
  selectAllButtonStyles: CustomButtonStyles;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkPause: () => void;
  onBulkActivate: () => void;
  onBulkDelete: () => void;
}

function BulkActionBar(props: BulkActionBarComponentProps): ReactNode {
  const allSelected = props.selectedCount === props.totalCount && props.totalCount > 0;

  return (
    <View style={props.styles.container}>
      <View style={props.styles.selectionInfo}>
        <CustomTextField
          styles={props.styles.selectionText}
          title={t('bizActivities.bulkSelected', { count: String(props.selectedCount) })}
        />
        <CustomButton
          styles={props.selectAllButtonStyles}
          title={allSelected ? t('bizActivities.bulkDeselectAll') : t('bizActivities.bulkSelectAll')}
          onPress={allSelected ? props.onDeselectAll : props.onSelectAll}
        />
      </View>
      <View style={props.styles.actionsRow}>
        <CustomButton
          styles={props.pauseButtonStyles}
          title={t('bizActivities.bulkPause')}
          onPress={props.onBulkPause}
          leftIcon={(iconProps) => <Pause size={iconProps.size} color={iconProps.color} />}
        />
        <CustomButton
          styles={props.activateButtonStyles}
          title={t('bizActivities.bulkActivate')}
          onPress={props.onBulkActivate}
          leftIcon={(iconProps) => <Play size={iconProps.size} color={iconProps.color} />}
        />
        <CustomButton
          styles={props.deleteButtonStyles}
          title={t('bizActivities.bulkDelete')}
          onPress={props.onBulkDelete}
          leftIcon={(iconProps) => <Trash2 size={iconProps.size} color={iconProps.color} />}
        />
      </View>
    </View>
  );
}

interface ActivityCardComponentProps {
  item: ActivityCardItem;
  index: number;
  styles: ActivityCardStyles;
  selectionCheckboxStyles: SelectionCheckboxStyles;
  toggleStatusButtonStyles: CustomButtonStyles;
  deleteButtonStyles: CustomButtonStyles;
  formatCount: (value: number) => string;
  isBulkMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onToggleSelection: () => void;
}

function ActivityCard(props: ActivityCardComponentProps): ReactNode {
  const isActive = props.item.status === 'ACTIVE';
  const statusBadgeStyle = getStatusBadgeStyle(props.item.status, props.styles);
  const statusTextStyle = getStatusBadgeTextStyle(props.item.status, props.styles);

  return (
    <Animated.View
      entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(400).springify()}
      style={props.styles.container}
    >
      <Pressable
        style={props.styles.pressable}
        onPress={props.isBulkMode ? props.onToggleSelection : props.onPress}
      >
        {props.isBulkMode && (
          <SelectionCheckbox
            isSelected={props.isSelected}
            onToggle={props.onToggleSelection}
            styles={props.selectionCheckboxStyles}
          />
        )}
        <Image
          source={{ uri: props.item.imageUrl }}
          style={props.styles.thumbnail}
          contentFit="cover"
        />
        <View style={props.styles.contentContainer}>
          <View style={props.styles.titleRow}>
            <CustomTextField styles={props.styles.title} title={props.item.title} />
            <View style={statusBadgeStyle}>
              <CustomTextField styles={statusTextStyle} title={getStatusLabel(props.item.status)} />
            </View>
          </View>
          <View style={props.styles.metricsRow}>
            <View style={props.styles.metricGroup}>
              <View style={props.styles.metricIconWrapper}>
                <Eye size={EYE_ICON_SIZE} color={props.styles.metricText.color as string} />
              </View>
              <CustomTextField
                styles={props.styles.metricText}
                title={t('bizActivities.impressionsLabel', { count: props.formatCount(props.item.impressions) })}
              />
            </View>
            <View style={props.styles.metricGroup}>
              <View style={props.styles.metricIconWrapper}>
                <ArrowLeftRight size={SWIPE_ICON_SIZE} color={props.styles.metricText.color as string} />
              </View>
              <CustomTextField
                styles={props.styles.metricText}
                title={t('bizActivities.swipesLabel', { count: props.formatCount(props.item.swipeCount) })}
              />
            </View>
            {props.item.hasDeal && (
              <View style={props.styles.dealBadge}>
                <View style={props.styles.dealIconWrapper}>
                  <Tag size={TAG_ICON_SIZE} color={props.styles.dealBadgeText.color as string} />
                </View>
                <CustomTextField styles={props.styles.dealBadgeText} title={t('bizActivities.dealAttached')} />
              </View>
            )}
          </View>
        </View>
        <View style={props.styles.chevronWrapper}>
          <ChevronRight size={CHEVRON_ICON_SIZE} color={props.styles.metricText.color as string} />
        </View>
      </Pressable>
      {!props.isBulkMode && (
        <View style={props.styles.actionsRow}>
          <CustomButton
            styles={props.toggleStatusButtonStyles}
            title={isActive ? t('bizActivities.pause') : t('bizActivities.activate')}
            onPress={props.onToggleStatus}
            leftIcon={(iconProps) =>
              isActive ? (
                <Pause size={iconProps.size} color={iconProps.color} />
              ) : (
                <Play size={iconProps.size} color={iconProps.color} />
              )
            }
          />
          <CustomButton
            styles={props.deleteButtonStyles}
            title={t('bizActivities.delete')}
            onPress={props.onDelete}
            leftIcon={(iconProps) => <Trash2 size={iconProps.size} color={iconProps.color} />}
          />
        </View>
      )}
    </Animated.View>
  );
}

interface EmptyStateComponentProps {
  styles: EmptyStateStyles;
  buttonStyles: CustomButtonStyles;
  onCreateActivity: () => void;
}

function EmptyState(props: EmptyStateComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={props.styles.container}>
      <View style={props.styles.iconWrapper}>
        <Zap size={EMPTY_ICON_SIZE} color={props.styles.iconColor} />
      </View>
      <CustomTextField styles={props.styles.title} title={t('bizActivities.emptyTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('bizActivities.emptySubtitle')} />
      <View style={props.styles.benefitsContainer}>
        <View style={props.styles.benefitRow}>
          <View style={props.styles.benefitIconWrapper}>
            <Search size={BENEFIT_ICON_SIZE} color={props.styles.benefitIconColor} />
          </View>
          <CustomTextField styles={props.styles.benefitText} title={t('bizActivities.emptyBenefit1')} />
        </View>
        <View style={props.styles.benefitRow}>
          <View style={props.styles.benefitIconWrapper}>
            <Tag size={BENEFIT_ICON_SIZE} color={props.styles.benefitIconColor} />
          </View>
          <CustomTextField styles={props.styles.benefitText} title={t('bizActivities.emptyBenefit2')} />
        </View>
        <View style={props.styles.benefitRow}>
          <View style={props.styles.benefitIconWrapper}>
            <TrendingUp size={BENEFIT_ICON_SIZE} color={props.styles.benefitIconColor} />
          </View>
          <CustomTextField styles={props.styles.benefitText} title={t('bizActivities.emptyBenefit3')} />
        </View>
      </View>
      <CustomButton
        styles={props.buttonStyles}
        title={t('bizActivities.emptyCreateButton')}
        onPress={props.onCreateActivity}
        leftIcon={(iconProps) => <Plus size={iconProps.size} color={iconProps.color} />}
      />
    </Animated.View>
  );
}

// ── Main component ──

export default function ActivitiesContainer(props: ActivitiesProps): ReactNode {
  const {
    styles,
    headerStyles,
    createButtonStyles,
    bulkToggleButtonStyles,
    filterPillStyles,
    sortToggleStyles,
    activityCardStyles,
    selectionCheckboxStyles,
    bulkActionBarStyles,
    bulkPauseButtonStyles,
    bulkActivateButtonStyles,
    bulkDeleteButtonStyles,
    emptyStateStyles,
    emptyCreateButtonStyles,
    toggleStatusButtonStyles,
    deleteButtonStyles,
    countBadgeStyles,
  } = useActivitiesStyles();

  const {
    isLoading,
    isRefreshing,
    filteredActivities,
    totalActivityCount,
    activeFilter,
    activeSortMode,
    filterOptions,
    sortOptions,
    isBulkMode,
    selectedIds,
    formatCount,
    onFilterChange,
    onSortChange,
    onRefresh,
    onToggleActivityStatus,
    onDeleteActivity,
    onToggleBulkMode,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    onBulkPause,
    onBulkActivate,
    onBulkDelete,
  } = useActivities(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} {...safeAreaProps}>
        <ActivityIndicator size="large" color={styles.loadingText.color as string} />
        <CustomTextField styles={styles.loadingText} title={t('bizActivities.loadingActivities')} />
      </SafeAreaView>
    );
  }

  function renderActivityCard(info: ListRenderItemInfo<ActivityCardItem>): React.ReactElement {
    return (
      <ActivityCard
        item={info.item}
        index={info.index}
        styles={activityCardStyles}
        selectionCheckboxStyles={selectionCheckboxStyles}
        toggleStatusButtonStyles={toggleStatusButtonStyles}
        deleteButtonStyles={deleteButtonStyles}
        formatCount={formatCount}
        isBulkMode={isBulkMode}
        isSelected={selectedIds.has(info.item.id)}
        onPress={() => props.onNavigateToEditActivity({ activityId: info.item.id })}
        onToggleStatus={() => onToggleActivityStatus(info.item.id)}
        onDelete={() => onDeleteActivity(info.item.id)}
        onToggleSelection={() => onToggleSelection(info.item.id)}
      />
    );
  }

  function renderListHeader(): React.ReactElement {
    return <CountBadge count={totalActivityCount} styles={countBadgeStyles} />;
  }

  function renderListEmpty(): React.ReactElement {
    return (
      <EmptyState
        styles={emptyStateStyles}
        buttonStyles={emptyCreateButtonStyles}
        onCreateActivity={() => props.onNavigateToCreateActivity()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizActivities.title')}
        customHeaderStyles={headerStyles}
        RightComponent={
          totalActivityCount > 0 ? (
            <CustomButton
              styles={bulkToggleButtonStyles}
              onPress={onToggleBulkMode}
              leftIcon={(iconProps) => <CheckSquare size={iconProps.size} color={iconProps.color} />}
            />
          ) : undefined
        }
      />

      {!isBulkMode && (
        <CustomButton
          styles={createButtonStyles}
          title={t('bizActivities.createActivity')}
          onPress={() => props.onNavigateToCreateActivity()}
          leftIcon={(iconProps) => <Plus size={iconProps.size} color={iconProps.color} />}
        />
      )}

      {isBulkMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={filteredActivities.length}
          styles={bulkActionBarStyles}
          pauseButtonStyles={bulkPauseButtonStyles}
          activateButtonStyles={bulkActivateButtonStyles}
          deleteButtonStyles={bulkDeleteButtonStyles}
          selectAllButtonStyles={bulkToggleButtonStyles}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onBulkPause={onBulkPause}
          onBulkActivate={onBulkActivate}
          onBulkDelete={onBulkDelete}
        />
      )}

      <View style={styles.toolbarContainer}>
        <FilterPillRow
          options={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          styles={filterPillStyles}
        />
        <View style={styles.sortContainer}>
          <SortToggleRow
            options={sortOptions}
            activeSort={activeSortMode}
            onSortChange={onSortChange}
            styles={sortToggleStyles}
          />
        </View>
      </View>

      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityCard}
        ListHeaderComponent={totalActivityCount > 0 ? renderListHeader : undefined}
        ListEmptyComponent={renderListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        style={styles.listContainer}
      />
    </SafeAreaView>
  );
}
