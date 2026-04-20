/**
 * Signup Container that handles account creation
 */
import { type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import { Eye, EyeOff } from 'lucide-react-native';

import { SignupProps } from '@/app/auth/signup';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { AuthKeyboardAvoidingWrapper } from '@/comp-lib/auth-keyboard-avoiding-wrapper/AuthKeyboardAvoidingWrapper';
import { useSignupCore } from '@/comp-lib/auth/SignupCoreFunc';
import { t } from '@/i18n';
import { useSignupStyles } from './SignupStyles';
import { useSignup } from './SignupFunc';

export default function SignupContainer(props: SignupProps): ReactNode {
  const { signupCoreStyles, signupTopSectionStyles, wordmarkStyles, joinTitleStyles, taglineStyles } =
    useSignupStyles();
  const { onSignup } = useSignup(props);
  const {
    email,
    handleSetEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    resendingEmailVerify,
    onSignUpWithEmailHandler,
    onResendEmailVerificationHandler,
    waitingForEmailVerification,
    isKeyboardVisible,
    setIsKeyboardVisible,
  } = useSignupCore({
    styles: signupCoreStyles,
    onSignup,
    onGoToLoginButtonPress: props.onNavigateToLogin,
  });

  if (waitingForEmailVerification) {
    return (
      <SafeAreaView style={signupCoreStyles.authBaseStyles.safeArea}>
        <View style={signupCoreStyles.authBaseStyles.container}>
          <View style={signupCoreStyles.authBaseStyles.subContainer}>
            <View style={signupTopSectionStyles}>
              <CustomTextField styles={wordmarkStyles} title={t('app.name')} />
              <CustomTextField
                styles={signupCoreStyles.authBaseStyles.title}
                title={t('auth.emailVerificationSentTitle')}
              />
            </View>
            <View style={signupCoreStyles.authBaseStyles.middleSection}>
              <CustomTextField
                styles={signupCoreStyles.authBaseStyles.subTitle}
                title={t('auth.emailVerificationSentDescription', { email })}
              />
            </View>
          </View>
          <View style={signupCoreStyles.authBaseStyles.bottomSection}>
            {props.onNavigateToLogin && (
              <CustomButton
                styles={signupCoreStyles.primaryButtonStyles}
                onPress={props.onNavigateToLogin}
                disabled={resendingEmailVerify}
                title={t('auth.backToLogin')}
              />
            )}
            <CustomButton
              styles={signupCoreStyles.tertiaryButtonStyles}
              onPress={onResendEmailVerificationHandler}
              disabled={resendingEmailVerify}
              title={t('auth.resendEmail')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={signupCoreStyles.authBaseStyles.safeArea}>
      <AuthKeyboardAvoidingWrapper onKeyboardWillShowChange={setIsKeyboardVisible}>
        <View style={signupCoreStyles.authBaseStyles.container}>
          <Spinner visible={loading} />

          <View style={signupCoreStyles.authBaseStyles.subContainer}>
            <View style={signupTopSectionStyles}>
              <CustomTextField styles={wordmarkStyles} title={t('app.name')} />
              <CustomTextField styles={joinTitleStyles} title={t('auth.joinPlanet')} />
              <CustomTextField styles={taglineStyles} title={t('auth.signupTagline')} />
            </View>

            <View style={signupCoreStyles.authBaseStyles.middleSection}>
              <CustomTextInput
                styles={signupCoreStyles.textInputStyles}
                textContentType={'emailAddress'}
                onChangeText={handleSetEmail}
                value={email}
                placeholder={t('auth.email')}
                label={t('auth.email')}
                editable={!loading}
                autoCapitalize="none"
              />
              <CustomTextInput
                styles={signupCoreStyles.textInputStyles}
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

          <View
            style={
              isKeyboardVisible
                ? signupCoreStyles.authBaseStyles.bottomSectionKeyboard
                : signupCoreStyles.authBaseStyles.bottomSection
            }
          >
            <CustomButton
              styles={signupCoreStyles.primaryButtonStyles}
              onPress={onSignUpWithEmailHandler}
              disabled={loading}
              title={t('auth.signUp')}
            />
            {!isKeyboardVisible && props.onNavigateToLogin && (
              <CustomButton
                styles={signupCoreStyles.tertiaryButtonStyles}
                onPress={props.onNavigateToLogin}
                disabled={loading}
                title={t('auth.alreadyHaveAnAccount')}
              />
            )}
          </View>
        </View>
      </AuthKeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}
