import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import { Eye, EyeOff } from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { t } from '@/i18n';
import { useLoginCore } from '@/comp-lib/auth/LoginCoreFunc';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import OptionalWrapper from '@/comp-lib/common/OptionalWrapper';
import { LoginCoreStyles } from '@/comp-lib/auth/LoginCoreStyles';
import { Session } from '@supabase/supabase-js';
import { AuthKeyboardAvoidingWrapper } from '../auth-keyboard-avoiding-wrapper/AuthKeyboardAvoidingWrapper';

export interface LoginCoreProps {
  styles: LoginCoreStyles;
  onGoToSignupButtonPress?: () => void;
  onGoToResetPwButtonPress?: () => void;
  /** handles the logic of redirect to the next page after the user is logged in */
  onLogin: (s: Session) => void;
  wrapInSafeAreaView?: boolean;
  wrapInKeyboardAvoidingView?: boolean;
  showSpinnerOnSubmit?: boolean;
  // /** display app name */
  // showAppName?: boolean;
  /** optional title; MUST NOT add welcome message */
  title?: string;
  /** optional subtitle; MUST NOT add welcome message */
  subTitle?: string;
  // /** Toggles display of the logo at the top (if true "logoIonicons" must be provided) */
  // showLogo?: boolean;
  // logoIonicons?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function LoginCore(props: LoginCoreProps): ReactNode {
  const {
    appName,
    email,
    setEmail,
    password,
    onSetPassword,
    showPassword,
    toggleShowPassword,
    loading,
    onSignInWithEmail,
    isKeyboardVisible,
    setIsKeyboardVisible,
  } = useLoginCore(props);

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
              {/* {props.showLogo && props.logoIonicons && (
                <View style={props.styles.authBaseStyles.iconWrapper}>
                  <Ionicons
                    name={props.logoIonicons}
                    size={props.styles.authBaseStyles.icon.size}
                    color={props.styles.authBaseStyles.icon.color}
                  />
                </View>
              )} */}
              {/* {props.showAppName && <CustomTextField styles={props.styles.authBaseStyles.appName} title={appName} />} */}
              {props.title && <CustomTextField styles={props.styles.authBaseStyles.title} title={props.title} />}
              {props.subTitle && (
                <CustomTextField styles={props.styles.authBaseStyles.subTitle} title={props.subTitle} />
              )}
            </View>
            <View style={props.styles.authBaseStyles.middleSection}>
              <CustomTextInput
                styles={props.styles.textInputStyles}
                textContentType={'emailAddress'}
                onChangeText={setEmail}
                value={email}
                label={t('auth.email')}
                placeholder={t('auth.email')}
                editable={!loading}
                autoCapitalize="none"
              />
              <CustomTextInput
                styles={props.styles.textInputStyles}
                onChangeText={onSetPassword}
                value={password}
                secureTextEntry={!showPassword}
                label={t('auth.password')}
                placeholder={t('auth.password')}
                editable={!loading}
                rightIcon={({ size, color }) =>
                  showPassword ? <EyeOff size={size} color={color} /> : <Eye size={size} color={color} />
                }
                onPressRightIcon={toggleShowPassword}
              />
            </View>
          </View>

          <View
            style={
              isKeyboardVisible
                ? props.styles.authBaseStyles.bottomSectionKeyboard
                : props.styles.authBaseStyles.bottomSection
            }
          >
            <CustomButton
              styles={props.styles.primaryButtonStyles}
              onPress={onSignInWithEmail}
              disabled={loading}
              title={t('auth.signIn')}
            />
            {props.onGoToResetPwButtonPress && !isKeyboardVisible && (
              <CustomButton
                styles={props.styles.resetPasswordButtonStyles}
                onPress={props.onGoToResetPwButtonPress}
                disabled={loading}
                title={t('auth.forgotPassword')}
              />
            )}
            {props.onGoToSignupButtonPress && !isKeyboardVisible && (
              <CustomButton
                styles={props.styles.tertiaryButtonStyles}
                onPress={props.onGoToSignupButtonPress}
                disabled={loading}
                title={t('auth.createAnAccount')}
              />
            )}
          </View>
        </View>
      </OptionalWrapper>
    </OptionalWrapper>
  );
}
