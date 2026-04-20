/**
 * Main container for the Preferences route (Steps 2 and 3 of 3)
 */

import { type ReactNode, useRef } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import type { ActivityCategory } from '@shared/generated-db-types';
import { usePreferencesStyles, type ProgressDotsStyles, type InterestPillStyles, type OtpInputStyles } from './PreferencesStyles';
import { usePreferences, type InterestItem } from './PreferencesFunc';
import { PreferencesProps } from '@/app/onboarding/preferences';

const okHandIllustration = require('@/assets/images/ok-hand-illustration.png');

interface ProgressDotsProps {
  styles: ProgressDotsStyles;
  currentStep: number;
  totalSteps: number;
}

function ProgressDots(props: ProgressDotsProps): ReactNode {
  const dots = [];
  for (let i = 1; i <= props.totalSteps; i++) {
    dots.push(
      <View
        key={i}
        style={[props.styles.dot, i === props.currentStep ? props.styles.activeDot : undefined]}
      />,
    );
  }
  return <View style={props.styles.container}>{dots}</View>;
}

interface InterestPillProps {
  item: InterestItem;
  isSelected: boolean;
  styles: InterestPillStyles;
  onPress: (id: ActivityCategory) => void;
}

function InterestPill(props: InterestPillProps): ReactNode {
  function onPillPress(): void {
    props.onPress(props.item.id);
  }

  return (
    <Pressable
      onPress={onPillPress}
      style={[props.styles.pill, props.isSelected ? props.styles.pillSelected : undefined]}
    >
      <Text style={[props.styles.pillText, props.isSelected ? props.styles.pillTextSelected : undefined]}>
        {props.item.label}
      </Text>
    </Pressable>
  );
}

interface OtpInputProps {
  styles: OtpInputStyles;
  code: string;
  onCodeChange: (code: string) => void;
}

function OtpInput(props: OtpInputProps): ReactNode {
  const inputRef = useRef<TextInput>(null);

  function onContainerPress(): void {
    inputRef.current?.focus();
  }

  const boxes = [];
  for (let i = 0; i < 6; i++) {
    const digit = props.code[i] ?? '';
    const isActive = i === props.code.length;
    boxes.push(
      <View
        key={i}
        style={[props.styles.box, isActive ? props.styles.boxActive : undefined]}
      >
        <Text style={props.styles.boxText}>{digit}</Text>
      </View>,
    );
  }

  return (
    <Pressable onPress={onContainerPress}>
      <View style={props.styles.container}>
        {boxes}
      </View>
      <TextInput
        ref={inputRef}
        style={props.styles.hiddenInput}
        value={props.code}
        onChangeText={props.onCodeChange}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
    </Pressable>
  );
}

export default function PreferencesContainer(props: PreferencesProps): ReactNode {
  const { styles, progressDotsStyles, interestPillStyles, otpInputStyles, continueButtonStyles } =
    usePreferencesStyles();
  const {
    isLoading,
    phase,
    currentStep,
    totalSteps,
    interests,
    selectedIds,
    isInterestsContinueEnabled,
    phoneNumber,
    otpCode,
    isOtpComplete,
    resendCountdownInSec,
    canResend,
    showAutoFillMessage,
    onToggleInterest,
    onContinueInterests,
    onOtpChange,
    onResendCode,
    onVerifyAndStart,
  } = usePreferences(props);

  if (phase === 'otp') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Progress Dots */}
          <View style={styles.headerContainer}>
            <ProgressDots styles={progressDotsStyles} currentStep={currentStep} totalSteps={totalSteps} />
          </View>

          {/* Title */}
          <View style={styles.pageTitleSection}>
            <CustomTextField styles={styles.title} title={t('onboarding.verifyPhone.title')} />
            <CustomTextField
              styles={styles.subtitle}
              title={phoneNumber.length > 0 ? t('onboarding.verifyPhone.subtitleWithPhone', { phone: phoneNumber }) : t('onboarding.verifyPhone.subtitle')}
            />
          </View>

          {/* OTP Input */}
          <View style={styles.otpSection}>
            {showAutoFillMessage && (
              <Text style={styles.autoFillMessage}>Code received automatically ✓</Text>
            )}
            <OtpInput
              styles={otpInputStyles}
              code={otpCode}
              onCodeChange={onOtpChange}
            />

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <Pressable onPress={onResendCode}>
                  <Text style={styles.resendText}>{t('onboarding.verifyPhone.resendCode')}</Text>
                </Pressable>
              ) : (
                <Text style={styles.resendTextDisabled}>
                  {t('onboarding.verifyPhone.resendIn', { seconds: String(resendCountdownInSec) })}
                </Text>
              )}
            </View>
          </View>

          {/* Verify Button */}
          <View style={styles.bottomSection}>
            <CustomButton
              styles={continueButtonStyles}
              title={t('onboarding.verifyPhone.verifyButton')}
              onPress={onVerifyAndStart}
              disabled={!isOtpComplete || isLoading}
              isLoading={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Progress Dots */}
        <View style={styles.headerContainer}>
          <ProgressDots styles={progressDotsStyles} currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        {/* Title */}
        <View style={styles.pageTitleSection}>
          <CustomTextField styles={styles.title} title={t('onboarding.preferences.title')} />
          <CustomTextField styles={styles.subtitle} title={t('onboarding.preferences.subtitle')} />
        </View>

        {/* Interest Pills Grid */}
        <View style={styles.interestGrid}>
          {interests.map((item) => (
            <InterestPill
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              styles={interestPillStyles}
              onPress={onToggleInterest}
            />
          ))}
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image source={okHandIllustration} style={styles.illustration} />
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <CustomButton
            styles={continueButtonStyles}
            title={t('onboarding.profileSetup.continueButton')}
            onPress={onContinueInterests}
            disabled={!isInterestsContinueEnabled || isLoading}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
