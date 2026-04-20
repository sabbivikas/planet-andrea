/**
 * Main container for the Analytics route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Download,
  Sparkles,
} from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import {
  useAnalyticsStyles,
  type TimePeriodPillStyles,
  type MetricCardStyles,
  type ChartSectionStyles,
  type ActivityRowStyles,
  type DealCardStyles,
  type LockedSectionStyles,
  type ComparisonToggleStyles,
} from './AnalyticsStyles';
import {
  useAnalytics,
  type TimePeriod,
  type TimePeriodOption,
  type OverviewMetric,
  type ChartDataPoint,
  type ActivityBreakdownItem,
  type DealPerformanceItem,
  TIME_PERIOD_OPTIONS,
} from './AnalyticsFunc';
import { AnalyticsProps } from '@/app/business/analytics';
import { t } from '@/i18n';

// ── Constants ──

const TREND_ICON_SIZE = 14;
const LOCK_ICON_SIZE = 20;
const EXPORT_ICON_SIZE = 18;
const UPGRADE_ICON_SIZE = 16;
const MAX_BAR_HEIGHT = 90;

// ── Sub-components ──

interface TimePeriodSelectorProps {
  options: readonly TimePeriodOption[];
  selectedPeriod: TimePeriod;
  onSelect: (period: TimePeriod) => void;
  styles: TimePeriodPillStyles;
}

function TimePeriodSelector(props: TimePeriodSelectorProps): ReactNode {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={props.styles.scrollContainer}
    >
      {props.options.map((option) => {
        const isSelected = option.value === props.selectedPeriod;
        return (
          <Pressable
            key={option.value}
            style={[props.styles.pill, isSelected && props.styles.pillSelected]}
            onPress={() => props.onSelect(option.value)}
          >
            <CustomTextField
              styles={isSelected ? props.styles.pillTextSelected : props.styles.pillText}
              title={t(option.labelKey as Parameters<typeof t>[0])}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface OverviewMetricCardProps {
  metric: OverviewMetric;
  styles: MetricCardStyles;
}

function OverviewMetricCard(props: OverviewMetricCardProps): ReactNode {
  const trendText = `${props.metric.trendDirection === 'down' ? '-' : '+'}${props.metric.trendPercentage}%`;
  const trendStyle =
    props.metric.trendDirection === 'up'
      ? props.styles.trendTextUp
      : props.metric.trendDirection === 'down'
        ? props.styles.trendTextDown
        : props.styles.trendTextFlat;

  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.value} title={props.metric.formattedValue} />
      <CustomTextField
        styles={props.styles.label}
        title={t(props.metric.labelKey as Parameters<typeof t>[0])}
      />
      <View style={props.styles.trendRow}>
        <View style={props.styles.trendIconWrapper}>
          {props.metric.trendDirection === 'up' && (
            <TrendingUp size={TREND_ICON_SIZE} color={props.styles.trendTextUp.color as string} />
          )}
          {props.metric.trendDirection === 'down' && (
            <TrendingDown size={TREND_ICON_SIZE} color={props.styles.trendTextDown.color as string} />
          )}
          {props.metric.trendDirection === 'flat' && (
            <Minus size={TREND_ICON_SIZE} color={props.styles.trendTextFlat.color as string} />
          )}
        </View>
        <CustomTextField styles={trendStyle} title={trendText} />
      </View>
    </View>
  );
}

interface BarChartProps {
  data: ChartDataPoint[];
  styles: ChartSectionStyles;
  accentColor?: string;
}

function BarChart(props: BarChartProps): ReactNode {
  const maxValue = Math.max(...props.data.map((d) => d.value), 1);

  return (
    <View style={props.styles.chartArea}>
      {props.data.map((point) => {
        const barHeight = Math.max((point.value / maxValue) * MAX_BAR_HEIGHT, 4);
        return (
          <View key={point.label} style={props.styles.barContainer}>
            <CustomTextField styles={props.styles.barValueLabel} title={formatChartValue(point.value)} />
            <View
              style={[
                props.styles.bar,
                { height: barHeight },
                props.accentColor != null ? { backgroundColor: props.accentColor } : undefined,
              ]}
            />
            <CustomTextField styles={props.styles.barLabel} title={point.label} />
          </View>
        );
      })}
    </View>
  );
}

function formatChartValue(value: number): string {
  const THOUSAND = 1000;
  if (value >= THOUSAND) {
    return `${(value / THOUSAND).toFixed(1)}k`;
  }
  return String(value);
}

interface ActivityTableProps {
  items: ActivityBreakdownItem[];
  styles: ActivityRowStyles;
}

function ActivityTable(props: ActivityTableProps): ReactNode {
  return (
    <View>
      <View style={props.styles.headerRow}>
        <CustomTextField styles={props.styles.headerCellTitle} title={t('bizAnalytics.activityBreakdown')} />
        <CustomTextField styles={props.styles.headerCell} title={t('bizAnalytics.impressionsCol')} />
        <CustomTextField styles={props.styles.headerCell} title={t('bizAnalytics.swipesCol')} />
        <CustomTextField styles={props.styles.headerCell} title={t('bizAnalytics.conversionCol')} />
      </View>
      {props.items.map((item) => (
        <View key={item.id} style={props.styles.row}>
          <View style={props.styles.titleCell}>
            <CustomTextField styles={props.styles.title} title={item.title} />
          </View>
          <CustomTextField styles={props.styles.cell} title={formatChartValue(item.impressions)} />
          <CustomTextField styles={props.styles.cell} title={formatChartValue(item.swipes)} />
          <View style={props.styles.conversionBadge}>
            <CustomTextField styles={props.styles.conversionText} title={`${item.conversionPercent}%`} />
          </View>
        </View>
      ))}
    </View>
  );
}

interface DealCardComponentProps {
  deal: DealPerformanceItem;
  styles: DealCardStyles;
}

function DealCard(props: DealCardComponentProps): ReactNode {
  const MAX_PERCENT = 100;
  const fillWidth = `${Math.min(props.deal.redemptionRatePercent, MAX_PERCENT)}%` as const;

  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.headline} title={props.deal.headline} />
      <View style={props.styles.statsRow}>
        <CustomTextField
          styles={props.styles.statLabel}
          title={t('bizAnalytics.redemptionRate', { rate: String(props.deal.redemptionRatePercent) })}
        />
        <CustomTextField
          styles={props.styles.peakLabel}
          title={t('bizAnalytics.peakTime', { time: props.deal.peakTime })}
        />
      </View>
      <View style={props.styles.progressBarTrack}>
        <View style={[props.styles.progressBarFill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

interface LockedAudienceProps {
  styles: LockedSectionStyles;
  upgradeButtonStyles: CustomButtonStyles;
  onUpgrade: () => void;
}

function LockedAudience(props: LockedAudienceProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconWrapper}>
        <Lock size={LOCK_ICON_SIZE} color={props.styles.iconColor} />
      </View>
      <CustomTextField styles={props.styles.title} title={t('bizAnalytics.audienceInsights')} />
      <CustomTextField styles={props.styles.description} title={t('bizAnalytics.audienceLocked')} />
      <CustomButton
        styles={props.upgradeButtonStyles}
        title={t('bizAnalytics.upgrade')}
        onPress={props.onUpgrade}
        leftIcon={(iconProps) => <Sparkles size={UPGRADE_ICON_SIZE} color={iconProps.color} />}
      />
    </View>
  );
}

// ── Main component ──

export default function AnalyticsContainer(props: AnalyticsProps): ReactNode {
  const {
    styles,
    headerStyles,
    timePeriodPillStyles,
    metricCardStyles,
    chartSectionStyles,
    activityRowStyles,
    dealCardStyles,
    lockedSectionStyles,
    comparisonToggleStyles,
    exportButtonStyles,
    upgradeButtonStyles,
  } = useAnalyticsStyles();

  const {
    isLoading,
    selectedPeriod,
    onSelectPeriod,
    showComparison,
    onToggleComparison,
    overviewMetrics,
    impressionsChartData,
    swipesByDayData,
    activityBreakdown,
    dealPerformance,
    isPremium,
    onExportCsv,
    onUpgrade,
  } = useAnalytics(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} {...safeAreaProps}>
        <ActivityIndicator size="large" color={styles.sectionTitle.color as string} />
        <CustomTextField styles={styles.loadingText} title={t('bizAnalytics.loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizAnalytics.title')}
        customHeaderStyles={headerStyles}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Time Period Selector */}
        <TimePeriodSelector
          options={TIME_PERIOD_OPTIONS}
          selectedPeriod={selectedPeriod}
          onSelect={onSelectPeriod}
          styles={timePeriodPillStyles}
        />

        {/* Comparison Toggle */}
        <View style={comparisonToggleStyles.container}>
          <CustomTextField styles={comparisonToggleStyles.label} title={t('bizAnalytics.comparePrevious')} />
          <Switch
            value={showComparison}
            onValueChange={onToggleComparison}
            trackColor={comparisonToggleStyles.switchTrackColor}
            thumbColor={comparisonToggleStyles.switchThumbColor}
            ios_backgroundColor={comparisonToggleStyles.switchIosBackgroundColor}
          />
        </View>

        {/* Overview Metrics */}
        <View style={styles.metricsGrid}>
          <CustomTextField styles={styles.sectionTitle} title={t('bizAnalytics.overview')} />
          {overviewMetrics.length >= 2 && (
            <View style={styles.metricsRow}>
              <OverviewMetricCard metric={overviewMetrics[0]} styles={metricCardStyles} />
              <OverviewMetricCard metric={overviewMetrics[1]} styles={metricCardStyles} />
            </View>
          )}
          {overviewMetrics.length >= 4 && (
            <View style={styles.metricsRow}>
              <OverviewMetricCard metric={overviewMetrics[2]} styles={metricCardStyles} />
              <OverviewMetricCard metric={overviewMetrics[3]} styles={metricCardStyles} />
            </View>
          )}
          {overviewMetrics.length >= 5 && (
            <View style={styles.metricsRow}>
              <OverviewMetricCard metric={overviewMetrics[4]} styles={metricCardStyles} />
              <View style={{ flex: 1 }} />
            </View>
          )}
        </View>

        {/* Impressions Over Time Chart */}
        {impressionsChartData.length > 0 && (
          <View style={chartSectionStyles.container}>
            <CustomTextField styles={styles.sectionTitle} title={t('bizAnalytics.impressionsOverTime')} />
            <BarChart data={impressionsChartData} styles={chartSectionStyles} />
          </View>
        )}

        {/* Swipes By Day Chart */}
        {swipesByDayData.length > 0 && (
          <View style={chartSectionStyles.container}>
            <CustomTextField styles={styles.sectionTitle} title={t('bizAnalytics.swipesByDay')} />
            <BarChart
              data={swipesByDayData}
              styles={chartSectionStyles}
              accentColor={chartSectionStyles.lineDot.backgroundColor as string}
            />
          </View>
        )}

        {/* Activity Breakdown Table */}
        {activityBreakdown.length > 0 && (
          <View style={styles.sectionContainer}>
            <ActivityTable items={activityBreakdown} styles={activityRowStyles} />
          </View>
        )}

        {/* Deal Performance */}
        {dealPerformance.length > 0 && (
          <View style={styles.sectionContainer}>
            <CustomTextField styles={styles.sectionTitle} title={t('bizAnalytics.dealPerformance')} />
            {dealPerformance.map((deal) => (
              <DealCard key={deal.id} deal={deal} styles={dealCardStyles} />
            ))}
          </View>
        )}

        {/* Audience Insights (Premium Locked) */}
        {!isPremium && (
          <View style={styles.sectionContainer}>
            <LockedAudience
              styles={lockedSectionStyles}
              upgradeButtonStyles={upgradeButtonStyles}
              onUpgrade={onUpgrade}
            />
          </View>
        )}

        {/* Export CSV */}
        <View style={styles.sectionContainer}>
          <CustomButton
            styles={exportButtonStyles}
            title={t('bizAnalytics.exportCsv')}
            onPress={onExportCsv}
            leftIcon={(iconProps) => <Download size={EXPORT_ICON_SIZE} color={iconProps.color} />}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
