---
name: admob
description: Add Google AdMob mobile ads (banner, interstitial, rewarded) to React Native/Expo app. Shows step-by-step setup with platform-specific files for web compatibility.
---
# AdMob Integration - Quick Guide

**Goal**: Add banner ads that work on iOS/Android and show placeholders on web.

**Package**: `react-native-google-mobile-ads` (official Google package)


## Step 0: Get Test Ad IDs from Google

**IMPORTANT**: Fetch the latest test ad IDs from Google's official documentation:

📄 **iOS Test Ads**: https://developers.google.com/admob/ios/test-ads
📄 **Android Test Ads**: https://developers.google.com/admob/android/test-ads

You need:
- **App IDs** (format: `ca-app-pub-XXXXXXXX~YYYYYY`) - for app.json config
- **Banner ad unit IDs** (format: `ca-app-pub-XXXXXXXX/ZZZZZZ`) - for displaying ads


## Step 1: Install Package

```bash
npm install react-native-google-mobile-ads
```


## Step 2: Configure app.json

Add the AdMob plugin with **test app IDs** from Google docs:

app.json
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "INSERT_ANDROID_TEST_APP_ID_HERE",
          "iosAppId": "INSERT_IOS_TEST_APP_ID_HERE"
        }
      ]
    ]
  }
}
```

Replace with actual test app IDs from the Google documentation above.


## Step 3: Create Platform-Specific Files

**CRITICAL**: AdMob only works on iOS/Android. Use `.web.tsx` files for web to prevent Metro bundler crashes.

### BannerAdContainer.tsx (Native)
comp-app/integrations/admob/BannerAdContainer.tsx
```tsx
import { type ReactNode } from 'react';
import { Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export interface BannerAdProps {
  size?: BannerAdSize;
}

export function BannerAdContainer(props: BannerAdProps): ReactNode {
  // Use test banner ad unit IDs from Google docs
  const adUnitId = Platform.OS === 'ios'
    ? 'INSERT_IOS_BANNER_TEST_ID'     // From https://developers.google.com/admob/ios/test-ads
    : 'INSERT_ANDROID_BANNER_TEST_ID'; // From https://developers.google.com/admob/android/test-ads

  return (
    <BannerAd
      unitId={adUnitId}
      size={props.size ?? BannerAdSize.BANNER}
      onAdLoaded={() => console.log('Ad loaded')}
      onAdFailedToLoad={(err) => console.warn('Ad failed:', err)}
    />
  );
}
```

### BannerAdContainer.web.tsx (Web Placeholder)
comp-app/integrations/admob/BannerAdContainer.web.tsx
```tsx
import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface BannerAdProps {
  size?: number;
}

export function BannerAdContainer(props: BannerAdProps): ReactNode {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>AdMob ads only available on TestFlight</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#999',
  },
});
```

**How it works**: Metro automatically uses `.web.tsx` on web, `.tsx` on native.


## Step 4: Use in Your Screen

```tsx
import { BannerAdContainer } from '@/comp-app/integrations/admob/BannerAdContainer';

export default function MyScreen() {
  return (
    <View>
      <Text>Your Content</Text>
      <BannerAdContainer />
    </View>
  );
}
```

**Important**: Use **direct imports** (full path), not barrel exports. Barrel exports can load native modules on web.


## Gotchas & Solutions

### 1. Metro Bundler Crashes on Web

**Problem**: Importing native modules breaks web builds, even with `Platform.OS` checks.

**Solution**: Use platform-specific files (`.web.tsx`). Metro's static analysis happens before runtime.

### 2. Ads Not Showing in Preview

**Problem**: AdMob requires native modules not included in the Woz Native App.

**Solution**:
- **During Development**: Ads won't show in Woz Native App (expected)
- **To See Ads**: Deploy to TestFlight or production build
- Web shows placeholder (normal)
- Once on TestFlight: Wait 1-3 seconds for ads to load

### 3. Wrong Import Paths Load Native Code on Web

**Problem**: `import { X } from '@/comp-app/integrations/admob'` loads ALL files, including native modules.

**Solution**: Use direct imports: `import { X } from '@/comp-app/integrations/admob/BannerAdContainer'`


## Testing

**Woz App Preview**: Shows "AdMob ads only available on TestFlight"

**Woz Native App**:
- ❌ Ads won't show in preview (requires native build)
- Placeholder shows correctly in mobile preview

**TestFlight / Production Build**:
- ✅ Real test ads will display
- Should see Google's test inventory
- Typical load time: 1-3 seconds after app launches


## Other Ad Formats

This guide covers the 3 most common formats (Banner, Interstitial, Rewarded). AdMob also supports:

- **Native Ads** - Custom layouts that match your app design
- **App Open Ads** - Shows when app launches/resumes
- **Rewarded Interstitial** - Full-screen ads with rewards

These follow similar implementation patterns. See Google's official docs:
- https://developers.google.com/admob/ios/native
- https://developers.google.com/admob/ios/app-open
- https://developers.google.com/admob/ios/rewarded-interstitial


## Production Deployment (Important!)

⚠️ **Test IDs are for development only** - they won't generate revenue.

**Before launching your app**, the user must:

1. **Create AdMob Account**
   - Sign up at https://admob.google.com
   - Complete account verification

2. **Add App to AdMob**
   - Create new app in AdMob dashboard
   - Get production app IDs (iOS & Android)
   - Generate ad unit IDs for each ad format

3. **Replace Test IDs**
   - Update app.json with production app IDs
   - Replace test ad unit IDs in code with production IDs
   - Rebuild app with `npx expo prebuild`

4. **Submit for Review**
   - **Google reviews apps before serving real ads**
   - Review typically takes 24-48 hours
   - App must be published (TestFlight/Play Store) for review
   - Ads won't show revenue until approved

5. **Launch**
   - Deploy to App Store / Play Store
   - Real ads start showing after Google approval
   - Revenue appears in AdMob dashboard

**Timeline**: Plan for 2-3 days between submission and live ads (review + app store approval).


## Summary

✅ Fetch test IDs from Google docs (https://developers.google.com/admob/ios/test-ads)
✅ Install `react-native-google-mobile-ads`
✅ Add plugin to app.json with test app IDs
✅ Create `.tsx` (native) and `.web.tsx` (web placeholder) files
✅ Use test ad unit IDs in native file
✅ Import with full paths (avoid barrel exports)
✅ Test: web shows placeholder, native shows ads after prebuild

**Key Lesson**: Platform-specific files are the only reliable way to prevent native module imports on web.