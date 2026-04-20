/**
 * Main container for the ProfileSetup route (Step 1 of 3)
 */

import { type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';

import { useResponsiveDesign } from '@/comp-lib/styles/useResponsiveDesign';
import { t } from '@/i18n';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { KeyboardAvoidingWrapper } from '@/comp-lib/keyboard-avoiding-wrapper/KeyboardAvoidingWrapper';
import { useProfileSetupStyles, type AvatarPickerStyles, type ProgressDotsStyles, type PhoneLabelStyles } from './ProfileSetupStyles';
import { useProfileSetup } from './ProfileSetupFunc';
import { ProfileSetupProps } from '@/app/onboarding/profile-setup';

const CAMERA_ICON_SIZE = 28;
const CAMERA_BADGE_ICON_SIZE = 14;

interface AvatarPickerProps {
  styles: AvatarPickerStyles;
  avatarUri?: string;
  onPress: () => void;
}

function AvatarPicker(props: AvatarPickerProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable onPress={props.onPress}>
        <View style={props.avatarUri != null ? props.styles.imageContainer : undefined}>
          {props.avatarUri != null ? (
            <Image source={{ uri: props.avatarUri }} style={props.styles.image} />
          ) : (
            <View style={props.styles.placeholderContainer}>
              <View style={props.styles.placeholderIconWrapper}>
                <Camera size={CAMERA_ICON_SIZE} color={props.styles.placeholderIconColor} />
              </View>
            </View>
          )}
        </View>
        <View style={props.styles.cameraBadge}>
          <View style={props.styles.cameraBadgeIconWrapper}>
            <Camera size={CAMERA_BADGE_ICON_SIZE} color={props.styles.cameraBadgeIconColor} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

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

export default function ProfileSetupContainer(props: ProfileSetupProps): ReactNode {
  const { styles, avatarPickerStyles, progressDotsStyles, textInputStyles, phoneInputStyles, phoneLabelStyles, continueButtonStyles } =
    useProfileSetupStyles();
  const {
    isLoading,
    avatarUri,
    firstName,
    lastName,
    username,
    phoneNumber,
    phoneError,
    currentStep,
    totalSteps,
    isFormValid,
    onPickFromGallery,
    onFirstNameChange,
    onLastNameChange,
    onUsernameChange,
    onPhoneNumberChange,
    onHandleSubmit,
  } = useProfileSetup(props);

  const { isPlatformWeb } = useResponsiveDesign();

  const ScrollWrapper = isPlatformWeb ? ScrollView : KeyboardAvoidingWrapper;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollWrapper>
        <View style={styles.container}>
          {/* Progress Dots */}
          <View style={styles.headerContainer}>
            <ProgressDots styles={progressDotsStyles} currentStep={currentStep} totalSteps={totalSteps} />
          </View>

          {/* Title */}
          <View style={styles.pageTitleSection}>
            <CustomTextField styles={styles.title} title={t('onboarding.profileSetup.title')} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <AvatarPicker
              styles={avatarPickerStyles}
              avatarUri={avatarUri}
              onPress={onPickFromGallery}
            />
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <CustomTextInput
              styles={textInputStyles}
              placeholder={t('onboarding.profileSetup.firstNamePlaceholder')}
              value={firstName}
              onChangeText={onFirstNameChange}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <CustomTextInput
              styles={textInputStyles}
              placeholder={t('onboarding.profileSetup.lastNamePlaceholder')}
              value={lastName}
              onChangeText={onLastNameChange}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <CustomTextInput
              styles={textInputStyles}
              placeholder={t('onboarding.profileSetup.usernamePlaceholder')}
              value={username}
              onChangeText={onUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View>
              <Text style={phoneLabelStyles.label}>{t('onboarding.profileSetup.phoneLabel')}</Text>
              <CustomTextInput
                styles={phoneError ? phoneInputStyles : textInputStyles}
                placeholder={t('onboarding.profileSetup.phonePlaceholder')}
                value={phoneNumber}
                onChangeText={onPhoneNumberChange}
                keyboardType="number-pad"
                autoCorrect={false}
                showErrorStyle={phoneError}
              />
              {phoneError && (
                <Text style={phoneLabelStyles.errorText}>{t('onboarding.profileSetup.phoneRequired')}</Text>
              )}
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.bottomSection}>
            <CustomButton
              styles={continueButtonStyles}
              title={t('onboarding.profileSetup.continueButton')}
              onPress={onHandleSubmit}
              disabled={!isFormValid || isLoading}
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollWrapper>
    </SafeAreaView>
  );
}
