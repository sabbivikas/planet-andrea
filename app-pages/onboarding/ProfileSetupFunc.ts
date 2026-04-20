/**
 * Business logic for the ProfileSetup route (Step 1 of 3)
 */
import { useState, useEffect } from 'react';

import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { ProfileSetupProps } from '@/app/onboarding/profile-setup';
import { useImagePicker } from '@/comp-lib/assets/useImagePicker';
import { useAssetUpload } from '@/comp-lib/assets/useAssetUpload';
import { readProfile, updateProfile } from '@shared/profile-db';
import { updateUserAppProfile } from '@shared/planet-user-db';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 1;

/**
 * Interface for the return value of the useProfileSetup hook
 */
export interface ProfileSetupFunc {
  isLoading: boolean;
  avatarUri?: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  phoneError: boolean;
  currentStep: number;
  totalSteps: number;
  isFormValid: boolean;
  isAvatarSelected: boolean;
  onPickFromGallery: () => void;
  onFirstNameChange: (text: string) => void;
  onLastNameChange: (text: string) => void;
  onUsernameChange: (text: string) => void;
  onPhoneNumberChange: (text: string) => void;
  onHandleSubmit: () => void;
}

/**
 * Custom hook that provides business logic for the ProfileSetup component
 */
export function useProfileSetup(props: ProfileSetupProps): ProfileSetupFunc {
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | undefined>(undefined);

  const supabaseClient = useSupabaseClient();
  const { pickImageFromLibrary, currentImage } = useImagePicker();
  const { uploadAndUpdateProfileImage, assetUploading } = useAssetUpload();
  const hasNewImagePick = currentImage != null;

  const avatarUri = currentImage?.uri ?? existingAvatarUrl;
  const isAvatarSelected = avatarUri != null;
  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0 && username.trim().length >= 3 && phoneNumber.trim().length > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadExistingProfileAsync(): Promise<void> {
      try {
        const profile = await readProfile(supabaseClient);
        if (cancelled) return;
        if (profile?.givenName) {
          setFirstName(profile.givenName);
        }
        if (profile?.familyName) {
          setLastName(profile.familyName);
        }
        if (profile?.username) {
          setUsername(profile.username);
        }
        if (profile?.avatarUrl) {
          setExistingAvatarUrl(profile.avatarUrl);
        }
      } catch (error) {
        console.error('Failed to load existing profile:', error);
      }
    }

    loadExistingProfileAsync().catch((error) => {
      console.error('loadExistingProfile error:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [supabaseClient]);

  function onFirstNameChange(text: string): void {
    setFirstName(text);
  }

  function onLastNameChange(text: string): void {
    setLastName(text);
  }

  function onUsernameChange(text: string): void {
    setUsername(text.replace(/\s/g, '').toLowerCase());
  }

  function onPhoneNumberChange(text: string): void {
    setPhoneNumber(text);
    if (phoneError && text.trim().length > 0) {
      setPhoneError(false);
    }
  }

  function onPickFromGallery(): void {
    pickImageFromLibrary().catch((error) => {
      console.error('onPickFromGallery error:', error);
    });
  }

  function onHandleSubmit(): void {
    if (phoneNumber.trim().length === 0) {
      setPhoneError(true);
      return;
    }
    if (!isFormValid) return;

    handleSubmitAsync().catch((error) => {
      console.error('onHandleSubmit error:', error);
    });
  }

  async function handleSubmitAsync(): Promise<void> {
    setIsLoading(true);
    try {
      if (hasNewImagePick && currentImage != null) {
        await uploadAndUpdateProfileImage(currentImage);
      }
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const fullName = `${trimmedFirstName} ${trimmedLastName}`;
      await updateProfile(supabaseClient, {
        givenName: trimmedFirstName,
        familyName: trimmedLastName,
        fullName,
        username: username.trim(),
      });
      await updateUserAppProfile(supabaseClient, {
        phoneNumber: phoneNumber.trim(),
      });
      props.onNavigateNextPage?.();
    } catch (error) {
      console.error('Profile setup submit error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading: isLoading || assetUploading,
    avatarUri,
    firstName,
    lastName,
    username,
    phoneNumber,
    phoneError,
    currentStep: CURRENT_STEP,
    totalSteps: TOTAL_STEPS,
    isFormValid,
    isAvatarSelected,
    onPickFromGallery,
    onFirstNameChange,
    onLastNameChange,
    onUsernameChange,
    onPhoneNumberChange,
    onHandleSubmit,
  };
}
