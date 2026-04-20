/**
 * Main container for the Dashboard route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Pressable, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Store,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Users,
  Ticket,
  Heart,
  AlertTriangle,
  Info,
  BarChart3,
  Sparkles,
  Landmark,
  CreditCard,
  Lock,
  Send,
} from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import {
  useDashboardStyles,
  type MetricCardStyles,
  type PromotionCardStyles,
  type FeedItemStyles,
  type AlertItemStyles,
  type UpgradePromptStyles,
  type VenueIdentityStyles,
} from './DashboardStyles';
import {
  useDashboard,
  type MetricItem,
  type PromotionItem,
  type ActivityFeedItem,
  type AlertItem,
  type FeedEventType,
} from './DashboardFunc';

import { DashboardProps } from '@/app/business/dashboard';
import { t } from '@/i18n';

// ── Constants ──

// Earnings section constants
const EARNINGS_TOTAL = '$284.50';
const EARNINGS_REDEMPTIONS = 'from 97 deal redemptions';
const EARNINGS_COMMISSION_LABEL = 'Planet takes 15% · You keep 85%';
const EARNINGS_PROGRESS_PERCENT = 68;
const PAYOUT_AVAILABLE = '$241.82 available';
const BILLING_PLAN = 'Pro Plan · $49/mo';
const UPGRADE_GRADIENT_COLORS: [string, string] = ['#FF5C4D', '#FF9A3C'];
const UPGRADE_GRADIENT_START = { x: 0, y: 0 };
const UPGRADE_GRADIENT_END = { x: 1, y: 1 };
const PAYMENT_ICON_SIZE = 24;

// Planet Insights AI constants
const AI_SPARKLE_SIZE = 16;
const AI_LOCK_SIZE = 20;
const AI_SEND_SIZE = 18;
const AI_BUTTON_SPARKLE_SIZE = 18;
const AI_BOTTOM_SHEET_SPARKLE_SIZE = 20;
const AI_RESPONSE_SPARKLE_SIZE = 12;
const AI_DUMMY_RESPONSE =
  'Based on your last 30 days, groups in your area boost activities most on Friday and Saturday between 7PM and 10PM. Your Trivia Night card gets 40% fewer boosts than similar venues — adding a deal of $3–$5 per person could increase your ranking by an estimated 2.4x. I recommend launching a limited deal this Friday at 6PM.';
const AI_QUESTION_CHIPS = [
  'When should I run deals?',
  'Why is my card underperforming?',
  'What deal amount works best?',
] as const;


const LOGO_ICON_SIZE = 28;
const BADGE_ICON_SIZE = 14;
const TREND_ICON_SIZE = 14;
const FEED_ICON_SIZE = 16;
const ALERT_ICON_SIZE = 18;
const UPGRADE_ICON_SIZE = 20;

// ── Sub-components ──

interface VenueIdentityProps {
  name: string;
  logoUrl?: string;
  isVerified: boolean;
  styles: VenueIdentityStyles;
}

function VenueIdentity(props: VenueIdentityProps): ReactNode {
  return (
    <View style={props.styles.container}>
      {props.logoUrl ? (
        <View style={props.styles.logoContainer}>
          <Image
            source={{ uri: props.logoUrl }}
            style={props.styles.logo}
            contentFit="cover"
          />
        </View>
      ) : (
        <View style={props.styles.logoPlaceholder}>
          <Store size={LOGO_ICON_SIZE} color={props.styles.badgeText.color as string} />
        </View>
      )}
      <View style={props.styles.infoContainer}>
        <CustomTextField styles={props.styles.name} title={props.name} />
        <View style={props.styles.badgeRow}>
          {props.isVerified ? (
            <>
              <View style={props.styles.badgeIconWrapper}>
                <CheckCircle size={BADGE_ICON_SIZE} color={props.styles.badgeText.color as string} />
              </View>
              <CustomTextField styles={props.styles.badgeText} title={t('bizDashboard.verified')} />
            </>
          ) : (
            <CustomTextField styles={props.styles.unverifiedText} title={t('bizDashboard.unverified')} />
          )}
        </View>
      </View>
    </View>
  );
}

interface MetricCardProps {
  metric: MetricItem;
  styles: MetricCardStyles;
  onPress: () => void;
}

function MetricCard(props: MetricCardProps): ReactNode {
  const trendText = `${props.metric.trendDirection === 'down' ? '-' : '+'}${props.metric.trendPercentage}%`;
  const trendStyle =
    props.metric.trendDirection === 'up'
      ? props.styles.trendTextUp
      : props.metric.trendDirection === 'down'
        ? props.styles.trendTextDown
        : props.styles.trendTextFlat;

  return (
    <Pressable style={props.styles.container} onPress={props.onPress}>
      <CustomTextField styles={props.styles.value} title={props.metric.formattedValue} />
      <CustomTextField styles={props.styles.label} title={t(props.metric.translationKey)} />
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
    </Pressable>
  );
}

interface PromotionCardComponentProps {
  promotion: PromotionItem;
  styles: PromotionCardStyles;
}

function PromotionCard(props: PromotionCardComponentProps): ReactNode {
  const budgetStyle = props.promotion.isLowBudget
    ? props.styles.budgetTextLow
    : props.styles.budgetText;

  return (
    <View style={props.styles.container}>
      <View style={props.styles.badgeRow}>
        <View style={props.styles.badge}>
          <CustomTextField styles={props.styles.badgeText} title={t('bizDashboard.boosted')} />
        </View>
        {props.promotion.isLowBudget && (
          <View style={props.styles.lowBudgetBadge}>
            <CustomTextField styles={props.styles.lowBudgetBadgeText} title={t('bizDashboard.promotionBudgetLow')} />
          </View>
        )}
      </View>
      <CustomTextField styles={props.styles.title} title={props.promotion.activityTitle} />
      <View style={props.styles.detailsRow}>
        <CustomTextField
          styles={props.styles.detailText}
          title={t('bizDashboard.promotionImpressions', { count: String(props.promotion.impressions) })}
        />
        <CustomTextField
          styles={budgetStyle}
          title={t('bizDashboard.budgetRemaining', { amount: String(props.promotion.budgetRemainingInDollars) })}
        />
      </View>
    </View>
  );
}

function getFeedIconColor(eventType: FeedEventType, styles: FeedItemStyles): string {
  switch (eventType) {
    case 'group_interest':
      return styles.groupInterestIconColor;
    case 'deal_redeemed':
      return styles.dealRedeemedIconColor;
    case 'super_like':
      return styles.superLikeIconColor;
  }
}

function getFeedIconWrapperStyle(eventType: FeedEventType, styles: FeedItemStyles): object[] {
  switch (eventType) {
    case 'group_interest':
      return [styles.iconWrapper, styles.groupInterestIconWrapper];
    case 'deal_redeemed':
      return [styles.iconWrapper, styles.dealRedeemedIconWrapper];
    case 'super_like':
      return [styles.iconWrapper, styles.superLikeIconWrapper];
  }
}

function getFeedIcon(eventType: FeedEventType, color: string): ReactNode {
  switch (eventType) {
    case 'group_interest':
      return <Users size={FEED_ICON_SIZE} color={color} />;
    case 'deal_redeemed':
      return <Ticket size={FEED_ICON_SIZE} color={color} />;
    case 'super_like':
      return <Heart size={FEED_ICON_SIZE} color={color} />;
  }
}

interface FeedItemComponentProps {
  item: ActivityFeedItem;
  styles: FeedItemStyles;
}

function FeedItemCard(props: FeedItemComponentProps): ReactNode {
  const iconColor = getFeedIconColor(props.item.eventType, props.styles);
  const wrapperStyle = getFeedIconWrapperStyle(props.item.eventType, props.styles);

  return (
    <View style={props.styles.container}>
      <View style={wrapperStyle}>
        {getFeedIcon(props.item.eventType, iconColor)}
      </View>
      <View style={props.styles.contentContainer}>
        <CustomTextField styles={props.styles.description} title={props.item.description} />
        <CustomTextField styles={props.styles.timeAgo} title={props.item.timeAgo} />
      </View>
    </View>
  );
}

interface AlertItemComponentProps {
  alert: AlertItem;
  styles: AlertItemStyles;
}

function AlertItemCard(props: AlertItemComponentProps): ReactNode {
  const containerStyle = [
    props.styles.container,
    props.alert.severity === 'warning' ? props.styles.warningContainer : props.styles.infoContainer,
  ];
  const iconColor =
    props.alert.severity === 'warning'
      ? props.styles.warningIconColor
      : props.styles.infoIconColor;

  return (
    <View style={containerStyle}>
      <View style={props.styles.iconWrapper}>
        {props.alert.severity === 'warning' ? (
          <AlertTriangle size={ALERT_ICON_SIZE} color={iconColor} />
        ) : (
          <Info size={ALERT_ICON_SIZE} color={iconColor} />
        )}
      </View>
      <CustomTextField styles={props.styles.message} title={props.alert.message} />
    </View>
  );
}

interface UpgradePromptComponentProps {
  styles: UpgradePromptStyles;
  buttonStyles: CustomButtonStyles;
  onUpgrade: () => void;
}

function UpgradePrompt(props: UpgradePromptComponentProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconWrapper}>
        <Sparkles size={UPGRADE_ICON_SIZE} color={props.styles.iconColor} />
      </View>
      <View style={props.styles.textContainer}>
        <CustomTextField styles={props.styles.title} title={t('bizDashboard.upgradeBannerTitle')} />
        <CustomTextField styles={props.styles.description} title={t('bizDashboard.upgradeBannerDescription')} />
      </View>
      <CustomButton
        styles={props.buttonStyles}
        title={t('bizDashboard.upgradeButton')}
        onPress={props.onUpgrade}
      />
    </View>
  );
}

// ── Earnings sub-components ──

interface EarningsSectionProps {
  onRequestPayout: () => void;
  onManageBilling: () => void;
  onSeeProPlans: () => void;
}

function EarningsSection(props: EarningsSectionProps): ReactNode {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
      {/* Section label */}
      <CustomTextField
        styles={{
          fontFamily: 'tt-autonomous-mono',
          fontSize: 11,
          color: 'rgba(255, 245, 236, 0.4)',
          letterSpacing: 11 * 0.1,
          marginBottom: 10,
        }}
        title="EARNINGS"
      />

      {/* Main earnings card */}
      <View
        style={{
          backgroundColor: '#243660',
          borderRadius: 20,
          padding: 14,
          marginBottom: 10,
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: 'rgba(255, 245, 236, 0.5)' }}
            title="This Month"
          />
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: '#FF5C4D' }}
            title="View All"
          />
        </View>
        {/* Total earnings */}
        <CustomTextField
          styles={{ fontFamily: 'comba', fontSize: 36, color: '#CFFF47', textAlign: 'center', lineHeight: 42 }}
          title={EARNINGS_TOTAL}
        />
        {/* Redemptions subtitle */}
        <CustomTextField
          styles={{
            fontFamily: 'tt-autonomous-mono',
            fontSize: 13,
            color: 'rgba(255, 245, 236, 0.6)',
            textAlign: 'center',
            marginTop: 4,
          }}
          title={EARNINGS_REDEMPTIONS}
        />
        {/* Progress bar */}
        <View
          style={{
            height: 6,
            backgroundColor: '#3a4a6b',
            borderRadius: 3,
            marginTop: 12,
            marginBottom: 8,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: 6,
              backgroundColor: '#CFFF47',
              borderRadius: 3,
              width: `${EARNINGS_PROGRESS_PERCENT}%`,
            }}
          />
        </View>
        {/* Commission label */}
        <CustomTextField
          styles={{
            fontFamily: 'tt-autonomous-mono',
            fontSize: 11,
            color: 'rgba(255, 245, 236, 0.4)',
            textAlign: 'center',
          }}
          title={EARNINGS_COMMISSION_LABEL}
        />
      </View>

      {/* Two payment action cards */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        {/* Payout card */}
        <View style={{ flex: 1, backgroundColor: '#243660', borderRadius: 16, padding: 12, alignItems: 'center' }}>
          <Landmark size={PAYMENT_ICON_SIZE} color="#CFFF47" />
          <CustomTextField
            styles={{ fontFamily: 'strenuous', fontSize: 14, fontWeight: '700', color: '#FFF5EC', marginTop: 6, textAlign: 'center' }}
            title="PAYOUT"
          />
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: '#CFFF47', textAlign: 'center', marginTop: 2 }}
            title={PAYOUT_AVAILABLE}
          />
          <Pressable
            style={{
              width: '100%',
              height: 36,
              backgroundColor: '#CFFF47',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
            }}
            onPress={props.onRequestPayout}
          >
            <CustomTextField
              styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 11, fontWeight: '700', color: '#2D2D2D' }}
              title="REQUEST PAYOUT"
            />
          </Pressable>
        </View>

        {/* Billing card */}
        <View style={{ flex: 1, backgroundColor: '#243660', borderRadius: 16, padding: 12, alignItems: 'center' }}>
          <CreditCard size={PAYMENT_ICON_SIZE} color="#FF5C4D" />
          <CustomTextField
            styles={{ fontFamily: 'strenuous', fontSize: 14, fontWeight: '700', color: '#FFF5EC', marginTop: 6, textAlign: 'center' }}
            title="BILLING"
          />
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: '#FF5C4D', textAlign: 'center', marginTop: 2 }}
            title={BILLING_PLAN}
          />
          <Pressable
            style={{
              width: '100%',
              height: 36,
              backgroundColor: '#243660',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FF5C4D',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
            }}
            onPress={props.onManageBilling}
          >
            <CustomTextField
              styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 11, fontWeight: '700', color: '#FF5C4D' }}
              title="MANAGE"
            />
          </Pressable>
        </View>
      </View>

      {/* Upgrade to Pro banner */}
      <LinearGradient
        colors={UPGRADE_GRADIENT_COLORS}
        start={UPGRADE_GRADIENT_START}
        end={UPGRADE_GRADIENT_END}
        style={{ borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}
            title="⚡ PRO"
          />
          <CustomTextField
            styles={{ fontFamily: 'strenuous', fontSize: 13, color: '#FFFFFF', marginTop: 3 }}
            title="Unlock Planet Insights AI + priority placement + unlimited deals"
          />
        </View>
        <Pressable
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 14,
          }}
          onPress={props.onSeeProPlans}
        >
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, fontWeight: '700', color: '#FF5C4D' }}
            title="SEE PLANS"
          />
        </Pressable>
      </LinearGradient>
    </View>
  );
}

interface PaymentToastProps {
  message: string;
}

function PaymentToast(props: PaymentToastProps): ReactNode {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 50,
        left: 24,
        right: 24,
        backgroundColor: '#243660',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        zIndex: 999,
      }}
    >
      <CustomTextField
        styles={{ fontFamily: 'strenuous', fontSize: 14, color: '#FFF5EC', textAlign: 'center' }}
        title={props.message}
      />
    </View>
  );
}

// ── Planet Insights AI sub-components ──

interface InsightRowProps {
  iconEmoji: string;
  title: string;
  description: string;
}

function InsightRow(props: InsightRowProps): ReactNode {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#1B2A4A',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <CustomTextField styles={{ fontSize: 16 }} title={props.iconEmoji} />
      </View>
      <View style={{ flex: 1 }}>
        <CustomTextField
          styles={{ fontFamily: 'strenuous', fontSize: 13, fontWeight: '700', color: '#FFF5EC' }}
          title={props.title}
        />
        <CustomTextField
          styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: 'rgba(255, 245, 236, 0.6)', marginTop: 2 }}
          title={props.description}
        />
      </View>
    </View>
  );
}

interface PlanetInsightsSectionProps {
  onOpenAiBottomSheet: () => void;
}

function PlanetInsightsSection(props: PlanetInsightsSectionProps): ReactNode {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
      {/* Section label row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <CustomTextField
          styles={{
            fontFamily: 'tt-autonomous-mono',
            fontSize: 11,
            color: 'rgba(255, 245, 236, 0.4)',
            letterSpacing: 11 * 0.1,
          }}
          title="PLANET INSIGHTS"
        />
        <View
          style={{
            backgroundColor: '#CFFF47',
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginLeft: 8,
          }}
        >
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 9, fontWeight: '700', color: '#2D2D2D' }}
            title="AI"
          />
        </View>
      </View>

      {/* Insights card */}
      <View style={{ backgroundColor: '#243660', borderRadius: 20, padding: 16, marginBottom: 10 }}>
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Sparkles size={AI_SPARKLE_SIZE} color="#CFFF47" />
          <CustomTextField
            styles={{ fontFamily: 'strenuous', fontSize: 15, fontWeight: '700', color: '#FFF5EC', flex: 1, marginLeft: 8 }}
            title="AI Recommendations"
          />
          <View style={{ backgroundColor: '#FF5C4D', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
            <CustomTextField
              styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 9, fontWeight: '700', color: '#FFF5EC' }}
              title="PRO"
            />
          </View>
        </View>

        {/* Insight 1 */}
        <InsightRow
          iconEmoji="📈"
          title="Peak booking window detected"
          description="Groups are most active Fri 7–9PM. Schedule your best deals here."
        />
        <View style={{ height: 1, backgroundColor: '#3a4a6b' }} />

        {/* Insight 2 */}
        <InsightRow
          iconEmoji="🎯"
          title="Boost your Trivia Night card"
          description="Cards with deals get 3.2x more group boosts. Add a deal to rank higher."
        />
        <View style={{ height: 1, backgroundColor: '#3a4a6b' }} />

        {/* Insight 3 */}
        <InsightRow
          iconEmoji="💰"
          title="Competitor gap opportunity"
          description="No comedy venues are running deals tonight. You could own that category."
        />
        <View style={{ height: 1, backgroundColor: '#3a4a6b' }} />

        {/* Locked 4th row */}
        <View style={{ position: 'relative' }}>
          <View style={{ opacity: 0.4 }}>
            <InsightRow
              iconEmoji="🔥"
              title="Trending category this weekend"
              description="Escape rooms are up 45% in your area. Be the first to run a deal."
            />
          </View>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={AI_LOCK_SIZE} color="#FFF5EC" />
            <CustomTextField
              styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 11, color: 'rgba(255, 245, 236, 0.6)', marginTop: 4 }}
              title="Unlock with Pro"
            />
          </View>
        </View>
      </View>

      {/* ASK PLANET AI button */}
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 48,
          backgroundColor: '#1B2A4A',
          borderWidth: 2,
          borderColor: '#CFFF47',
          borderRadius: 14,
          gap: 8,
        }}
        onPress={props.onOpenAiBottomSheet}
      >
        <Sparkles size={AI_BUTTON_SPARKLE_SIZE} color="#CFFF47" />
        <CustomTextField
          styles={{ fontFamily: 'strenuous', fontSize: 15, fontWeight: '700', color: '#CFFF47' }}
          title="ASK PLANET AI"
        />
      </Pressable>
    </View>
  );
}

interface AskPlanetAIBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAskQuestion: () => void;
}

function AskPlanetAIBottomSheet(props: AskPlanetAIBottomSheetProps): ReactNode {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <Pressable style={{ flex: 1 }} onPress={props.onClose} />
        <View
          style={{
            backgroundColor: '#1a2240',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 40,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: 'rgba(255, 245, 236, 0.2)',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Sparkles size={AI_BOTTOM_SHEET_SPARKLE_SIZE} color="#CFFF47" />
            <CustomTextField
              styles={{ fontFamily: 'strenuous', fontSize: 20, fontWeight: '700', color: '#FFF5EC', marginLeft: 8 }}
              title="Planet Insights AI"
            />
          </View>

          {/* Subtitle */}
          <CustomTextField
            styles={{
              fontFamily: 'tt-autonomous-mono',
              fontSize: 13,
              color: 'rgba(255, 245, 236, 0.6)',
              marginBottom: 16,
            }}
            title="Ask anything about your venue performance"
          />

          {/* Question chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {AI_QUESTION_CHIPS.map((chip) => (
                <Pressable
                  key={chip}
                  onPress={props.onAskQuestion}
                  style={{
                    backgroundColor: '#243660',
                    borderWidth: 1,
                    borderColor: '#3a4a6b',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <CustomTextField
                    styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: '#FFF5EC' }}
                    title={chip}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* AI response */}
          <View style={{ backgroundColor: '#243660', borderRadius: 16, padding: 12, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ marginRight: 8, marginTop: 2 }}>
                <Sparkles size={AI_RESPONSE_SPARKLE_SIZE} color="#CFFF47" />
              </View>
              <CustomTextField
                styles={{ fontFamily: 'strenuous', fontSize: 14, color: '#FFF5EC', flex: 1, lineHeight: 21 }}
                title={AI_DUMMY_RESPONSE}
              />
            </View>
          </View>

          {/* Text input row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#243660',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 14,
                color: '#FFF5EC',
                height: 46,
              }}
              placeholder="Ask about your venue..."
              placeholderTextColor="rgba(255, 245, 236, 0.4)"
            />
            <Pressable
              onPress={props.onAskQuestion}
              style={{
                width: 46,
                height: 46,
                backgroundColor: '#CFFF47',
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={AI_SEND_SIZE} color="#2D2D2D" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main component ──

export default function DashboardContainer(props: DashboardProps): ReactNode {
  const {
    styles,
    headerStyles,
    venueIdentityStyles,
    metricCardStyles,
    promotionCardStyles,
    feedItemStyles,
    alertItemStyles,
    upgradePromptStyles,
    manageActivitiesButtonStyles,
    manageDealsButtonStyles,
    viewAnalyticsButtonStyles,
    upgradeButtonStyles,
  } = useDashboardStyles();

  const {
    isLoading,
    businessName,
    businessLogoUrl,
    isVerified,
    metrics,
    promotions,
    activityFeed,
    alerts,
    isFreeTier,
    onUpgrade,
    onRequestPayout,
    onManageBilling,
    onSeeProPlans,
    paymentToast,
    aiBottomSheetVisible,
    onOpenAiBottomSheet,
    onCloseAiBottomSheet,
    onAskAiQuestion,
  } = useDashboard(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} {...safeAreaProps}>
        <ActivityIndicator size="large" color={styles.sectionTitle.color as string} />
        <CustomTextField styles={styles.loadingText} title={t('bizDashboard.title')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <CustomHeader
        showBackButton
        onGoBack={props.onGoBack}
        title={t('bizDashboard.title')}
        customHeaderStyles={headerStyles}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Venue Identity */}
        <VenueIdentity
          name={businessName}
          logoUrl={businessLogoUrl}
          isVerified={isVerified}
          styles={venueIdentityStyles}
        />

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <CustomTextField styles={styles.sectionTitle} title={t('bizDashboard.metricsTitle')} />
          <View style={styles.metricsRow}>
            <MetricCard metric={metrics[0]} styles={metricCardStyles} onPress={() => props.onNavigateToAnalytics()} />
            <MetricCard metric={metrics[1]} styles={metricCardStyles} onPress={() => props.onNavigateToAnalytics()} />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard metric={metrics[2]} styles={metricCardStyles} onPress={() => props.onNavigateToAnalytics()} />
            <MetricCard metric={metrics[3]} styles={metricCardStyles} onPress={() => props.onNavigateToAnalytics()} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <CustomTextField styles={styles.sectionTitle} title={t('bizDashboard.quickActions')} />
          <View style={styles.quickActionsRow}>
            <CustomButton
              styles={manageActivitiesButtonStyles}
              title={t('bizDashboard.manageActivities')}
              onPress={() => props.onNavigateToActivities()}
              leftIcon={(iconProps) => <Zap size={iconProps.size} color={iconProps.color} />}
            />
            <CustomButton
              styles={manageDealsButtonStyles}
              title={t('bizDashboard.manageDeals')}
              onPress={() => props.onNavigateToDeals()}
              leftIcon={(iconProps) => <Ticket size={iconProps.size} color={iconProps.color} />}
            />
          </View>
          <View style={styles.quickActionsRow}>
            <CustomButton
              styles={viewAnalyticsButtonStyles}
              title={t('bizDashboard.viewAnalytics')}
              onPress={() => props.onNavigateToAnalytics()}
              leftIcon={(iconProps) => <BarChart3 size={iconProps.size} color={iconProps.color} />}
            />
          </View>
        </View>

        {/* Active Promotions */}
        <View style={styles.sectionContainer}>
          <CustomTextField styles={styles.sectionTitle} title={t('bizDashboard.activePromotions')} />
          {promotions.length > 0 ? (
            promotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} styles={promotionCardStyles} />
            ))
          ) : (
            <CustomTextField styles={styles.emptyText} title={t('bizDashboard.noPromotions')} />
          )}
        </View>

        {/* Earnings & Payments */}
        <EarningsSection
          onRequestPayout={onRequestPayout}
          onManageBilling={onManageBilling}
          onSeeProPlans={onSeeProPlans}
        />

        {/* Planet Insights AI */}
        <PlanetInsightsSection onOpenAiBottomSheet={onOpenAiBottomSheet} />

        {/* Recent Activity Feed */}
        <View style={styles.sectionContainer}>
          <CustomTextField styles={styles.sectionTitle} title={t('bizDashboard.recentActivity')} />
          {activityFeed.length > 0 ? (
            activityFeed.map((item) => (
              <FeedItemCard key={item.id} item={item} styles={feedItemStyles} />
            ))
          ) : (
            <CustomTextField styles={styles.emptyText} title={t('bizDashboard.noAlerts')} />
          )}
        </View>

        {/* Alerts */}
        <View style={styles.sectionContainer}>
          <CustomTextField styles={styles.sectionTitle} title={t('bizDashboard.alerts')} />
          {alerts.length > 0 ? (
            alerts.map((alertItem) => (
              <AlertItemCard key={alertItem.id} alert={alertItem} styles={alertItemStyles} />
            ))
          ) : (
            <CustomTextField styles={styles.emptyText} title={t('bizDashboard.noAlerts')} />
          )}
        </View>

        {/* Upgrade Prompt */}
        {isFreeTier && (
          <UpgradePrompt
            styles={upgradePromptStyles}
            buttonStyles={upgradeButtonStyles}
            onUpgrade={onUpgrade}
          />
        )}
      </ScrollView>

      {paymentToast != null && <PaymentToast message={paymentToast} />}
      <AskPlanetAIBottomSheet
        visible={aiBottomSheetVisible}
        onClose={onCloseAiBottomSheet}
        onAskQuestion={onAskAiQuestion}
      />
    </SafeAreaView>
  );
}
