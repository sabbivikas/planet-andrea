/**
 * Main container for the Create Group route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Camera, Check, Globe, Lock, X } from 'lucide-react-native';

import { t } from '@/i18n';
import { useResponsiveDesign } from '@/comp-lib/styles/useResponsiveDesign';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { CustomSwitch } from '@/comp-lib/core/custom-switch/CustomSwitch';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { KeyboardAvoidingWrapper } from '@/comp-lib/keyboard-avoiding-wrapper/KeyboardAvoidingWrapper';
import { useCreateStyles, type VisibilityOptionItemStyles } from './CreateStyles';
import { useCreate, type VisibilityOption, type GroupVisibility, type PlanetAvatarType } from './CreateFunc';
import { CreateProps } from '@/app/group/create';
import PlanetAvatar from '@/comp-app/PlanetAvatar';

const CAMERA_ICON_SIZE = 24;
const VISIBILITY_ICON_SIZE = 20;
const CHECK_ICON_SIZE = 14;
const CLOSE_ICON_SIZE = 24;
const NEAR_LIMIT_THRESHOLD = 5;

const AVATAR_OPTION_SIZE = 64;
const CHECKMARK_BADGE_SIZE = 16;
const PLANET_AVATAR_TYPES: PlanetAvatarType[] = ['A', 'B', 'C', 'D'];

// ── Avatar Selector ──

interface AvatarOptionProps {
  isSelected: boolean;
  onPress: () => void;
  children: ReactNode;
}

function AvatarOption(props: AvatarOptionProps): ReactNode {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        width: AVATAR_OPTION_SIZE,
        height: AVATAR_OPTION_SIZE,
        borderRadius: AVATAR_OPTION_SIZE / 2,
        borderWidth: props.isSelected ? 2 : 0,
        borderColor: '#CFFF47',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      {props.children}
      {props.isSelected && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: CHECKMARK_BADGE_SIZE,
            height: CHECKMARK_BADGE_SIZE,
            borderRadius: CHECKMARK_BADGE_SIZE / 2,
            backgroundColor: '#CFFF47',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={10} color="#2D2D2D" />
        </View>
      )}
    </Pressable>
  );
}

interface GroupAvatarSelectorProps {
  selectedPlanetAvatar: PlanetAvatarType;
  isUploadSelected: boolean;
  uploadedPhotoUri?: string;
  onSelectPlanetAvatar: (type: PlanetAvatarType) => void;
  onSelectUpload: () => void;
}

function GroupAvatarSelector(props: GroupAvatarSelectorProps): ReactNode {
  const isUploadCurrentlySelected = props.isUploadSelected || props.uploadedPhotoUri != null;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
      }}
    >
      {/* Upload option */}
      <AvatarOption
        isSelected={isUploadCurrentlySelected}
        onPress={props.onSelectUpload}
      >
        {props.uploadedPhotoUri != null ? (
          <Image
            source={{ uri: props.uploadedPhotoUri }}
            style={{ width: AVATAR_OPTION_SIZE, height: AVATAR_OPTION_SIZE, borderRadius: AVATAR_OPTION_SIZE / 2 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: AVATAR_OPTION_SIZE,
              height: AVATAR_OPTION_SIZE,
              borderRadius: AVATAR_OPTION_SIZE / 2,
              backgroundColor: '#243660',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#3a4a6b',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={CAMERA_ICON_SIZE} color="#FF5C4D" />
            <View style={{ marginTop: 4 }}>
              <CustomTextField
                styles={{
                  fontFamily: 'tt-autonomous-mono',
                  fontSize: 9,
                  color: 'rgba(255,245,236,0.6)',
                  letterSpacing: 0.3,
                }}
                title="UPLOAD"
              />
            </View>
          </View>
        )}
      </AvatarOption>

      {/* Planet avatar options */}
      {PLANET_AVATAR_TYPES.map((type) => (
        <AvatarOption
          key={type}
          isSelected={!isUploadCurrentlySelected && props.selectedPlanetAvatar === type}
          onPress={() => props.onSelectPlanetAvatar(type)}
        >
          <PlanetAvatar type={type} size={AVATAR_OPTION_SIZE} />
        </AvatarOption>
      ))}
    </View>
  );
}

// ── Visibility Option ──

interface VisibilityOptionItemProps {
  styles: VisibilityOptionItemStyles;
  option: VisibilityOption;
  isSelected: boolean;
  onPress: () => void;
}

function VisibilityOptionItem(props: VisibilityOptionItemProps): ReactNode {
  const isPublic = props.option.value === 'PUBLIC';

  return (
    <Pressable
      onPress={props.onPress}
      style={[props.styles.container, props.isSelected && props.styles.selectedContainer]}
    >
      <View style={props.styles.iconWrapper}>
        {isPublic ? (
          <Globe
            size={VISIBILITY_ICON_SIZE}
            color={props.isSelected ? props.styles.selectedIconColor : props.styles.iconColor}
          />
        ) : (
          <Lock
            size={VISIBILITY_ICON_SIZE}
            color={props.isSelected ? props.styles.selectedIconColor : props.styles.iconColor}
          />
        )}
      </View>
      <View style={props.styles.textContainer}>
        <CustomTextField
          styles={props.isSelected ? { ...props.styles.label, ...props.styles.selectedLabel } : props.styles.label}
          title={props.option.label}
        />
        <CustomTextField
          styles={props.isSelected ? { ...props.styles.hint, ...props.styles.selectedHint } : props.styles.hint}
          title={props.option.hint}
        />
      </View>
      <View style={props.styles.selectedIndicator}>
        {props.isSelected && (
          <Check size={CHECK_ICON_SIZE} color={props.styles.selectedIconColor} />
        )}
      </View>
    </Pressable>
  );
}

export default function CreateContainer(props: CreateProps): ReactNode {
  const {
    styles,
    headerStyles,
    groupNameInputStyles,
    switchStyles,
    sliderStyles,
    visibilityOptionStyles,
    createButtonStyles,
  } = useCreateStyles();

  const {
    isLoading,
    groupName,
    groupNameMaxLength,
    groupPhotoUri,
    selectedPlanetAvatar,
    isUploadSelected,
    isOpenToStrangers,
    maxGroupSize,
    minGroupSize,
    maxGroupSizeLimit,
    visibility,
    visibilityOptions,
    isFormValid,
    onGroupNameChange,
    onSelectPlanetAvatar,
    onSelectUpload,
    onToggleOpenToStrangers,
    onMaxGroupSizeChange,
    onVisibilityChange,
    onHandleCreate,
    onGoBack,
  } = useCreate(props);

  const { isPlatformWeb } = useResponsiveDesign();
  const ScrollWrapper = isPlatformWeb ? ScrollView : KeyboardAvoidingWrapper;

  const remainingChars = groupNameMaxLength - groupName.length;
  const isNearLimit = remainingChars <= NEAR_LIMIT_THRESHOLD && remainingChars >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader
        title={t('groupCreate.title')}
        showBackButton
        onGoBack={onGoBack}
        customHeaderStyles={headerStyles}
        LeftComponent={
          <CustomButton
            onPress={onGoBack}
            styles={headerStyles.backCustomButtonStyles}
            leftIcon={({ size, color }) => (
              <X size={size ?? CLOSE_ICON_SIZE} color={color} />
            )}
          />
        }
      />

      <View style={styles.container}>
        <ScrollWrapper contentContainerStyle={styles.scrollContent}>
          {/* Group Avatar Selector */}
          <View style={styles.section}>
            <GroupAvatarSelector
              selectedPlanetAvatar={selectedPlanetAvatar}
              isUploadSelected={isUploadSelected}
              uploadedPhotoUri={groupPhotoUri}
              onSelectPlanetAvatar={onSelectPlanetAvatar}
              onSelectUpload={onSelectUpload}
            />
          </View>

          {/* Group Name */}
          <View style={styles.section}>
            <CustomTextInput
              styles={groupNameInputStyles}
              placeholder={t('groupCreate.namePlaceholder')}
              value={groupName}
              onChangeText={onGroupNameChange}
              maxLength={groupNameMaxLength}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <View style={styles.inputMetaRow}>
              <CustomTextField styles={styles.sectionHint} title={t('groupCreate.nameHint')} />
              <CustomTextField
                styles={isNearLimit ? styles.characterCountNearLimit : styles.characterCount}
                title={`${groupName.length}/${groupNameMaxLength}`}
              />
            </View>
          </View>

          {/* Open to Strangers Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <CustomTextField styles={styles.toggleLabel} title={t('groupCreate.openToStrangers')} />
                <CustomTextField styles={styles.toggleHint} title={t('groupCreate.openToStrangersHint')} />
              </View>
              <CustomSwitch
                value={isOpenToStrangers}
                onValueChange={onToggleOpenToStrangers}
                styles={switchStyles}
              />
            </View>

            {/* Max Group Size Slider (conditional) */}
            {isOpenToStrangers && (
              <View style={styles.sliderContainer}>
                <CustomTextField styles={styles.sectionLabel} title={t('groupCreate.maxGroupSize')} />
                <CustomTextField styles={styles.sliderValueText} title={`${maxGroupSize}`} />
                <Slider
                  style={sliderStyles.slider}
                  minimumValue={minGroupSize}
                  maximumValue={maxGroupSizeLimit}
                  step={1}
                  value={maxGroupSize}
                  onValueChange={onMaxGroupSizeChange}
                  minimumTrackTintColor={sliderStyles.minimumTrackTintColor}
                  maximumTrackTintColor={sliderStyles.maximumTrackTintColor}
                  tapToSeek
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <CustomTextField styles={sliderStyles.labelText} title={`${minGroupSize}`} />
                  <CustomTextField styles={sliderStyles.labelText} title={`${maxGroupSizeLimit}`} />
                </View>
              </View>
            )}
          </View>

          {/* Visibility */}
          <View style={styles.section}>
            <CustomTextField styles={styles.sectionLabel} title={t('groupCreate.visibilityTitle')} />
            <View style={styles.visibilityContainer}>
              {visibilityOptions.map((option) => (
                <VisibilityOptionItem
                  key={option.value}
                  styles={visibilityOptionStyles}
                  option={option}
                  isSelected={visibility === option.value}
                  onPress={() => onVisibilityChange(option.value)}
                />
              ))}
            </View>
          </View>

          {/* Create Button */}
          <View style={styles.bottomSection}>
            <CustomButton
              styles={createButtonStyles}
              title={t('groupCreate.createButton')}
              onPress={onHandleCreate}
              disabled={!isFormValid || isLoading}
              isLoading={isLoading}
            />
          </View>
        </ScrollWrapper>
      </View>
    </SafeAreaView>
  );
}
