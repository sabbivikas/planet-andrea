export interface SafeAreaProviderWrapperFunc {
  enableFakeSafeArea: boolean;
}

export function useSafeAreaProviderWrapper(): SafeAreaProviderWrapperFunc {
  return { enableFakeSafeArea: false };
}
