/**
 * Business logic for the Create route
 */
import { useState } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import { uploadProfileImage, type BaseImagePickerAsset } from '@/api/asset-api';
import { CreateProps } from '@/app/group/create';
import { useImagePicker } from '@/comp-lib/assets/useImagePicker';
import { t } from '@/i18n';
import { toUuidStr, type GroupVisibility } from '@shared/generated-db-types';
import { createGroup } from '@shared/planet-group-db';
import { PLANET_AVATAR_URLS, type PlanetAvatarType } from '@/comp-app/PlanetAvatar';

export type { GroupVisibility };
export type { PlanetAvatarType };

const GROUP_NAME_MIN_LENGTH = 1;
const GROUP_NAME_MAX_LENGTH = 30;
const MIN_GROUP_SIZE = 4;
const MAX_GROUP_SIZE = 20;
const DEFAULT_MAX_GROUP_SIZE = 12;
const DEFAULT_PLANET_AVATAR: PlanetAvatarType = 'A';

export interface VisibilityOption {
  value: GroupVisibility;
  label: string;
  hint: string;
}

/**
 * Interface for the return value of the useCreate hook
 */
export interface CreateFunc {
  isLoading: boolean;
  error?: Error;
  groupName: string;
  groupNameMaxLength: number;
  groupPhotoUri?: string;
  selectedPlanetAvatar: PlanetAvatarType;
  isUploadSelected: boolean;
  isOpenToStrangers: boolean;
  maxGroupSize: number;
  minGroupSize: number;
  maxGroupSizeLimit: number;
  visibility: GroupVisibility;
  visibilityOptions: VisibilityOption[];
  isFormValid: boolean;
  onGroupNameChange: (text: string) => void;
  onSelectPlanetAvatar: (type: PlanetAvatarType) => void;
  onSelectUpload: () => void;
  onToggleOpenToStrangers: (value: boolean) => void;
  onMaxGroupSizeChange: (value: number) => void;
  onVisibilityChange: (value: GroupVisibility) => void;
  onHandleCreate: () => void;
  onGoBack: () => void;
}

/**
 * Custom hook that provides business logic for the Create component
 */
export function useCreate(props: CreateProps): CreateFunc {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [groupName, setGroupName] = useState('');
  const [isOpenToStrangers, setIsOpenToStrangers] = useState(false);
  const [maxGroupSize, setMaxGroupSize] = useState(DEFAULT_MAX_GROUP_SIZE);
  const [visibility, setVisibility] = useState<GroupVisibility>('PRIVATE');
  const [selectedPlanetAvatar, setSelectedPlanetAvatar] = useState<PlanetAvatarType>(DEFAULT_PLANET_AVATAR);
  const [isUploadSelected, setIsUploadSelected] = useState(false);

  const { pickImageFromLibrary, currentImage } = useImagePicker();

  const groupPhotoUri = currentImage?.uri;
  const isFormValid = groupName.trim().length >= GROUP_NAME_MIN_LENGTH;

  const visibilityOptions: VisibilityOption[] = [
    {
      value: 'PUBLIC' as GroupVisibility,
      label: t('groupCreate.visibilityPublic'),
      hint: t('groupCreate.visibilityPublicHint'),
    },
    {
      value: 'PRIVATE' as GroupVisibility,
      label: t('groupCreate.visibilityPrivate'),
      hint: t('groupCreate.visibilityPrivateHint'),
    },
  ];

  function onGroupNameChange(text: string): void {
    const trimmed = text.length > GROUP_NAME_MAX_LENGTH ? text.slice(0, GROUP_NAME_MAX_LENGTH) : text;
    setGroupName(trimmed);
  }

  function onSelectPlanetAvatar(type: PlanetAvatarType): void {
    setSelectedPlanetAvatar(type);
    setIsUploadSelected(false);
  }

  function onSelectUpload(): void {
    setIsUploadSelected(true);
    pickImageFromLibrary().catch((pickError) => {
      console.error('onSelectUpload error:', pickError);
    });
  }

  function onToggleOpenToStrangers(value: boolean): void {
    setIsOpenToStrangers(value);
  }

  function onMaxGroupSizeChange(value: number): void {
    setMaxGroupSize(Math.round(value));
  }

  function onVisibilityChange(value: GroupVisibility): void {
    setVisibility(value);
  }

  function onGoBack(): void {
    props.onGoBack();
  }

  function onHandleCreate(): void {
    if (!isFormValid) return;
    handleCreateAsync().catch((createError) => {
      console.error('onHandleCreate error:', createError);
      setError(createError instanceof Error ? createError : new Error('Failed to create group'));
      setIsLoading(false);
    });
  }

  async function handleCreateAsync(): Promise<void> {
    setIsLoading(true);
    try {
      let photoUrl: string;

      if (currentImage != null) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const userId = session?.user?.id;
        if (userId == null) {
          throw new Error('No authenticated user found');
        }
        const imageAsset: BaseImagePickerAsset = {
          uri: currentImage.uri,
          base64: currentImage.base64,
          mimeType: currentImage.mimeType,
          fileName: currentImage.fileName,
          type: currentImage.type ?? undefined,
        };
        const uploadedPath = await uploadProfileImage(supabaseClient, toUuidStr(userId), imageAsset);
        photoUrl = uploadedPath ?? PLANET_AVATAR_URLS[selectedPlanetAvatar];
      } else {
        photoUrl = PLANET_AVATAR_URLS[selectedPlanetAvatar];
      }

      const group = await createGroup(supabaseClient, {
        name: groupName.trim(),
        photoUrl,
        isOpenToStrangers,
        maxGroupSize: isOpenToStrangers ? maxGroupSize : undefined,
        visibility,
      });

      props.onNavigateToGroupDetail({ groupId: group.id });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    groupName,
    groupNameMaxLength: GROUP_NAME_MAX_LENGTH,
    groupPhotoUri,
    selectedPlanetAvatar,
    isUploadSelected,
    isOpenToStrangers,
    maxGroupSize,
    minGroupSize: MIN_GROUP_SIZE,
    maxGroupSizeLimit: MAX_GROUP_SIZE,
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
  };
}
