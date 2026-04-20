/**
 * Main container for the Deal route — Deal redemption screen
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Clock,
  Users,
  Tag,
  Maximize2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Compass,
  PartyPopper,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useDealStyles } from './DealStyles';
import { useDeal, type DealDetailData } from './DealFunc';
import { DealProps } from '@/app/activity/[activityId]/deal';
import {
  type DealHeaderStyles,
  type DealCardStyles,
  type CodeSectionStyles,
  type InstructionsSectionStyles,
  type FullScreenOverlayStyles,
  type ConfirmDialogStyles,
  type SuccessStateStyles,
  type TermsSectionStyles,
  type RedeemedBadgeStyles,
} from './DealStyles';

// ── Constants ──

const HERO_GRADIENT_COLORS: [string, string] = ['#FF5C4D', '#FF9A3C'];
const HERO_GRADIENT_START = { x: 0, y: 0 };
const HERO_GRADIENT_END = { x: 0.8, y: 0.6 };
const QR_SIZE = 180;
const FULLSCREEN_QR_SIZE = 260;
const QR_COLOR = '#1B2A4A';
const META_ICON_SIZE = 14;
const STAGGER_DELAY_IN_MS = 100;
const INSTRUCTION_STEPS = [
  t('dealRedeem.instructionStep1'),
  t('dealRedeem.instructionStep2'),
  t('dealRedeem.instructionStep3'),
];

// ── Sub-components ──

interface DealHeaderProps {
  styles: DealHeaderStyles;
  onClose: () => void;
}

function DealHeader(props: DealHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable style={props.styles.closeButton} onPress={props.onClose}>
        <View style={props.styles.closeIcon}>
          <X size={22} color="#FFF5EC" />
        </View>
      </Pressable>
      <View style={props.styles.titleArea}>
        <CustomTextField styles={props.styles.titleText} title={t('dealRedeem.headerTitle')} />
      </View>
      <View style={props.styles.placeholder} />
    </View>
  );
}

interface DealCardComponentProps {
  styles: DealCardStyles;
  deal: DealDetailData;
}

function DealCardComponent(props: DealCardComponentProps): ReactNode {
  const remainingUses = props.deal.totalRedemptionLimit != null
    ? props.deal.totalRedemptionLimit - props.deal.redemptionsUsed
    : undefined;
  const usageRatio = props.deal.totalRedemptionLimit != null
    ? props.deal.redemptionsUsed / props.deal.totalRedemptionLimit
    : 0;

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()}>
      <View style={props.styles.container}>
        <LinearGradient
          colors={HERO_GRADIENT_COLORS}
          start={HERO_GRADIENT_START}
          end={HERO_GRADIENT_END}
          style={props.styles.gradient}
        >
          <View style={props.styles.discountBadge}>
            <CustomTextField styles={props.styles.discountBadgeText} title={props.deal.discountLabel} />
          </View>

          <CustomTextField styles={props.styles.headline} title={props.deal.headline} />
          <CustomTextField styles={props.styles.venueName} title={props.deal.venueName} />

          <View style={props.styles.metaRow}>
            <View style={props.styles.metaItem}>
              <View style={props.styles.metaIconWrapper}>
                <Clock size={META_ICON_SIZE} color={props.styles.metaIconColor} />
              </View>
              <CustomTextField
                styles={props.styles.metaText}
                title={t('dealRedeem.expiresLabel', { date: props.deal.expiryDate })}
              />
            </View>
            <View style={props.styles.metaItem}>
              <View style={props.styles.metaIconWrapper}>
                <Users size={META_ICON_SIZE} color={props.styles.metaIconColor} />
              </View>
              <CustomTextField
                styles={props.styles.metaText}
                title={t('dealRedeem.minGroupSize', { count: props.deal.minGroupSize })}
              />
            </View>
          </View>

          <View style={props.styles.metaRow}>
            <View style={props.styles.metaItem}>
              <View style={props.styles.metaIconWrapper}>
                <Tag size={META_ICON_SIZE} color={props.styles.metaIconColor} />
              </View>
              <CustomTextField
                styles={props.styles.metaText}
                title={t('dealRedeem.perUserLimit', { limit: props.deal.perUserLimit })}
              />
            </View>
            <View style={props.styles.metaItem}>
              <View style={props.styles.metaIconWrapper}>
                <Clock size={META_ICON_SIZE} color={props.styles.metaIconColor} />
              </View>
              <CustomTextField
                styles={props.styles.metaText}
                title={t('dealRedeem.validHours', { hours: props.deal.validHours })}
              />
            </View>
          </View>

          {props.deal.totalRedemptionLimit != null && (
            <>
              <View style={props.styles.divider} />
              <View style={props.styles.usageRow}>
                <CustomTextField
                  styles={props.styles.usageText}
                  title={t('dealRedeem.usageLimitLabel', {
                    used: remainingUses ?? 0,
                    total: props.deal.totalRedemptionLimit,
                  })}
                />
                <View style={props.styles.usageBarTrack}>
                  <View style={[props.styles.usageBarFill, { width: `${usageRatio * 100}%` }]} />
                </View>
              </View>
            </>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

interface CodeSectionComponentProps {
  styles: CodeSectionStyles;
  qrCodeValue: string;
  redemptionCode: string;
}

function CodeSectionComponent(props: CodeSectionComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS).duration(400)}>
      <View style={props.styles.container}>
        <View style={props.styles.qrContainer}>
          <View style={props.styles.qrBackground}>
            <QRCode
              value={props.qrCodeValue}
              size={QR_SIZE}
              color={QR_COLOR}
              backgroundColor="#FFFFFF"
            />
          </View>
        </View>
        <View style={props.styles.codeContainer}>
          <CustomTextField styles={props.styles.codeLabel} title={t('dealRedeem.redemptionCodeLabel')} />
          <CustomTextField styles={props.styles.codeText} title={props.redemptionCode} />
        </View>
      </View>
    </Animated.View>
  );
}

interface InstructionsSectionComponentProps {
  styles: InstructionsSectionStyles;
}

function InstructionsSectionComponent(props: InstructionsSectionComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 2).duration(400)}>
      <View style={props.styles.container}>
        <CustomTextField styles={props.styles.sectionTitle} title={t('dealRedeem.instructionsTitle')} />
        {INSTRUCTION_STEPS.map((step, index) => (
          <View key={index} style={props.styles.stepRow}>
            <View style={props.styles.stepNumber}>
              <CustomTextField styles={props.styles.stepNumberText} title={`${index + 1}`} />
            </View>
            <CustomTextField styles={props.styles.stepText} title={step} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

interface TermsSectionComponentProps {
  styles: TermsSectionStyles;
  termsAndConditions: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function TermsSectionComponent(props: TermsSectionComponentProps): ReactNode {
  const ChevronIcon = props.isExpanded ? ChevronUp : ChevronDown;

  return (
    <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 3).duration(400)}>
      <View style={props.styles.container}>
        <Pressable style={props.styles.header} onPress={props.onToggle}>
          <CustomTextField styles={props.styles.sectionTitle} title={t('dealRedeem.termsTitle')} />
          <View style={props.styles.chevronWrapper}>
            <ChevronIcon size={18} color={props.styles.chevronColor} />
          </View>
        </Pressable>
        {props.isExpanded && (
          <CustomTextField styles={props.styles.termsText} title={props.termsAndConditions} />
        )}
      </View>
    </Animated.View>
  );
}

interface FullScreenOverlayComponentProps {
  styles: FullScreenOverlayStyles;
  qrCodeValue: string;
  redemptionCode: string;
  onClose: () => void;
}

function FullScreenOverlayComponent(props: FullScreenOverlayComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={props.styles.overlay}>
      <Pressable
        style={props.styles.overlay}
        onPress={props.onClose}
      >
        <View style={props.styles.content}>
          <View style={props.styles.qrBackground}>
            <QRCode
              value={props.qrCodeValue}
              size={FULLSCREEN_QR_SIZE}
              color={QR_COLOR}
              backgroundColor="#FFFFFF"
            />
          </View>
          <CustomTextField styles={props.styles.codeText} title={props.redemptionCode} />
          <CustomTextField styles={props.styles.hintText} title={t('dealRedeem.tapToClose')} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface ConfirmDialogComponentProps {
  styles: ConfirmDialogStyles;
  confirmYesButtonStyles: import('@/comp-lib/core/custom-button/CustomButtonStyles').CustomButtonStyles;
  confirmCancelButtonStyles: import('@/comp-lib/core/custom-button/CustomButtonStyles').CustomButtonStyles;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialogComponent(props: ConfirmDialogComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={props.styles.overlay}>
      <View style={props.styles.dialog}>
        <CustomTextField styles={props.styles.title} title={t('dealRedeem.confirmTitle')} />
        <CustomTextField styles={props.styles.message} title={t('dealRedeem.confirmMessage')} />
        <View style={props.styles.buttonRow}>
          <CustomButton
            onPress={props.onCancel}
            title={t('dealRedeem.confirmCancel')}
            styles={props.confirmCancelButtonStyles}
          />
          <CustomButton
            onPress={props.onConfirm}
            title={t('dealRedeem.confirmYes')}
            styles={props.confirmYesButtonStyles}
          />
        </View>
      </View>
    </Animated.View>
  );
}

interface SuccessStateComponentProps {
  styles: SuccessStateStyles;
  redeemedBadgeStyles: RedeemedBadgeStyles;
  backToDiscoverButtonStyles: import('@/comp-lib/core/custom-button/CustomButtonStyles').CustomButtonStyles;
  onDismissToDiscover: () => void;
}

function SuccessStateComponent(props: SuccessStateComponentProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Animated.View entering={ZoomIn.duration(500).springify()}>
        <View style={props.styles.iconContainer}>
          <View style={{ width: 48, height: 48 }}>
            <PartyPopper size={48} color={props.styles.iconColor} />
          </View>
        </View>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <CustomTextField styles={props.styles.title} title={t('dealRedeem.successTitle')} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <CustomTextField styles={props.styles.subtitle} title={t('dealRedeem.successSubtitle')} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <View style={props.redeemedBadgeStyles.container}>
          <CustomTextField styles={props.redeemedBadgeStyles.text} title={t('dealRedeem.redeemedBadge')} />
        </View>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(650).duration(400)} style={{ width: '100%' }}>
        <CustomButton
          onPress={props.onDismissToDiscover}
          title={t('dealRedeem.backToDiscover')}
          styles={props.backToDiscoverButtonStyles}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <Compass size={size ?? 20} color={color as string} />
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

// ── Main Container ──

export default function DealContainer(props: DealProps): ReactNode {
  const {
    styles,
    headerStyles,
    dealCardStyles,
    codeSectionStyles,
    instructionsSectionStyles,
    fullScreenOverlayStyles,
    confirmDialogStyles,
    successStateStyles,
    termsSectionStyles,
    redeemedBadgeStyles,
    showToStaffButtonStyles,
    markRedeemedButtonStyles,
    confirmYesButtonStyles,
    confirmCancelButtonStyles,
    backToDiscoverButtonStyles,
  } = useDealStyles();

  const {
    isLoading,
    deal,
    redemptionState,
    isFullScreenMode,
    isTermsExpanded,
    onToggleFullScreen,
    onRequestRedemption,
    onConfirmRedemption,
    onCancelRedemption,
    onToggleTerms,
    onGoBack,
    onDismissToDiscover,
  } = useDeal(props);

  if (isLoading || deal == null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#CFFF47" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Success State ──
  if (redemptionState === 'redeemed') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <DealHeader styles={headerStyles} onClose={onGoBack} />
          <SuccessStateComponent
            styles={successStateStyles}
            redeemedBadgeStyles={redeemedBadgeStyles}
            backToDiscoverButtonStyles={backToDiscoverButtonStyles}
            onDismissToDiscover={onDismissToDiscover}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <DealHeader styles={headerStyles} onClose={onGoBack} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Deal Card with Hero Gradient */}
          <DealCardComponent styles={dealCardStyles} deal={deal} />

          {/* QR Code & Redemption Code */}
          <CodeSectionComponent
            styles={codeSectionStyles}
            qrCodeValue={deal.qrCodeValue}
            redemptionCode={deal.redemptionCode}
          />

          {/* Show to Staff Button */}
          <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 1.5).duration(400)}>
            <CustomButton
              onPress={onToggleFullScreen}
              title={t('dealRedeem.showToStaff')}
              styles={showToStaffButtonStyles}
              leftIcon={({ size, color }) => (
                <View style={{ width: size, height: size }}>
                  <Maximize2 size={size ?? 20} color={color as string} />
                </View>
              )}
            />
          </Animated.View>

          {/* Mark as Redeemed Button */}
          <Animated.View entering={FadeInDown.delay(STAGGER_DELAY_IN_MS * 2).duration(400)}>
            <CustomButton
              onPress={onRequestRedemption}
              title={t('dealRedeem.markAsRedeemed')}
              styles={markRedeemedButtonStyles}
              leftIcon={({ size, color }) => (
                <View style={{ width: size, height: size }}>
                  <CheckCircle size={size ?? 18} color={color as string} />
                </View>
              )}
            />
          </Animated.View>

          {/* Instructions */}
          <InstructionsSectionComponent styles={instructionsSectionStyles} />

          {/* Collapsible Terms */}
          <TermsSectionComponent
            styles={termsSectionStyles}
            termsAndConditions={deal.termsAndConditions}
            isExpanded={isTermsExpanded}
            onToggle={onToggleTerms}
          />
        </ScrollView>

        {/* Full Screen Overlay */}
        {isFullScreenMode && (
          <FullScreenOverlayComponent
            styles={fullScreenOverlayStyles}
            qrCodeValue={deal.qrCodeValue}
            redemptionCode={deal.redemptionCode}
            onClose={onToggleFullScreen}
          />
        )}

        {/* Confirmation Dialog */}
        {redemptionState === 'confirming' && (
          <ConfirmDialogComponent
            styles={confirmDialogStyles}
            confirmYesButtonStyles={confirmYesButtonStyles}
            confirmCancelButtonStyles={confirmCancelButtonStyles}
            onConfirm={onConfirmRedemption}
            onCancel={onCancelRedemption}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
