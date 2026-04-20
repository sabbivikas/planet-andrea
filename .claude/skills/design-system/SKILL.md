---
name: design-system
description: ALWAYS invoke this skill before writing any UI component or making visual design, styling, layout, or UX changes. Covers iOS HIG, color usage, spacing, typography, accessibility (WCAG), responsive design, component usage, mobile UX patterns, safe areas, animations, and icon handling.
---
# Design System & Styling Guide

Essential rules for visual design, styling, layout, and UX in React Native/Expo applications.

## Directory Structure

The following directories are relevant for design and styling work:

app-pages/: Mirrors the directory structure of the "app" directory. It contains files associated with a route in the app directory. Custom components are not allowed in this directory, use "comp-app" below for them.
- {RouteName}Container.tsx: React native component that contains all content for "{route-name}.tsx". Uses same name but in CamelCase. Only contains the layout without styling or business logic - these are integrated via hooks.
- {RouteName}Styles.ts: Styling for "{RouteName}Container.tsx", exposed as a hook. You MUST NOT place any business logic here. Also, you MUST NOT define any custom components here, instead create them in "comp-app" or inside the main function of "{RouteName}Container.tsx".

comp-app/: Application specific components with styling and business logic. Use this directory when you need to create new custom components.
- {Component}.tsx: React native custom component without styling or business logic - these are integrated via hooks.
- {Component}Styles.ts: Styling for "{Component}.tsx", exposed as a hook.

comp-app/styles/: Use this directory to customize colors.
- DefaultColors.ts: The colors to be used across the whole app, using variations of the app's color palette. You may only change the colors and the shades, but not add new colors or use direct color values. If you need to add new colors use "CustomColors.ts".
- CustomColors.ts: Additional colors that are used across the app. You may only add colors that are not available in "DefaultColors.ts".

comp-lib/: A library of components with styling and business logic. Uses same structure as "comp-app". Treat all files inside this directory as read-only.

comp-lib/styles/: Contains all visual styling defaults for this app.
- Styles.ts: Defaults for styling, spacing, fonts.
- ColorPalette.ts: The color palette that defines all base colors.
- TypographyBasePresets.ts: Text presets regarding fonts and size.
- TypographyPresetStyles.ts: Text style presets based on the default fonts, colors and styles.

## App Design Vision

**IMPORTANT: This is a custom design prompt specifically crafted for this app. It takes the highest priority when making design decisions.** All styling choices — colors, typography, spacing, animations, component appearance — must align with this vision. When in doubt, refer back to this section.

Tinder's swipe satisfaction meets ESPN's live competition scoreboard with Discord's squad energy — this is a night-out command center, not a passive discovery feed. Activity cards are the undisputed stars: let vibrant venue photography bleed edge-to-edge while deal badges and group avatars float as urgent overlays with zero visual competition. Deploy the Coral accent exclusively on active states, selection rings, live presence indicators, and the vote battle interface — never dilute it across static decorative elements or passive UI chrome. Reserve the electric Volt Green strictly for primary CTAs demanding immediate action: 'Lock In Plan', 'Start Battle', 'Join Group'. The Deep Navy canvas creates a cinematic nightclub atmosphere; Cream surfaces punch through strategically for deal callouts, card faces, and moments of breathing room that prevent visual fatigue. The swipe screen is the signature moment: cards stack with dramatic depth shadows, venue imagery commands 70% of each card's real estate, and swiping triggers snappy 200ms spring animations with satisfying momentum. SpaceGrotesk headlines punch with competitive gaming energy and bold geometric character that feels like a live scoreboard; PlusJakartaSans body text stays crisp, social-friendly, and effortlessly readable against dark backgrounds. Layout stays confidently generous — large 48pt-minimum touch targets, bold card gutters, and zero cramped information density because this is swiping at a club, not scanning spreadsheets. When a plan locks in, celebrate with a triumphant burst animation that rewards the squad's collective decision. The emotional throughline: rapid-fire group decisions with the victorious energy of a championship bracket reveal.

## Application content rules

- The page should feel visually full, complete, and professionally crafted.
- Avoid overloading the page with unnecessary content or lengthy informational paragraphs. 
- No placeholders, "lorem ipsum" text, or incomplete sections
- IF adding new components OR functionality and no existing content available THEN use dummy content.
- IF example photos OR images needed (not icons, logos, badges) THEN
  use images from unsplash.com.
  IF no suitable images found use placeholder at "assets/images/placeholder.svg".
- MUST use "lucide-react-native" for all icons, logos, and badges. Import individual icon components in PascalCase: `import { ChevronDown, ArrowLeft, Eye } from 'lucide-react-native'`. Usage: `<ChevronDown size={20} color="#666" />`. Do NOT use "@expo/vector-icons" or any Expo icon families (Ionicons, Feather, AntDesign, MaterialIcons, FontAwesome, etc.).

## React Native Component rules

- Ensure layout follows best practices for mobile app design and UX.
- Pay attention to mobile layout principles such as vertical rhythm, visual hierarchy, and concise text.
- MUST NOT add styling (e.g., inline JSX or others) or function definitions in React Component. These belong in their own files.
- MUST NOT use inline functions in JSX, except when simply passing arguments to an existing handler (e.g., `onPress={() => handler(value)}`). All other handlers must be defined in "{RouteName}Func.ts".
- MUST NOT define inline options (e.g., for radio lists, selects, or checkboxes) in JSX. Instead, define them in "{RouteName}Func.ts" with properly typed values instead of generic `string`.
- MUST NOT define style types with `any`. Instead, MUST define them in "{RouteName}Styles.ts" and import them to "{RouteName}Container.tsx".

### Use of existing components

- Use custom React components from "comp-lib" and "comp-app" whenever possible instead of using 3rd party components or making new ones.
- MUST use `CustomTextField` or `CustomTextInput` for all text elements instead of `<Text>` or `<TextInput>`. If you can't use CustomTextField for certain cases (e.g., text nesting), you may use `<Text>` only with `allowFontScaling={false}`.
- Reuse code!
- IF new React Native components needed AND the component logic is more than a few lines OR reused across multiple pages THEN
  * Put into "comp-app" directory, using the proper file naming patterns.
  * Make one file for the component, business logic hook and styling hook and define them in new "{Component}.tsx", "{Component}Func.ts", "{Component}Styles.ts" files.
  ELSE IF the component logic only requires a few lines AND is only used within that page THEN
  * Define it outside the main component in "{RouteName}Container.tsx".
  * It MUST define its own explicitly typed SubComponentStyles interface in "{RouteName}Styles.ts", import it into "{RouteName}Container.tsx", and pass it via props from the main component (never `any`).
  Example:
  ```
  import { type SubComponentStyles } from ""{RouteName}Styles.ts"";
  interface SubComponentProps { styles: SubComponentStyles; ... }
  function SubComponent(props: SubComponentProps): ReactNode { return <View style={styles.container}>...</View>; }
  function MainComponent(): ReactNode { const { styles, subComponentStyles } = useMainComponentStyles(); return (<View style={styles.container}><SubComponent styles={subComponentStyles} /></View>); }
  ```
- IF using `CustomButton` component THEN MUST NOT add children to it (it cannot wrap other elements).
- Button title and placeholders MUST be very short and concise, e.g., use just "skip" instead of "Skip for now".
- Use checkboxes instead of buttons UNLESS text is very small and fits into button container.
- Profile photo upload supports only one image. Do not include multiple uploads or previews.
- IF adding colored badges, tags, chips, or category labels THEN MUST ensure text has sufficient contrast against the background (4.5:1 minimum). Use dark text on light tint backgrounds rather than white text on medium-saturation colors.

### Navigation & context

- Include clear primary and secondary actions (e.g. "Continue" and "Back").
- Show the user's location in multi-step flows (e.g., "Step 2 of 4" or progress bar).
- Provide escape navigation actions/buttons (cancel, back, close) where appropriate.
- IF showing lists and feeds THEN make entire list item tappable to navigate to detail page AND MUST NOT add extra navigation buttons on list items.
- IF page is a detail page (e.g. of a feed showing individual feed item details) THEN add "back button" to trigger navigation action (if available).
- IF page already has a navigation header with back button (e.g. in Onboarding component) THEN MUST NOT add back button at page bottom.
- MUST NOT use two titles per page. IF page has title (e.g. onboarding pages) THEN customize title instead of adding another one.
- MUST NOT hardcode or invent app name anywhere. IF page needs app name THEN MUST get the translated app name using `t('app.name')` from "@/i18n/index.ts".

### Expo Router Tabs

- MUST wrap the `Tabs` component in `TabSafeAreaWrapper` to prevent double bottom safe area padding. The tab bar already handles the bottom safe area inset, so child pages must not apply it again. Do not remove this wrapper.
- MUST NOT wrap `Tabs.Screen` components in React Fragments (`<>...</>`) or any other wrapper elements. Expo Router's `Tabs` component requires `Tabs.Screen` as direct children to properly detect screens and maintain tab order. Wrapping screens in fragments causes icons to not render and tabs to appear in the wrong order.
- To conditionally render or reorder tabs, use inline conditional expressions (`{condition && <Tabs.Screen ... />}`) on individual screens instead of wrapping groups in fragments with ternaries.

### User education & assistance

- Include brief explanations for domain-specific terminology.
- Show helper text for complex inputs, ideally as placeholder text where it makes sense.
- Indicate where to find additional information (tooltips, info icons, etc.).

### Text handling & readability

- Ensure all essential information fits within a single, well-structured layout. 
- Balance information density with readability (avoid cramming).
- Use concise text and clear instructions. Elements with larger text need to use a more concise writing style or a smaller font size.
- MUST avoid redundant text. e.g. IF an input has a section title THEN skip the label and instead use placeholder text.
- Eliminate any duplicated or redundant text to maintain clarity and a clean visual hierarchy.
- Set reasonable character limits for single-line elements.
- For longer descriptive text, show 1-2 lines with "Read more" expansion if needed,
- Implement responsive text wrapping to prevent content from extending beyond the screen width.
- Design flexible layouts that accommodate varying text lengths.
- Use multi-line layouts for list items that contain descriptive text.
- Left-align text if possible.
- Consider how text will appear when translated to languages with longer word lengths.
- IF translation for text is present in "i18n/locales/en.lib.json" THEN integrate it using `t` from "@/i18n/index.ts" ELSE put text directly. MUST NOT attempt to add new entries to "i18n/locales/en.lib.json", this file is readonly. Instead, add new english entries to "i18n/locales/en.app.json", even if the application is using a different language.
- IF showing a form THEN include all relevant fields with proper input types and validation state.
- IF data is invalid or missing THEN use defaults, placeholders, or hide the content.
- All displayed values must be properly sanitized. MUST NOT show `NaN`, `undefined`, `null`, or broken formatting to the user. 
- Custom display logic is allowed, but must ensure the output is always readable and safe. 
- Do not use HTML entities or escape characters. Use straight quotes and apostrophes instead of encoded symbols like `&#39;` or `&amp;`. 
- Wrap any string containing characters that could cause JSX syntax errors (e.g., apostrophes, quotes, angle brackets) in `{""}` to avoid React Native lint errors.
  Example: `<CustomTextField title={"Don’t worry"} ... />`

### Image and icon handling

- Add text only when necessary, use icon-only elements for commonly recognized actions or symbols without adding extra labels.
- Always wrap icons in a `<View>` with explicit `width` and `height` to ensure proper layout and prevent overflow.

### Animation

- IF the element has animation THEN add `Animated` to it (e.g., `<Animated.View>`).

### Safe area handling

- MUST render `SafeAreaView` without `OptionalWrapper` so it is rendered on web.
- IF the screen has a hero image or its first element is an image that should extend into the safe area THEN leave out `SafeAreaView` entirely and instead apply `paddingTop: insets.top` to the first element that contains interactive content to ensure all screen controls and interactive components have sufficient vertical spacing to position them below the safe area.

### Welcome / Get Started screen (`/index` route)

- The welcome screen MUST fit entirely within a single screen without scrolling. Keep it simple: hero image, app icon, app name, tagline, a short one-line description, and both CTA buttons ("Get Started" and "Already Have an Account"). MUST NOT add feature cards, highlights, bullet lists, or any extra content beyond these core elements.
- Use the hero image as a full-width background image covering the top portion of the screen (no more than 40% of screen height) rather than placing it as a standalone inline element. This saves vertical space and creates a more polished, native feel.
- Use compact spacing between elements and concise text to ensure everything fits comfortably on smaller devices.
- The CTA buttons MUST be pinned at the bottom of the screen using flex layout (`flex: 1` on the content area with `justifyContent: 'flex-end'` or `marginTop: 'auto'` on the buttons container) so they remain fully visible regardless of content length.
- **Sub-pixel gap prevention:** Browser scaling can cause sub-pixel rendering gaps (visible hairlines) between adjacent views. To prevent this, always set an explicit `backgroundColor: colors.primaryBackground` on content containers that sit directly below image/hero sections. A negative `marginTop: -1` alone is not enough — the overlapping region must actively paint its background to cover the seam.

### Layout adaptability

- Structure all UI elements within a clear and consistent layout optimized for mobile apps.
- For items with similar structure, maintain consistent height handling (all single line or all multi-line).
- Use appropriate containers that can expand vertically rather than fixed-height elements.
- Use scroll views where content can overflow the screen vertically.
- Allow critical information to wrap rather than truncate.
- AVOID Web-like patterns that don't feel native to mobile.
- AVOID dropdown/select components for filters and options. They feel web-like and are not mobile-friendly. Instead, use mobile-native alternatives such as segmented controls, horizontal scrollable pill/chip selectors, or tab bars. Dropdowns ARE acceptable for form inputs (e.g., onboarding pages, settings forms, profile editing) where the user is selecting from a long list of predefined values. 
- AVOID "Drag & Drop" upload areas, use a button that opens the file picker instead.

## React Native Styling rules

- Changes to the styling MUST NOT break the existing functionality.
- Design polished, native-feeling interfaces following iOS Human Interface Guidelines.
- AVOID adjusting the per-screen background color. Create depth through translucency, layering, borders, and accents instead.

### Design direction

- Start with intent: understand who the user is and the core task each screen serves.
- Commit to a strong aesthetic stance — whether that's stripped-back minimalism, bold maximalism, retro-futurism, organic warmth, high-end refinement, playful irreverence, editorial precision, raw brutalism, geometric art deco, soft pastels, or utilitarian grit.
- Every screen should feel intentional: let the content lead, keep chrome invisible, and use visual layering to communicate importance.
- Design for the hand first: optimize for touch targets, thumb reachability, at-a-glance readability, and fluid adaptation across screen sizes.

### iOS Human Interface Guidelines

- Use `expo-linear-gradient` for tasteful gradients.
- Backgrounds should create atmosphere and depth, not just be flat solid colors. Layer subtle gradients, use geometric patterns, or add contextual effects that match the app's aesthetic (e.g., soft radial gradient behind hero content, subtle texture on card surfaces).
- Build depth by overlapping semi-transparent surfaces to convey importance and structure.
- Apply expo-blur's BlurView to create soft, frosted backdrop effects behind content.

### Interaction design

- Clearly indicate interactive vs static elements.
- Show explicit selection states (selected/unselected) for toggles, checkboxes, radio buttons.
- Show loading states where relevant.

### Visual hierarchy & consistency

- Ensure spacing, alignment, and contrast are aligned with best design principles for clarity and aesthetic polish.
- Maintain logical heading hierarchy.
- Balance button sizes according to importance and usage frequency.
- Style buttons with clear visual distinction between *primary*, *secondary*, and *tertiary* actions.
- The `CustomButton` component already comes pre-styled and rarely needs customization.
- Apply consistent typography styles (`typographyPresets`) based on element importance.
- Use typography to create dramatic visual hierarchy. Apply extreme weight contrasts (100–200 vs 800–900 weights, not 400 vs 600) and bold size jumps between headings and body text. Timid, incremental sizing (e.g. 20→18→16) looks generic — create clear separation between hierarchy levels.
- When the design system provides multiple fonts, use them with purpose: display/decorative font for hero elements and headings, body font for readable content. Pick one distinctive font and use it decisively.
- Ensure card components have distinct boundaries and appropriate padding to create depth and separation between content sections.

### Spacing

- Avoid excessive vertical whitespace. Make sure the page feels complete and visually intentional.
- Use the app's `spacingPresets` for all spacing decisions, with a minimum of `spacingPresets.xs`.
- Check existing component margins/padding before adding spacing — only add where visual gaps exist and existing styles don't already provide separation.
- MUST add consistent vertical spacing between sibling cards, sections, and content containers. Adjacent cards or content blocks without visible gaps look broken.
- Define spacing in one place per component relationship — either on the parent container or child elements, not both.

### Accessibility

- YOU MUST follow WCAG recommendations and enforce sufficient contrast ratios (4.5:1 minimum for text).
- AVOID low contrast ratios when rendering any text on solid background, e.g. when rendering icons with background and text or icons as content.
- For colored UI elements (badges, tags, chips, category labels): use dark text on light/pastel backgrounds, NOT white or light text on medium-saturation colors. White text is only acceptable on sufficiently dark backgrounds (e.g. brightness below 40%).
  * Common violation: white text on medium green, blue, or orange backgrounds — this FAILS contrast requirements. Instead, use a dark shade of the color for the text and a light tint for the background.
- Accent-colored elements (icons, borders, indicators, active states) placed on light backgrounds MUST use `primaryAccentDark` rather than `primaryAccent` or `primaryAccentLight` to ensure sufficient visual weight. Bright or medium accent colors on light backgrounds appear washed out and lack visual presence.
- Design with color-blind users in mind (don't rely solely on color).

### Responsiveness & context

- Ensure the page fits within a standard mobile viewport without horizontal scrolling. Responsive design and Safe areas are already handled by the framework.
- If you're using a horizontal-only scroll view, make sure that `flexGrow: 0` is set on the the container style so the scroll view does not grow vertically.
- IF header has multiple icon buttons THEN distribute them evenly on left/right sides to keep the title centered, with each side not exceeding `60px` width.
- When layout elements use vertical `flex`, put main content in `flex: 1` to push the button to the bottom. Don't add vertical gaps above the button

### Motion & interaction

- Use `react-native-reanimated` for smooth 60fps animations.
- Add `expo-haptics` on meaningful interactions.
- Focus animation budget on high-impact moments: one well-orchestrated page load with staggered reveals (items fading/sliding in with increasing delay) creates more delight than scattered micro-interactions. Use staggered entry animations for list items and card grids to make screens feel alive on first render.
- Design for touch: 44pt minimum touch targets, thumb-zone awareness, glanceability.

### Color & Theming

- Use color purposefully for branding, feedback, and emphasis (not just decoration).
- Use shadows to reinforce the depth hierarchy (canvas → surface → elevated). Cards, sheets, and modals should cast shadows to lift off the layer beneath them.
  * Always define BOTH iOS shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) AND Android `elevation` together.
  * On iOS, tint `shadowColor` to match the brand or content for a polished look (e.g. a card with a blue accent casts a subtle blue shadow). Android ignores `shadowColor` and falls back to default gray elevation — this is fine.
  * Scale shadow intensity with elevation: light shadows (`shadowOpacity` ~0.08, `elevation` 2) for surface cards, stronger shadows (`shadowOpacity` ~0.15–0.25, `elevation` 4–8) for modals and popovers.
- MUST NOT use any combination of `primaryAccent`, `primaryAccentDark`, and `primaryAccentLight` for both background and foreground. These are all variations of the same accent hue and will always produce poor contrast ratios when layered (e.g., `primaryAccentLight` background with `primaryAccent` text, or `primaryAccent` background with `primaryAccentDark` text). Instead, always pair an accent background with its designated foreground color: use `primaryAccentForeground` for text/icons on any accent-colored background to ensure readability and proper visual contrast.
- On light backgrounds, use `primaryAccentDark` for small elements that need visual prominence (icons, active states, accent borders, text highlights). Use `primaryAccent` or `primaryAccentDark` with `primaryAccentForeground` text for filled card or container backgrounds. Use `primaryAccentLight` only for subtle tinted backgrounds or muted highlights. On dark backgrounds, prefer `primaryAccent` or `primaryAccentLight` instead.

### What to avoid

- Generic "AI-generated" aesthetics: evenly-distributed timid color usage, safe/predictable component styling, and designs that look interchangeable across different apps. Every screen should feel like it was designed specifically for THIS app's context and audience.
- Clichéd purple gradients on white backgrounds
- Predictable layouts and cookie-cutter patterns
- Excessive vertical space at the bottom of the screen

### Style usage

- IF styling custom or core components THEN MUST use their own styling hooks.
- IF using `CustomButton` OR `CustomTextInput` THEN MUST get preset styles from `useStyleContext`. 
  ELSE IF using other custom or core components THEN MUST use component's styling hook to get default styles AND then override them using `overrideStyles` function.
  Example for `CustomButton` custom styling: 
  ```
  const customButtonStyles = useCustomButtonStyles();
  const customStyles = overrideStyles(customButtonStyles, {styles: {container: {...},icon: {...}}, pressedIcon: {...},...});
  ```
- IF setting any styles of custom or core component THEN MUST use `overrideStyles` for it.
- IF overriding styles THEN
  * Import required types from "comp-lib" into "{RouteName}Styles.ts" components (for better typing and to avoid runtime errors). 
  * MUST NOT use the `any` type.
  * MUST NOT force-cast style objects with `as` (e.g. `{} as SomeStyles`), instead use the actual style preset or hook (e.g. `buttonPresets.Secondary`, `useCustomHeaderStyles()`, etc.).
- IF overriding `*BaseStyles` of custom component THEN extract it from style hook. Example:
  ```
  const defaultHeaderStyles = useCustomHeaderStyles();
  const customHeaderBaseStyles = overrideStyles(defaultHeaderStyles, {container: {...}, title: {...}});
  ```
- IF overriding `fontSize` THEN also set `lineHeight` with _fixed number_ >= new `fontSize` AND NOT using expression like `fontSize * 1.2`.
- Only use `flex:1` when a component needs to grow and fill remaining space. Never use it on `CustomButton`.
- IF actions are critical (e.g. delete or cancel actions) THEN style them as a warning.
  ELSE style other actions (e.g. "Sign Out" button) in neutral color like for a secondary button.
- IF using icons/avatars, fixed-dimension cards, media with aspect ratios, navigation elements, or pixel-perfect design requirements THEN set explicit width.
  ELSE let elements naturally expand to full container width and avoid fixed width values unless absolutely necessary: use `flex: 1` for equal distribution, `width: '100%'` for full width, `minWidth`/`maxWidth` for controlled flexibility.
- IF dimension calculations require screen width/height THEN read them from `useResponsiveDesign`.
- IF implementing layouts with multiple columns THEN use dimensions from `useResponsiveDesign`.
