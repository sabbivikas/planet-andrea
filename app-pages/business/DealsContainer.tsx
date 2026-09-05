/**
 * Main container for the Deals route
 */

import React, { type ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, FlatList, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import type { ListRenderItemInfo , ViewStyle, TextStyle } from 'react-native';
import {
  Plus,
  Eye,
  TicketCheck,
  TrendingUp,
  Link2,
  AlertTriangle,
  Ticket,
  Tag,
  Percent,
  Copy,
  Trash2,
  Pause,
  Play,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import {
  useDealsStyles,
  type FilterPillStyles,
  type SortToggleStyles,
  type DealCardStyles,
  type EmptyStateStyles,
  type CountBadgeStyles,
} from './DealsStyles';
import {
  useDeals,
  type DealCardItem,
  type DealStatusFilter,
  type DealSortMode,
  type FilterOption,
  type SortOption,
} from './DealsFunc';
import { DealsProps } from '@/app/business/deals';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { t } from '@/i18n';
import type { DealStatus } from '@shared/generated-db-types';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 80;
const EYE_ICON_SIZE = 12;
const REDEEM_ICON_SIZE = 12;
const CONVERSION_ICON_SIZE = 12;
const LINK_ICON_SIZE = 10;
const WARNING_ICON_SIZE = 10;
const EMPTY_ICON_SIZE = 28;
const TIP_ICON_SIZE = 18;
const CHEVRON_ICON_SIZE = 18;
const CHEVRON_OPACITY = 0.4;

// ── Helpers ──

function getStatusBadgeStyle(status: DealStatus, styles: DealCardStyles): ViewStyle[] {
  const base = styles.statusBadge;
  switch (status) {
    case 'ACTIVE':
      return [base, styles.statusBadgeActive];
    case 'EXPIRED':
      return [base, styles.statusBadgeExpired];
    case 'SCHEDULED':
      return [base, styles.statusBadgeScheduled];
  }
}

function getStatusBadgeTextStyle(status: DealStatus, styles: DealCardStyles): TextStyle {
  const base = styles.statusBadgeText;
  switch (status) {
    case 'ACTIVE':
      return { ...base, ...styles.statusBadgeTextActive };
    case 'EXPIRED':
      return { ...base, ...styles.statusBadgeTextExpired };
    case 'SCHEDULED':
      return { ...base, ...styles.statusBadgeTextScheduled };
  }
}

function getStatusLabel(status: DealStatus): string {
  switch (status) {
    case 'ACTIVE':
      return t('bizDeals.statusActive');
    case 'EXPIRED':
      return t('bizDeals.statusExpired');
    case 'SCHEDULED':
      return t('bizDeals.statusScheduled');
  }
}

// ── Sub-components ──

interface FilterPillRowProps {
  options: FilterOption[];
  activeFilter: DealStatusFilter;
  onFilterChange: (filter: DealStatusFilter) => void;
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
  activeSort: DealSortMode;
  onSortChange: (mode: DealSortMode) => void;
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

interface CountBadgeComponentProps {
  count: number;
  styles: CountBadgeStyles;
}

function CountBadge(props: CountBadgeComponentProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField
        styles={props.styles.text}
        title={t('bizDeals.dealCount', { count: String(props.count) })}
      />
    </View>
  );
}

interface DealCardComponentProps {
  item: DealCardItem;
  index: number;
  styles: DealCardStyles;
  deactivateButtonStyles: CustomButtonStyles;
  duplicateButtonStyles: CustomButtonStyles;
  deleteButtonStyles: CustomButtonStyles;
  formatCount: (value: number) => string;
  formatDiscountValue: (item: DealCardItem) => string;
  onPress: () => void;
  onDeactivate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function DealCard(props: DealCardComponentProps): ReactNode {
  const isActive = props.item.status === 'ACTIVE';
  const statusBadgeStyle = getStatusBadgeStyle(props.item.status, props.styles);
  const statusTextStyle = getStatusBadgeTextStyle(props.item.status, props.styles);
  const discountDisplay = props.formatDiscountValue(props.item);

  return (
    <Animated.View
      entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(400).springify()}
      style={props.styles.container}
    >
      <Pressable style={props.styles.pressable} onPress={props.onPress}>
        <View style={props.styles.discountBadge}>
          <CustomTextField styles={props.styles.discountBadgeText} title={discountDisplay} />
          {(props.item.dealType === 'PERCENTAGE_OFF' || props.item.dealType === 'FIXED_AMOUNT') && (
            <CustomTextField styles={props.styles.discountLabelText} title={t('bizDeals.off')} />
          )}
        </View>
        <View style={props.styles.contentContainer}>
          <View style={props.styles.titleRow}>
            <CustomTextField styles={props.styles.headline} title={props.item.headline} />
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
                title={t('bizDeals.viewsLabel', { count: props.formatCount(props.item.views) })}
              />
            </View>
            <View style={props.styles.metricGroup}>
              <View style={props.styles.metricIconWrapper}>
                <TicketCheck size={REDEEM_ICON_SIZE} color={props.styles.metricText.color as string} />
              </View>
              <CustomTextField
                styles={props.styles.metricText}
                title={t('bizDeals.redemptionsLabel', { count: props.formatCount(props.item.redemptions) })}
              />
            </View>
            <View style={props.styles.metricGroup}>
              <View style={props.styles.metricIconWrapper}>
                <TrendingUp size={CONVERSION_ICON_SIZE} color={props.styles.metricText.color as string} />
              </View>
              <CustomTextField
                styles={props.styles.metricText}
                title={t('bizDeals.conversionLabel', { rate: String(props.item.conversionRate) })}
              />
            </View>
          </View>
          <View style={props.styles.metricsRow}>
            {props.item.linkedActivitiesCount > 0 && (
              <View style={props.styles.linkedBadge}>
                <View style={props.styles.linkedBadgeIconWrapper}>
                  <Link2 size={LINK_ICON_SIZE} color={props.styles.linkedBadgeText.color as string} />
                </View>
                <CustomTextField
                  styles={props.styles.linkedBadgeText}
                  title={t('bizDeals.linkedActivities', { count: String(props.item.linkedActivitiesCount) })}
                />
              </View>
            )}
            {props.item.isExpiringSoon && (
              <View style={props.styles.expiryWarningBadge}>
                <View style={props.styles.expiryWarningIconWrapper}>
                  <AlertTriangle size={WARNING_ICON_SIZE} color={props.styles.expiryWarningText.color as string} />
                </View>
                <CustomTextField
                  styles={props.styles.expiryWarningText}
                  title={t('bizDeals.expiringSoon')}
                />
              </View>
            )}
          </View>
        </View>
        <View style={props.styles.metricIconWrapper}>
          <ChevronRight size={CHEVRON_ICON_SIZE} color={props.styles.metricText.color as string} opacity={CHEVRON_OPACITY} />
        </View>
      </Pressable>
      <View style={props.styles.actionsRow}>
        <CustomButton
          styles={props.deactivateButtonStyles}
          title={isActive ? t('bizDeals.deactivate') : t('bizDeals.activate')}
          onPress={props.onDeactivate}
          leftIcon={(iconProps) =>
            isActive ? (
              <Pause size={iconProps.size} color={iconProps.color} />
            ) : (
              <Play size={iconProps.size} color={iconProps.color} />
            )
          }
        />
        <CustomButton
          styles={props.duplicateButtonStyles}
          title={t('bizDeals.duplicate')}
          onPress={props.onDuplicate}
          leftIcon={(iconProps) => <Copy size={iconProps.size} color={iconProps.color} />}
        />
        <CustomButton
          styles={props.deleteButtonStyles}
          title={t('bizDeals.delete')}
          onPress={props.onDelete}
          leftIcon={(iconProps) => <Trash2 size={iconProps.size} color={iconProps.color} />}
        />
      </View>
    </Animated.View>
  );
}

interface EmptyStateComponentProps {
  styles: EmptyStateStyles;
  buttonStyles: CustomButtonStyles;
  onCreateDeal: () => void;
}

function EmptyState(props: EmptyStateComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={props.styles.container}>
      <View style={props.styles.iconWrapper}>
        <Ticket size={EMPTY_ICON_SIZE} color={props.styles.iconColor} />
      </View>
      <CustomTextField styles={props.styles.title} title={t('bizDeals.emptyTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('bizDeals.emptySubtitle')} />
      <View style={props.styles.tipsContainer}>
        <View style={props.styles.tipRow}>
          <View style={props.styles.tipIconWrapper}>
            <Percent size={TIP_ICON_SIZE} color={props.styles.tipIconColor} />
          </View>
          <CustomTextField styles={props.styles.tipText} title={t('bizDeals.emptyTip1')} />
        </View>
        <View style={props.styles.tipRow}>
          <View style={props.styles.tipIconWrapper}>
            <Clock size={TIP_ICON_SIZE} color={props.styles.tipIconColor} />
          </View>
          <CustomTextField styles={props.styles.tipText} title={t('bizDeals.emptyTip2')} />
        </View>
        <View style={props.styles.tipRow}>
          <View style={props.styles.tipIconWrapper}>
            <Tag size={TIP_ICON_SIZE} color={props.styles.tipIconColor} />
          </View>
          <CustomTextField styles={props.styles.tipText} title={t('bizDeals.emptyTip3')} />
        </View>
      </View>
      <CustomButton
        styles={props.buttonStyles}
        title={t('bizDeals.emptyCreateButton')}
        onPress={props.onCreateDeal}
        leftIcon={(iconProps) => <Plus size={iconProps.size} color={iconProps.color} />}
      />
    </Animated.View>
  );
}

// ── Main component ──

export default function DealsContainer(props: DealsProps): ReactNode {
  const {
    styles,
    headerStyles,
    createButtonStyles,
    filterPillStyles,
    sortToggleStyles,
    dealCardStyles,
    emptyStateStyles,
    emptyCreateButtonStyles,
    deactivateButtonStyles,
    duplicateButtonStyles,
    deleteButtonStyles,
    countBadgeStyles,
  } = useDealsStyles();

  const {
    isLoading,
    isRefreshing,
    filteredDeals,
    totalDealCount,
    activeFilter,
    activeSortMode,
    filterOptions,
    sortOptions,
    formatCount,
    formatDiscountValue,
    onFilterChange,
    onSortChange,
    onRefresh,
    onDeactivateDeal,
    onDuplicateDeal,
    onDeleteDeal,
  } = useDeals(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} {...safeAreaProps}>
        <ActivityIndicator size="large" color={styles.loadingText.color as string} />
        <CustomTextField styles={styles.loadingText} title={t('bizDeals.loadingDeals')} />
      </SafeAreaView>
    );
  }

  function renderDealCard(info: ListRenderItemInfo<DealCardItem>): React.ReactElement {
    return (
      <DealCard
        item={info.item}
        index={info.index}
        styles={dealCardStyles}
        deactivateButtonStyles={deactivateButtonStyles}
        duplicateButtonStyles={duplicateButtonStyles}
        deleteButtonStyles={deleteButtonStyles}
        formatCount={formatCount}
        formatDiscountValue={formatDiscountValue}
        onPress={() => props.onNavigateToCreateDeal()}
        onDeactivate={() => onDeactivateDeal(info.item.id)}
        onDuplicate={() => onDuplicateDeal(info.item.id)}
        onDelete={() => onDeleteDeal(info.item.id)}
      />
    );
  }

  function renderListHeader(): React.ReactElement {
    return <CountBadge count={totalDealCount} styles={countBadgeStyles} />;
  }

  function renderListEmpty(): React.ReactElement {
    return (
      <EmptyState
        styles={emptyStateStyles}
        buttonStyles={emptyCreateButtonStyles}
        onCreateDeal={() => props.onNavigateToCreateDeal()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizDeals.title')}
        customHeaderStyles={headerStyles}
      />

      <CustomButton
        styles={createButtonStyles}
        title={t('bizDeals.createDeal')}
        onPress={() => props.onNavigateToCreateDeal()}
        leftIcon={(iconProps) => <Plus size={iconProps.size} color={iconProps.color} />}
      />

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
        data={filteredDeals}
        keyExtractor={(item) => item.id}
        renderItem={renderDealCard}
        ListHeaderComponent={totalDealCount > 0 ? renderListHeader : undefined}
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
