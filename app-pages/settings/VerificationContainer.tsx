/**
 * Main container for the Verification route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import {
  CreditCard,
  Camera,
  ClipboardCheck,
  Check,
  Upload,
  ImageIcon,
  ShieldCheck,
  Lock,
  Clock,
  AlertTriangle,
  Scan,
} from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import {
  useVerificationStyles,
  type StepIndicatorStyles,
  type InfoCardStyles,
  type UploadAreaStyles,
  type StatusCardStyles,
  type SuccessCardStyles,
  type FailureCardStyles,
} from './VerificationStyles';
import { useVerification, type StepInfo, type VerificationStep } from './VerificationFunc';
import { VerificationProps } from '@/app/settings/verification';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Constants ──

const STEP_ICON_SIZE = 16;
const INFO_ICON_SIZE = 14;
const STATUS_ICON_SIZE = 28;
const BADGE_ICON_SIZE = 36;
const PLACEHOLDER_ICON_SIZE = 40;
const PRIVACY_ICON_SIZE = 14;

// ── Sub-components ──

interface StepIndicatorProps {
  styles: StepIndicatorStyles;
  steps: StepInfo[];
  currentStep: VerificationStep;
  currentStepNumber: number;
}

function StepIndicator(props: StepIndicatorProps): ReactNode {
  function getStepIcon(step: VerificationStep, isCompleted: boolean, isActive: boolean): ReactNode {
    const iconColor = isCompleted
      ? props.styles.stepCircleCompletedIconColor
      : isActive
        ? props.styles.stepCircleActiveIconColor
        : props.styles.stepCircleIconColor;

    if (isCompleted) {
      return (
        <View style={{ width: STEP_ICON_SIZE, height: STEP_ICON_SIZE }}>
          <Check size={STEP_ICON_SIZE} color={iconColor} />
        </View>
      );
    }

    switch (step) {
      case 'uploadId':
        return (
          <View style={{ width: STEP_ICON_SIZE, height: STEP_ICON_SIZE }}>
            <CreditCard size={STEP_ICON_SIZE} color={iconColor} />
          </View>
        );
      case 'selfie':
        return (
          <View style={{ width: STEP_ICON_SIZE, height: STEP_ICON_SIZE }}>
            <Camera size={STEP_ICON_SIZE} color={iconColor} />
          </View>
        );
      case 'review':
        return (
          <View style={{ width: STEP_ICON_SIZE, height: STEP_ICON_SIZE }}>
            <ClipboardCheck size={STEP_ICON_SIZE} color={iconColor} />
          </View>
        );
    }
  }

  return (
    <View style={props.styles.container}>
      <View style={props.styles.stepRow}>
        {props.steps.map((step, index) => {
          const isActive = step.key === props.currentStep;
          const isCompleted = step.stepNumber < props.currentStepNumber;

          return (
            <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={props.styles.stepItem}>
                <View
                  style={[
                    props.styles.stepCircle,
                    isActive && props.styles.stepCircleActive,
                    isCompleted && props.styles.stepCircleCompleted,
                  ]}
                >
                  {getStepIcon(step.key, isCompleted, isActive)}
                </View>
                <CustomTextField
                  styles={isActive || isCompleted ? props.styles.stepLabelActive : props.styles.stepLabel}
                  title={step.label}
                />
              </View>
              {index < props.steps.length - 1 && (
                <View
                  style={[
                    props.styles.stepLine,
                    isCompleted && props.styles.stepLineCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface InfoSectionProps {
  styles: InfoCardStyles;
}

function InfoSection(props: InfoSectionProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.title} title={t('verification.whatsNeeded')} />
      <View style={props.styles.requirementRow}>
        <View style={props.styles.requirementIconContainer}>
          <View style={{ width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }}>
            <CreditCard size={INFO_ICON_SIZE} color={props.styles.requirementIconColor} />
          </View>
        </View>
        <CustomTextField styles={props.styles.requirementText} title={t('verification.requirementId')} />
      </View>
      <View style={props.styles.requirementRow}>
        <View style={props.styles.requirementIconContainer}>
          <View style={{ width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }}>
            <Scan size={INFO_ICON_SIZE} color={props.styles.requirementIconColor} />
          </View>
        </View>
        <CustomTextField styles={props.styles.requirementText} title={t('verification.requirementSelfie')} />
      </View>
      <View style={props.styles.privacyContainer}>
        <View style={props.styles.privacyIconContainer}>
          <Lock size={PRIVACY_ICON_SIZE} color={props.styles.privacyIconColor} />
        </View>
        <CustomTextField styles={props.styles.privacyText} title={t('verification.privacyNote')} />
      </View>
    </View>
  );
}

interface UploadStepProps {
  styles: UploadAreaStyles;
  buttonStyles: CustomButtonStyles;
  imageUri?: string;
  isIdStep: boolean;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
}

function UploadStep(props: UploadStepProps): ReactNode {
  return (
    <View style={props.styles.container}>
      {props.imageUri != null ? (
        <View style={props.styles.previewContainer}>
          <Image source={{ uri: props.imageUri }} style={props.styles.previewImage} contentFit="cover" />
        </View>
      ) : (
        <View style={props.styles.placeholderContainer}>
          <View style={{ width: PLACEHOLDER_ICON_SIZE, height: PLACEHOLDER_ICON_SIZE }}>
            {props.isIdStep ? (
              <CreditCard size={PLACEHOLDER_ICON_SIZE} color={props.styles.placeholderIconColor} />
            ) : (
              <Camera size={PLACEHOLDER_ICON_SIZE} color={props.styles.placeholderIconColor} />
            )}
          </View>
          <CustomTextField
            styles={props.styles.placeholderText}
            title={props.isIdStep ? t('verification.uploadIdHint') : t('verification.selfieHint')}
          />
        </View>
      )}
      <View style={props.styles.buttonRow}>
        <CustomButton
          styles={props.buttonStyles}
          title={t('verification.fromCamera')}
          onPress={props.onPickFromCamera}
          leftIcon={({ size, color }) => (
            <Camera size={size ?? 18} color={color as string} />
          )}
        />
        {props.isIdStep && (
          <CustomButton
            styles={props.buttonStyles}
            title={t('verification.fromGallery')}
            onPress={props.onPickFromGallery}
            leftIcon={({ size, color }) => (
              <ImageIcon size={size ?? 18} color={color as string} />
            )}
          />
        )}
      </View>
    </View>
  );
}

interface ReviewStatusProps {
  styles: StatusCardStyles;
}

function ReviewStatus(props: ReviewStatusProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <View style={{ width: STATUS_ICON_SIZE, height: STATUS_ICON_SIZE }}>
          <Clock size={STATUS_ICON_SIZE} color={props.styles.iconColor} />
        </View>
      </View>
      <CustomTextField styles={props.styles.title} title={t('verification.reviewTitle')} />
      <CustomTextField styles={props.styles.description} title={t('verification.reviewDescription')} />
      <View style={props.styles.etaContainer}>
        <CustomTextField styles={props.styles.etaText} title={t('verification.reviewEta')} />
      </View>
    </View>
  );
}

interface SuccessStatusProps {
  styles: SuccessCardStyles;
}

function SuccessStatus(props: SuccessStatusProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.badgeContainer}>
        <View style={{ width: BADGE_ICON_SIZE, height: BADGE_ICON_SIZE }}>
          <ShieldCheck size={BADGE_ICON_SIZE} color={props.styles.badgeIconColor} />
        </View>
      </View>
      <CustomTextField styles={props.styles.title} title={t('verification.successTitle')} />
      <CustomTextField styles={props.styles.description} title={t('verification.successDescription')} />
    </View>
  );
}

interface FailureStatusProps {
  styles: FailureCardStyles;
}

function FailureStatus(props: FailureStatusProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <View style={{ width: STATUS_ICON_SIZE, height: STATUS_ICON_SIZE }}>
          <AlertTriangle size={STATUS_ICON_SIZE} color={props.styles.iconColor} />
        </View>
      </View>
      <CustomTextField styles={props.styles.title} title={t('verification.failedTitle')} />
      <CustomTextField styles={props.styles.description} title={t('verification.failedDescription')} />
    </View>
  );
}

// ── Main component ──

export default function VerificationContainer(props: VerificationProps): ReactNode {
  const {
    styles,
    headerStyles,
    stepIndicatorStyles,
    infoCardStyles,
    uploadAreaStyles,
    statusCardStyles,
    successCardStyles,
    failureCardStyles,
    primaryButtonStyles,
    secondaryButtonStyles,
    uploadButtonStyles,
  } = useVerificationStyles();

  const {
    isLoading,
    isSubmitting,
    verificationStatus,
    currentStep,
    steps,
    currentStepNumber,
    idDocumentUri,
    selfieUri,
    onPickIdFromCamera,
    onPickIdFromGallery,
    onCaptureSelfie,
    onNextStep,
    onSubmitVerification,
    onRetry,
    onDone,
    onGoBack,
  } = useVerification(props);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CustomHeader
            showBackButton
            onGoBack={onGoBack}
            title={t('verification.title')}
            customHeaderStyles={headerStyles}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryButtonStyles.text.color} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Determine which content to show based on verification status
  const isVerified = verificationStatus === 'VERIFIED';
  const isFailed = verificationStatus === 'FAILED';
  const isPending = verificationStatus === 'PENDING';
  const isNotStarted = verificationStatus === 'NOT_STARTED';

  // Determine bottom button
  function renderBottomActions(): ReactNode {
    if (isVerified) {
      return (
        <View style={styles.bottomSection}>
          <CustomButton
            styles={primaryButtonStyles}
            title={t('verification.done')}
            onPress={onDone}
          />
        </View>
      );
    }

    if (isFailed) {
      return (
        <View style={styles.bottomSection}>
          <CustomButton
            styles={primaryButtonStyles}
            title={t('verification.retry')}
            onPress={onRetry}
          />
          <CustomButton
            styles={secondaryButtonStyles}
            title={t('verification.cancel')}
            onPress={onGoBack}
          />
        </View>
      );
    }

    if (isPending) {
      return (
        <View style={styles.bottomSection}>
          <CustomButton
            styles={secondaryButtonStyles}
            title={t('verification.done')}
            onPress={onGoBack}
          />
        </View>
      );
    }

    // NOT_STARTED flow steps
    if (currentStep === 'uploadId') {
      return (
        <View style={styles.bottomSection}>
          <CustomButton
            styles={primaryButtonStyles}
            title={t('verification.next')}
            onPress={onNextStep}
            disabled={idDocumentUri == null}
          />
        </View>
      );
    }

    if (currentStep === 'selfie') {
      return (
        <View style={styles.bottomSection}>
          <CustomButton
            styles={primaryButtonStyles}
            title={t('verification.submit')}
            onPress={onSubmitVerification}
            disabled={selfieUri == null}
            isLoading={isSubmitting}
          />
        </View>
      );
    }

    return undefined;
  }

  function renderStepContent(): ReactNode {
    if (isVerified) {
      return <SuccessStatus styles={successCardStyles} />;
    }

    if (isFailed) {
      return <FailureStatus styles={failureCardStyles} />;
    }

    if (isPending) {
      return <ReviewStatus styles={statusCardStyles} />;
    }

    // NOT_STARTED flow
    if (currentStep === 'uploadId') {
      return (
        <View style={styles.stepContentContainer}>
          <CustomTextField styles={styles.stepTitle} title={t('verification.uploadIdTitle')} />
          <CustomTextField styles={styles.stepHint} title={t('verification.uploadIdHint')} />
          <UploadStep
            styles={uploadAreaStyles}
            buttonStyles={uploadButtonStyles}
            imageUri={idDocumentUri}
            isIdStep
            onPickFromCamera={onPickIdFromCamera}
            onPickFromGallery={onPickIdFromGallery}
          />
        </View>
      );
    }

    if (currentStep === 'selfie') {
      return (
        <View style={styles.stepContentContainer}>
          <CustomTextField styles={styles.stepTitle} title={t('verification.selfieTitle')} />
          <CustomTextField styles={styles.stepHint} title={t('verification.selfieHint')} />
          <UploadStep
            styles={uploadAreaStyles}
            buttonStyles={uploadButtonStyles}
            imageUri={selfieUri}
            isIdStep={false}
            onPickFromCamera={onCaptureSelfie}
            onPickFromGallery={onCaptureSelfie}
          />
        </View>
      );
    }

    return undefined;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          showBackButton
          onGoBack={onGoBack}
          title={t('verification.title')}
          customHeaderStyles={headerStyles}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Subtitle */}
          {isNotStarted && (
            <View style={styles.sectionContainer}>
              <CustomTextField styles={styles.stepHint} title={t('verification.subtitle')} />
            </View>
          )}

          {/* Step Progress Indicator */}
          {isNotStarted && (
            <StepIndicator
              styles={stepIndicatorStyles}
              steps={steps}
              currentStep={currentStep}
              currentStepNumber={currentStepNumber}
            />
          )}

          {/* Info Card - only on first step */}
          {isNotStarted && currentStep === 'uploadId' && (
            <View style={styles.sectionContainer}>
              <InfoSection styles={infoCardStyles} />
            </View>
          )}

          {/* Step Content / Status */}
          <View style={styles.sectionContainer}>
            {renderStepContent()}
          </View>

          {/* Bottom Actions */}
          {renderBottomActions()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
