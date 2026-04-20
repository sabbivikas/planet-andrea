import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { type PropsWithChildren, type ReactNode } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import { OnboardingContextProvider } from '@/comp-lib/common/context/OnboardingContextProvider';
import { CrashAnalyticsProvider } from '@/comp-lib/crash-analytics/CrashAnalyticsProvider';
import { ErrorBoundary } from '@/comp-lib/errors/ErrorBoundary';
import { NavigationBridge } from '@/comp-lib/navigation/NavigationBridge';
import { AnalyticsProvider } from '@/comp-lib/integrations/analytics/AnalyticsProvider';
import { ReactInspector } from '@/comp-lib/react-inspector/ReactInspector';
import { StyleProvider } from '@/comp-lib/styles/StyleContext';
import { ToastProvider } from '@/comp-lib/toast/ToastContext';
import { RevenueCatProvider } from '../integrations/revenue-cat/RevenueCatProvider';
import { SafeAreaProviderWrapper } from './providers/SafeAreaProviderWrapper';

export function DefaultAppContextProviders({ children }: PropsWithChildren): ReactNode {
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <AnalyticsProvider>
        <RevenueCatProvider enableDebugLogs={false}>
          <OnboardingContextProvider>
            <SafeAreaProviderWrapper>
              <StyleProvider>
                <CrashAnalyticsProvider>
                  <ErrorBoundary>
                    <ReactInspector>
                      <NavigationBridge>
                        <ToastProvider>{children}</ToastProvider>
                      </NavigationBridge>
                    </ReactInspector>
                  </ErrorBoundary>
                </CrashAnalyticsProvider>
              </StyleProvider>
            </SafeAreaProviderWrapper>
          </OnboardingContextProvider>
        </RevenueCatProvider>
      </AnalyticsProvider>
    </SessionContextProvider>
  );
}
