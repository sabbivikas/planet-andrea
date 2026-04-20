import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { useSignupCore } from '@/comp-lib/auth/SignupCoreFunc';
import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import OptionalWrapper from '@/comp-lib/common/OptionalWrapper';
import { SignupCoreStyles } from '@/comp-lib/auth/SignupCoreStyles';
import { type Session } from '@supabase/supabase-js';
import { AuthKeyboardAvoidingWrapper } from '../auth-keyboard-avoiding-wrapper/AuthKeyboardAvoidingWrapper';

export interface SignupCoreProps {
  /** Full set of layout and component styles used in the Signup screen */
  styles: SignupCoreStyles;
  /** Callback invoked when signup is successful — either the user is logged in or a 'Confirm your email' alert is shown */
  onSignup?: (s: Session | undefined) => void;
  onGoToLoginButtonPress?: () => void;
  wrapInSafeAreaView?: boolean;
  wrapInKeyboardAvoidingView?: boolean;
  showSpinnerOnSubmit?: boolean;
  /** display app name from the app config */
  showAppName?: boolean;
  /** optional title; MUST NOT add welcome message */
  title?: string;
  /** optional subtitle; MUST NOT add welcome message */
  subTitle?: string;
  /** Toggles display of the logo at the top (if true "LogoIcon" must be provided) */
  showLogo?: boolean;
  LogoIcon?: LucideIcon;
  submitDisabled?: boolean;
  beforeSubmitSlot?: ReactNode;
}

export default function SignupCore(props: SignupCoreProps): ReactNode {
  const {
    appName,
    email,
    handleSetEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    resendingEmailVerify,
    onSignUpWithEmailHandler,
    waitingForEmailVerification,
    onResendEmailVerificationHandler,
    isKeyboardVisible,
    setIsKeyboardVisible,
  } = useSignupCore(props);

  if (waitingForEmailVerification) {
    return (
      <OptionalWrapper
        Wrapper={SafeAreaView}
        enable={props.wrapInSafeAreaView}
        style={props.styles.authBaseStyles.safeArea}
      >
        <View style={props.styles.authBaseStyles.container}>
          <View style={props.styles.authBaseStyles.subContainer}>
            <View style={props.styles.authBaseStyles.topSection}>
              <CustomTextField
                styles={props.styles.authBaseStyles.title}
                title={t('auth.emailVerificationSentTitle')}
              />
            </View>
            <View style={props.styles.authBaseStyles.middleSection}>
              <CustomTextField
                styles={props.styles.authBaseStyles.subTitle}
                title={t('auth.emailVerificationSentDescription', { email })}
              />
            </View>
          </View>
          <View style={props.styles.authBaseStyles.bottomSection}>
            {props.onGoToLoginButtonPress && (
              <CustomButton
                styles={props.styles.primaryButtonStyles}
                onPress={props.onGoToLoginButtonPress}
                disabled={resendingEmailVerify}
                title={t('auth.backToLogin')}
              />
            )}
            <CustomButton
              styles={props.styles.tertiaryButtonStyles}
              onPress={onResendEmailVerificationHandler}
              disabled={resendingEmailVerify}
              title={t('auth.resendEmail')}
            />
          </View>
        </View>
      </OptionalWrapper>
    );
  }

  return (
    <OptionalWrapper
      Wrapper={SafeAreaView}
      enable={props.wrapInSafeAreaView}
      style={props.styles.authBaseStyles.safeArea}
    >
      <OptionalWrapper
        Wrapper={AuthKeyboardAvoidingWrapper}
        enable={props.wrapInKeyboardAvoidingView}
        wrapperProps={{ onKeyboardWillShowChange: setIsKeyboardVisible }}
      >
        <View style={props.styles.authBaseStyles.container}>
          <Spinner visible={loading && props.showSpinnerOnSubmit} />

          <View style={props.styles.authBaseStyles.subContainer}>
            <View style={props.styles.authBaseStyles.topSection}>
              {props.showLogo && props.LogoIcon && (
                <View style={props.styles.authBaseStyles.iconWrapper}>
                  <props.LogoIcon
                    size={props.styles.authBaseStyles.icon.size}
                    color={props.styles.authBaseStyles.icon.color}
                  />
                </View>
              )}
              {props.showAppName && <CustomTextField styles={props.styles.authBaseStyles.appName} title={appName} />}
              {props.title && <CustomTextField styles={props.styles.authBaseStyles.title} title={props.title} />}
              {props.subTitle && (
                <CustomTextField styles={props.styles.authBaseStyles.subTitle} title={props.subTitle} />
              )}
            </View>

            <View style={props.styles.authBaseStyles.middleSection}>
              <CustomTextInput
                styles={props.styles.textInputStyles}
                textContentType={'emailAddress'}
                onChangeText={handleSetEmail}
                value={email}
                placeholder={t('auth.email')}
                label={t('auth.email')}
                editable={!loading}
              />
              <CustomTextInput
                styles={props.styles.textInputStyles}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={!showPassword}
                placeholder={t('auth.password')}
                label={t('auth.password')}
                editable={!loading}
                rightIcon={({ size, color }) =>
                  showPassword ? <EyeOff size={size} color={color} /> : <Eye size={size} color={color} />
                }
                onPressRightIcon={toggleShowPassword}
              />
            </View>
          </View>

          {props.beforeSubmitSlot}

          <View
            style={
              isKeyboardVisible
                ? props.styles.authBaseStyles.bottomSectionKeyboard
                : props.styles.authBaseStyles.bottomSection
            }
          >
            <CustomButton
              styles={props.styles.primaryButtonStyles}
              onPress={onSignUpWithEmailHandler}
              disabled={loading || props.submitDisabled}
              title={t('auth.signUp')}
            />
            {!isKeyboardVisible && props.onGoToLoginButtonPress && (
              <CustomButton
                styles={props.styles.tertiaryButtonStyles}
                onPress={props.onGoToLoginButtonPress}
                disabled={loading}
                title={t('auth.alreadyHaveAnAccount')}
              />
            )}
          </View>
        </View>
      </OptionalWrapper>
    </OptionalWrapper>
  );
}
