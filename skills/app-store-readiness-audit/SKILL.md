---
name: app-store-readiness-audit
description: Use this skill when the user wants to prepare their app for Apple App Store submission, check for common rejection reasons, or audit their app against App Store Review Guidelines. Provides a checklist of top rejection reasons with automated checks and fix guidance.
---
# Apple App Store Readiness Audit

Run this audit before submitting to the App Store. Each section covers a top rejection reason with what to check, how to check it, and how to fix issues.

**Important:** Always do a web search for the latest Apple App Store Review Guidelines before starting — guidelines change frequently and this checklist may not reflect the most recent updates.

## Official Sources

Use these references for the most up-to-date information on any section below:

- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **App Store Connect Help:** https://developer.apple.com/help/app-store-connect/
- **Upcoming Requirements:** https://developer.apple.com/news/upcoming-requirements/
- **Subscription Best Practices:** https://developer.apple.com/app-store/subscriptions/
- **Account Deletion Requirements:** https://developer.apple.com/support/offering-account-deletion-in-your-app/
- **User Privacy & Data Use:** https://developer.apple.com/app-store/user-privacy-and-data-use/
- **Kids Apps & Parental Gates:** https://developer.apple.com/app-store/kids-apps/
- **Reader Apps Entitlements:** https://developer.apple.com/support/reader-apps/


## How to Use This Audit

1. Go through each section below
2. For automated checks: run the commands/searches indicated
3. For manual checks: review the described areas
4. Fix any issues found using the guidance provided
5. Re-run checks after fixes to confirm resolution


## 1. Privacy & Data Collection (Guideline 5.1)

**Why apps get rejected:** Missing privacy manifest, incomplete usage descriptions, no App Tracking Transparency prompt, missing account deletion.

**Source:** https://developer.apple.com/app-store/user-privacy-and-data-use/

### 1a. PrivacyInfo.xcprivacy Manifest

**Check:** Search for the privacy manifest file.

```
# Look for existing privacy manifest
find ios/ -name "PrivacyInfo.xcprivacy"
```

**Fix if missing:** Create `ios/[AppName]/PrivacyInfo.xcprivacy`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    <!-- Add entries for each data type your app collects -->
  </array>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <!-- Required: declare all required reason APIs used -->
  </array>
</dict>
</plist>
```

**Required Reason APIs** that must be declared if used:
- `NSPrivacyAccessedAPICategoryFileTimestamp` — File timestamp APIs
- `NSPrivacyAccessedAPICategorySystemBootTime` — System boot time APIs
- `NSPrivacyAccessedAPICategoryDiskSpace` — Disk space APIs
- `NSPrivacyAccessedAPICategoryUserDefaults` — UserDefaults APIs

**Best practice:** Check all third-party SDKs — they may use required reason APIs. Apple now requires SDK privacy manifests and signatures. Third-party SDKs that track users without proper disclosure will cause rejection.

### 1b. Info.plist Usage Descriptions

**Check:** Search Info.plist for all `NS*UsageDescription` keys your app needs.

```
# Check which usage description keys exist
grep -r "UsageDescription" ios/*/Info.plist
```

**Required keys** (include ONLY those your app actually uses):

| Key | When Required |
|-----|--------------|
| `NSCameraUsageDescription` | Camera access |
| `NSPhotoLibraryUsageDescription` | Read photo library |
| `NSPhotoLibraryAddUsageDescription` | Save to photo library |
| `NSMicrophoneUsageDescription` | Microphone/audio recording |
| `NSLocationWhenInUseUsageDescription` | Location while app is open |
| `NSLocationAlwaysAndWhenInUseUsageDescription` | Background location |
| `NSContactsUsageDescription` | Contacts access |
| `NSCalendarsUsageDescription` | Calendar access |
| `NSFaceIDUsageDescription` | Face ID authentication |
| `NSMotionUsageDescription` | Motion/accelerometer data |
| `NSBluetoothAlwaysUsageDescription` | Bluetooth access |
| `NSSpeechRecognitionUsageDescription` | Speech recognition |
| `NSUserTrackingUsageDescription` | App Tracking Transparency |

**Fix:** Each description MUST be a human-readable sentence explaining WHY the app needs this permission. Generic text will be rejected.

**Good example:** "Take photos to set your profile picture and share moments with friends."
**Bad example:** "Camera access is required."

**Best practice:** Request permissions **just-in-time** when the user performs the relevant action, not on app launch. Consider showing a custom pre-permission screen explaining why before the system prompt appears.

### 1c. App Tracking Transparency (ATT)

**Check:** If your app uses any advertising identifiers or tracks users across apps/websites:

```
# Check if ATT framework is imported
grep -r "AppTrackingTransparency" ios/ --include="*.swift" --include="*.m"
grep -r "requestTrackingAuthorization" .
```

**Fix if needed:** You MUST show the ATT prompt BEFORE collecting any tracking data. In React Native:

```typescript
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// Call this early in app startup, BEFORE initializing ad SDKs
const { status } = await requestTrackingPermissionsAsync();
if (status === 'granted') {
  // Initialize ad SDKs, analytics with tracking
} else {
  // Initialize without tracking, use SKAdNetwork for attribution
}
```

**Best practice:** Never offer rewards, discounts, virtual currency, or feature unlocks in exchange for granting tracking permission. Never use misleading visuals or psychological nudges on the ATT prompt.

### 1d. Account Deletion Requirement

**Check:** If your app has account creation, it MUST offer account deletion.

**Source:** https://developer.apple.com/support/offering-account-deletion-in-your-app/

```
# Search for account deletion functionality
grep -r "deleteAccount\|delete.*account\|account.*delet" --include="*.ts" --include="*.tsx"
```

**Fix:** Implement in-app account deletion that:
- Is discoverable in Settings/Profile (not hidden)
- Deletes all user data from your servers
- Can be completed in-app (cannot just link to a website or email support)
- Includes confirmation dialog before deletion
- Handles active subscriptions (inform user to cancel first)

**Best practice:** Woz apps should use the `user-func.ts` edge function's delete handler. Check that `custom-delete-user-handler.ts` properly cleans up all user data.

### 1e. App Privacy Nutrition Labels

**Check:** Ensure your App Store Connect privacy declarations match what your app actually collects.

**Audit these data categories:**
- Contact info (name, email, phone)
- Health & fitness data
- Financial info
- Location data
- User content (photos, videos, messages)
- Identifiers (user ID, device ID)
- Usage data (analytics, diagnostics)
- Purchases

**Fix:** For each data type, declare: whether it's linked to the user's identity, whether it's used for tracking, and the purpose (app functionality, analytics, advertising, etc.).


## 2. Authentication & Account Rules (Guidelines 4.8, 5.1.1)

**Why apps get rejected:** Requiring login when not needed, missing Sign in with Apple, no way to use app without social login.

**Source:** https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple

### 2a. Login Must Be Justified (Guideline 5.1.1(v))

**Check:** Does your app require login? If so, does it have features that genuinely need a unique user identity?

**Rule:** Apps that don't have significant account-based features MUST NOT require login. Users must be able to use the app without signing in.

**Features that justify requiring login:**
- Saving user-specific data (preferences, history, content)
- Social features (messaging, sharing, following)
- Purchases tied to an account
- Multi-device sync

**Features that do NOT justify requiring login (per Apple):**
- Basic profile info display
- Social sharing buttons
- Friend invites
- Age-gating (use a different mechanism)

**Fix:** If login isn't essential, offer a "Skip" or "Continue as Guest" option. Gate only the features that truly require authentication, not the entire app.

### 2b. Sign in with Apple (Guideline 4.8)

**Check:** If your app offers ANY third-party or social login (Google, Facebook, Twitter, etc.):

```
grep -r "GoogleSignIn\|FacebookLogin\|signInWithGoogle\|signInWithFacebook\|signInWith.*Provider" --include="*.ts" --include="*.tsx"
```

**Rule:** If you use any third-party login as a primary account setup method, you MUST also offer Sign in with Apple (or an equivalent that limits data collection to name and email, allows private email relay, and doesn't collect interactions for advertising).

**Exemptions:**
- App uses only its own first-party account system (email/password)
- Education/enterprise apps requiring institutional accounts
- Government or industry-backed citizen ID authentication
- Client apps for a specific third-party service (e.g., a Slack client)

**Fix:** Add Sign in with Apple alongside any social login buttons. It should be equally prominent — not hidden below other options.

### 2c. Don't Gate Features Behind System Permissions (Guideline 5.1.2(i))

**Rule:** You cannot require users to enable push notifications, location services, or tracking to access app functionality, content, or receive compensation (gift cards, promo codes, etc.).

**Check:** Look for patterns where features are locked behind permission grants:

```
grep -r "enableNotifications.*to\|turn on.*location\|allow.*tracking.*to\|grant.*permission.*to" --include="*.ts" --include="*.tsx"
```

**Fix:** All core app functionality must work regardless of whether the user grants system permissions. Permissions should enhance the experience, not gate it.


## 3. Performance & Stability (Guideline 2.1)

**Why apps get rejected:** Crashes on launch, broken features, excessive resource usage.

### 3a. Crash-Free Launch

**Check:**
- Build a release version and test on a real device (not just simulator)
- Test cold launch, background/foreground transitions
- Test with no network connection
- Test with slow network (use Network Link Conditioner)

```
# Build release version for testing
npx expo run:ios --configuration Release
```

**Fix common crash causes:**
- **Missing error boundaries:** Wrap top-level components with React error boundaries
- **Unhandled promise rejections:** Add global error handler
- **Network assumptions:** Never assume network is available — always handle offline state
- **Missing null checks:** API responses may return null/undefined unexpectedly

### 3b. IPv6 Compatibility (Guideline 2.5.5)

**Check:** Your app must work on IPv6-only networks (Apple review uses IPv6).

**Fix:**
- Never hardcode IPv4 addresses — always use hostnames
- Avoid low-level socket APIs that are IPv4-specific
- Test with macOS Internet Sharing in NAT64 mode

### 3c. Battery & Device Strain (Guideline 2.4.2)

**Rule:** No rapid battery drain, excessive heat, or unnecessary device strain. No cryptocurrency mining, including via third-party ad SDKs.

### 3d. Minimum iOS Version

**Check:**
```
grep -r "MinimumOSVersion\|IPHONEOS_DEPLOYMENT_TARGET" ios/
```

**Best practice:** Support at minimum the current and previous two major iOS versions. Check the Expo config `ios.deploymentTarget` in app.json.


## 4. App Completeness (Guideline 2.3)

**Why apps get rejected:** Placeholder content, broken links, incomplete features, missing demo credentials.

### 4a. Placeholder Content Audit

**Check:** Search for common placeholder text:

```
grep -ri "lorem ipsum\|placeholder\|TODO\|FIXME\|coming soon\|under construction" --include="*.ts" --include="*.tsx" --include="*.json"
```

**Fix:** Replace all placeholder content with real content. Every screen must be functional.

### 4b. Demo Account for Review

**Check:** If your app requires login, you MUST provide working demo credentials in App Store Connect > App Review Information.

**Fix:**
- Create a dedicated review account with full access to app features
- Ensure credentials don't expire during review (can take 1-7 days)
- If app uses phone verification, provide a bypass or test number
- If features are behind a paywall, explain how to access them or provide a promo code
- If the app has IP restrictions or geo-fencing, whitelist Apple's reviewer IPs or explain in review notes
- Document any special hardware requirements or non-obvious setup in the review notes

### 4c. Dead Ends and Broken Navigation

**Check:** Tap through every screen and every button. Look for:
- Buttons that do nothing
- Screens that load forever
- Error states with no recovery path
- Links that go nowhere

**Fix:** Every UI element must either function or be removed. Non-functional "coming soon" features will cause rejection.

### 4d. Metadata Consistency (Guideline 2.3.8)

**Rule:** Screenshots must show the app in use, not just title/login/splash screens. The UI shown must match actual app behavior. A price shown in metadata (e.g., "$4.99" in description) must match actual in-app pricing. Metadata images (icon, screenshots, previews) must meet a 4+ age rating even if the app itself is rated higher.


## 5. In-App Purchases (Guideline 3.1)

**Why apps get rejected:** Missing IAP for digital content, no restore purchases button, unlisted subscription terms.

**Source:** https://developer.apple.com/app-store/subscriptions/

### 5a. When IAP is Required (Guideline 3.1.1)

**Check:** If your app sells ANY of these, you MUST use Apple IAP:
- Premium features / feature unlocking
- Subscriptions to content
- Digital goods (filters, stickers, virtual currency)
- Ad removal
- Cloud storage upgrades

**IAP is NOT required for:**
- Physical goods and services
- Content consumed outside the app (e.g., Kindle books — see "Reader" apps below)
- One-to-one services (Uber, food delivery)
- Real-time person-to-person services

**Reader App Exception (Guideline 3.1.3(a)):** "Reader" apps (magazines, newspapers, books, audio, music, video) may allow access to previously purchased content/subscriptions without using IAP. They can offer free tier account creation and link to developer's website for account management.

**Source:** https://developer.apple.com/support/reader-apps/

### 5b. Restore Purchases

**Check:**
```
grep -r "restorePurchases\|restore.*purchase" --include="*.ts" --include="*.tsx"
```

**Fix:** You MUST have a "Restore Purchases" button accessible to users (typically in Settings or on the paywall). Test the full cycle: purchase > delete app > reinstall > restore > verify unlocked. For RevenueCat:

```typescript
import Purchases from 'react-native-purchases';

async function onRestorePurchases(): Promise<void> {
  const customerInfo = await Purchases.restorePurchases();
  // Update UI based on restored entitlements
}
```

### 5c. Subscription Disclosure (Guideline 3.1.2)

**Check:** If your app has subscriptions, the paywall MUST clearly show:
- Price and billing period (e.g., "$9.99/month")
- Free trial duration and what happens when it ends
- Auto-renewal terms and how to cancel
- Link to Terms of Service
- Link to Privacy Policy

**Fix:** Display all subscription terms on the paywall screen, not behind a tap. Apple specifically checks for this.

**Additional rules:**
- Credits/in-game currencies purchased via IAP cannot expire and must have a restore mechanism
- Users must have a seamless upgrade/downgrade experience
- When converting to a subscription model, do not remove primary functionality that existing paid users already have

### 5d. No Subscription Scams

**Rule:** Attempting to mislead users into unwanted subscriptions, making cancellation difficult, or charging unreasonable prices for basic functionality will result in removal and possible developer program expulsion.


## 6. Minimum Functionality (Guideline 4.2)

**Why apps get rejected:** App is too simple, just a website wrapper, or doesn't provide enough value.

### 6a. WebView-Only Check

**Check:**
```
grep -r "WebView\|webview\|WKWebView" --include="*.ts" --include="*.tsx"
```

**Fix:** If your app is primarily a WebView wrapping a website, it will be rejected. Apps must provide functionality beyond what a mobile website offers:
- Native features (push notifications, camera, offline support)
- Native navigation and gestures
- Native UI components (not just web content in a frame)

### 6b. Feature Depth

**Check:** Does the app have at least 3-4 meaningful features beyond login/profile? Single-feature apps or apps that could be a simple website are commonly rejected.

**Fix:** Ensure the app provides genuine native value. Add features like:
- Offline functionality
- Push notifications
- Native device features (camera, location, etc.)
- Rich interactions (gestures, animations)


## 7. User-Generated Content (Guideline 1.2)

**Why apps get rejected:** Missing content moderation, no reporting mechanism, no way to block users.

### 7a. Required UGC Safeguards

**Check:** If your app allows ANY user-posted content (text, images, video, comments, profiles), you MUST have ALL of the following:

```
# Search for reporting/blocking functionality
grep -r "report\|block.*user\|flag.*content\|moderate" --include="*.ts" --include="*.tsx"
```

**Fix:** Implement all four required safeguards:
1. **Content filtering/moderation** — Filter objectionable content before it's published (automated or manual)
2. **Reporting mechanism** — Users must be able to flag offensive content
3. **Blocking** — Users must be able to block abusive users
4. **Published contact info** — Developer contact info must be reachable from within the app (Settings/Help)

Missing even one of these will cause rejection.


## 8. Push Notifications (Guidelines 4.5.4, 5.1.2)

### 8a. Push Notification Rules

**Rules to follow:**
- Push notifications MUST NOT be used for marketing/promotions unless the user has explicitly opted in via an in-app consent mechanism, AND the app provides an opt-out method
- No sensitive personal or confidential information via push
- You cannot require enabling push notifications to access app functionality or content
- You cannot monetize push notifications as a built-in capability (Guideline 4.10)

**Best practice:** Show a custom pre-permission screen explaining the value of notifications before triggering the system prompt. This improves opt-in rates and sets user expectations.


## 9. Location Services (Guideline 5.1.5)

### 9a. Location Rules

**Check:** If your app uses location services:

```
grep -r "requestForegroundPermissionsAsync\|requestBackgroundPermissionsAsync\|getCurrentPositionAsync\|watchPositionAsync" --include="*.ts" --include="*.tsx"
```

**Rules:**
- Use location ONLY when directly relevant to app features
- Must notify and obtain consent before collecting location data
- Must explain the purpose of location use within the app
- Cannot require enabling location to access unrelated app functionality
- Background location (`Always`) requires strong justification — navigation, fitness tracking, etc.

**Fix:** If you only need location while the app is in use, request `WhenInUse` permission only. `Always` permission triggers extra scrutiny from reviewers — be prepared to justify it in the review notes.


## 10. Design & UI (Guideline 4.0)

**Why apps get rejected:** Non-standard UI, inaccessible text, improper use of system features.

**Source:** https://developer.apple.com/design/human-interface-guidelines/

### 10a. App Icons

**Check:**
```
# Verify icon exists and is correct size (1024x1024 for App Store)
find . -name "icon.png" -o -name "AppIcon*"
```

**Fix:**
- App Store icon must be exactly 1024x1024 PNG
- No alpha/transparency
- No rounded corners (iOS adds these automatically)
- Must not be a simple emoji or generic stock image
- Must not use another app's icon or brand imagery (Guideline 4.1(c))

### 10b. Launch Screen

**Check:** App must have a proper launch screen (splash screen), not a blank white/black screen.

**Fix:** Configure in app.json:
```json
{
  "expo": {
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### 10c. Safe Area & Notch Support

**Check:** Test on devices with notch/Dynamic Island. Content must not be obscured.

**Fix:** Use `SafeAreaView` or `useSafeAreaInsets()` from `react-native-safe-area-context` for all screens.

### 10d. Dynamic Type & Accessibility

**Check:** Test with:
- Larger text sizes (Settings > Accessibility > Display & Text Size > Larger Text)
- VoiceOver enabled
- Bold text enabled

**Fix:**
- Text should scale with system font size settings
- All interactive elements need accessibility labels
- Minimum touch target size: 44x44 points


## 11. Legal Requirements (Guideline 5.0)

### 11a. Terms of Service & Privacy Policy

**Check:** Your app MUST link to:
- Privacy Policy (required for ALL apps)
- Terms of Service (required if you have accounts or purchases)

```
grep -ri "privacy.*policy\|terms.*service\|terms.*use" --include="*.ts" --include="*.tsx" --include="*.json"
```

**Fix:** Add links in:
1. App settings/profile screen
2. Sign-up screen (before account creation)
3. App Store Connect metadata
4. Paywall screen (if applicable)

**Best practice:** Privacy policy must be accessible both in App Store Connect metadata AND within the app. If reviewers cannot find it quickly in either place, it is treated as missing.

### 11b. Age Rating (Guideline 5.0)

**Check:** Set the correct age rating in App Store Connect based on your app's content.

**Recent change:** New age rating tiers (13+, 16+, 18+) were added. Developers must complete the updated age rating questionnaire. Do a web search for the latest deadline.

**Source:** https://developer.apple.com/news/upcoming-requirements/

### 11c. AI-Generated Content Disclosure

**Check:** If your app uses AI to generate content shown to users (chat, images, text):

**Fix (recent guideline):**
- If AI uses external services, show a consent modal specifying the provider and data types BEFORE any personal data is shared
- Clearly disclose that content is AI-generated
- Implement content moderation for AI outputs
- Provide mechanisms to report inappropriate AI content

### 11d. COPPA & Kids (Guideline 1.3)

**Check:** If your app targets or could be used by children under 13:

**Source:** https://developer.apple.com/app-store/kids-apps/

**Rules:**
- Cannot collect personal data from children without verifiable parental consent
- No third-party analytics or advertising in Kids category apps
- Must not include links out of the app or purchasing opportunities without a parental gate
- Creator apps must have a way for users to identify content exceeding the app's age rating


## 12. Technical Requirements

### 12a. API Security

**Check:** Ensure no API keys are hardcoded in client-side code:

```
grep -r "sk-\|api_key.*=.*['\"]|apiKey.*=.*['\"]|secret.*=.*['\"]|password.*=.*['\"]|token.*=.*['\"]" --include="*.ts" --include="*.tsx" | grep -v "node_modules\|.env\|config.ts"
```

**Fix:** All API keys must be stored in environment variables and accessed through edge functions, never embedded in the client app.

### 12b. Background Modes (Guideline 2.5.4)

**Check:** If your app declares background modes in Info.plist:

```
grep -A 5 "UIBackgroundModes" ios/*/Info.plist
```

**Fix:** Only declare background modes your app actually uses. Unused background mode declarations will cause rejection. Valid uses:
- `audio` — Music/podcast playback
- `location` — Turn-by-turn navigation
- `fetch` — Periodic content refresh
- `remote-notification` — Push notification processing

### 12c. Private API Usage

**Check:** Apple will scan your binary for private API calls.

**Fix:** Ensure no third-party libraries use private Apple APIs. Keep all dependencies up to date — older versions may use deprecated private APIs.

### 12d. Extensions & Widgets (Guidelines 2.5.16, 4.4)

**Rules if your app includes extensions or widgets:**
- Widgets, extensions, and notifications must be related to the app's core content/functionality
- No advertising in extensions, App Clips, widgets, notifications, keyboards, or watchOS apps
- Extensions cannot include marketing, advertising, or in-app purchases
- App Clips: all features must also exist in the main app binary

### 12e. SDK Version Requirements

**Rule:** Apple periodically requires apps to be built with the latest SDK. Do a web search for the current SDK deadline before submitting.

**Source:** https://developer.apple.com/news/upcoming-requirements/


## Pre-Submission Checklist

Run through this final checklist before hitting Submit:

### App Store Connect Metadata
- [ ] App name, subtitle, and description are accurate and complete
- [ ] Screenshots for all required device sizes (6.7", 6.5", 5.5" at minimum)
- [ ] Screenshots show actual app UI, not just splash/login screens
- [ ] App preview video (optional but recommended)
- [ ] Keywords set (100 characters max)
- [ ] Privacy Policy URL provided
- [ ] Support URL provided
- [ ] Age rating questionnaire completed accurately (check for new tiers)
- [ ] App Review contact info and notes provided
- [ ] Demo account credentials provided (if app requires login)
- [ ] Prices in metadata match actual in-app prices

### Build & Binary
- [ ] Release build compiles without warnings
- [ ] App tested on real device (not just simulator)
- [ ] App version and build number incremented
- [ ] Bundle ID matches App Store Connect
- [ ] All required device capabilities declared
- [ ] Minimum deployment target set appropriately
- [ ] Built with required SDK version

### Privacy & Legal
- [ ] PrivacyInfo.xcprivacy manifest present and complete
- [ ] All third-party SDK privacy manifests included
- [ ] All Info.plist usage descriptions are descriptive sentences
- [ ] Permissions requested just-in-time (not on launch)
- [ ] App Tracking Transparency implemented (if tracking)
- [ ] Account deletion available (if account creation exists)
- [ ] Privacy nutrition labels match actual data collection
- [ ] Terms of Service and Privacy Policy linked in-app AND in App Store Connect
- [ ] AI content consent modal shown (if using external AI services)

### Authentication
- [ ] Login only required if app has account-based features
- [ ] Guest/skip option available (if login not essential)
- [ ] Sign in with Apple offered (if any third-party login is used)
- [ ] Features not gated behind system permission grants

### Functionality
- [ ] No placeholder content anywhere
- [ ] No crashes on launch, navigation, or common flows
- [ ] Works on IPv6-only networks
- [ ] Works on slow/no network
- [ ] All features functional (no "coming soon" screens)
- [ ] Restore Purchases button present and working (if IAP used)
- [ ] Subscription terms clearly displayed (if applicable)

### User-Generated Content (if applicable)
- [ ] Content filtering/moderation in place
- [ ] Reporting mechanism for offensive content
- [ ] Ability to block abusive users
- [ ] Developer contact info accessible from within app

### Design
- [ ] App icon is 1024x1024 PNG, no transparency
- [ ] Launch screen configured
- [ ] Safe area respected on all screens
- [ ] Text readable at all dynamic type sizes
- [ ] Accessibility labels on interactive elements
- [ ] Minimum 44x44pt touch targets


**After submission:** Apple review typically takes 24-48 hours. If rejected, read the rejection notes carefully — they cite specific guideline numbers. Fix the cited issues and resubmit. You can reply to the reviewer in App Store Connect Resolution Center for clarification.

**If you need more details on any section,** do a web search for the specific guideline number (e.g., "Apple App Store Review Guideline 5.1.1") or visit the official sources listed at the top of this document.
