/**
 * Login container that handles user login
 */
import { type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import { Eye, EyeOff } from 'lucide-react-native';

import { LoginProps } from '@/app/auth/login';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { AuthKeyboardAvoidingWrapper } from '@/comp-lib/auth-keyboard-avoiding-wrapper/AuthKeyboardAvoidingWrapper';
import { useLoginCore } from '@/comp-lib/auth/LoginCoreFunc';
import { t } from '@/i18n';
import { useLoginStyles } from './LoginStyles';
import { useAppRedirection } from '@/comp-app/auth/useAppRedirection';

export default function LoginContainer(props: LoginProps): ReactNode {
  const { loginCoreStyles, loginTopSectionStyles, wordmarkStyles, welcomeTitleStyles } = useLoginStyles();
  const { onPostLoginRedirection } = useAppRedirection({
    onNavigateToHome: props.onNavigateToHome,
    onNavigateToOnboarding: props.onNavigateToOnboarding,
  });
  const {
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
  } = useLoginCore({
    styles: loginCoreStyles,
    onLogin: onPostLoginRedirection,
    onGoToSignupButtonPress: props.onNavigateToSignup,
    onGoToResetPwButtonPress: props.onNavigateToResetPassword,
  });

  return (
    <SafeAreaView style={loginCoreStyles.authBaseStyles.safeArea}>
      <AuthKeyboardAvoidingWrapper onKeyboardWillShowChange={setIsKeyboardVisible}>
        <View style={loginCoreStyles.authBaseStyles.container}>
          <Spinner visible={loading} />

          <View style={loginCoreStyles.authBaseStyles.subContainer}>
            <View style={loginTopSectionStyles}>
              <CustomTextField styles={wordmarkStyles} title={t('app.name')} />
              <CustomTextField styles={welcomeTitleStyles} title={t('auth.welcomeBack')} />
              <CustomTextField styles={loginCoreStyles.authBaseStyles.subTitle} title={t('index.subtitle')} />
            </View>

            <View style={loginCoreStyles.authBaseStyles.middleSection}>
              <CustomTextInput
                styles={loginCoreStyles.textInputStyles}
                textContentType={'emailAddress'}
                onChangeText={setEmail}
                value={email}
                label={t('auth.email')}
                placeholder={t('auth.email')}
                editable={!loading}
                autoCapitalize="none"
              />
              <CustomTextInput
                styles={loginCoreStyles.textInputStyles}
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
                ? loginCoreStyles.authBaseStyles.bottomSectionKeyboard
                : loginCoreStyles.authBaseStyles.bottomSection
            }
          >
            <CustomButton
              styles={loginCoreStyles.primaryButtonStyles}
              onPress={onSignInWithEmail}
              disabled={loading}
              title={t('auth.signIn')}
            />
            {props.onNavigateToResetPassword && !isKeyboardVisible && (
              <CustomButton
                styles={loginCoreStyles.resetPasswordButtonStyles}
                onPress={props.onNavigateToResetPassword}
                disabled={loading}
                title={t('auth.forgotPassword')}
              />
            )}
            {props.onNavigateToSignup && !isKeyboardVisible && (
              <CustomButton
                styles={loginCoreStyles.tertiaryButtonStyles}
                onPress={props.onNavigateToSignup}
                disabled={loading}
                title={t('auth.createAnAccount')}
              />
            )}
          </View>
        </View>
      </AuthKeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}
