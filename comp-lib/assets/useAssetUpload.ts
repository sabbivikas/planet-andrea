import { useState } from 'react';

import { Session, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import * as ImagePicker from 'expo-image-picker';

import * as Assets from '@/api/asset-api';
import { toUuidStr } from '@shared/generated-db-types';
import { updateProfileImage } from '@shared/profile-db';

/**
 * Interface for the return value of the useAssetUpload hook
 */
export interface AssetUploadFunc {
  /**
   * Current user session if authenticated, undefined otherwise
   */
  session?: Session;

  /**
   * Updates the user's avatar image in their profile
   */
  updateAvatarImage: (avatarUrl?: string) => Promise<void>;

  /**
   * Uploads a profile image to storage and returns the upload path
   * @param profileImage Image asset to be uploaded
   * @returns Promise resolving to the upload path if successful
   */
  uploadProfileImage: (profileImage: ImagePicker.ImagePickerAsset) => Promise<string | undefined>;

  /**
   * Combines both uploading a profile image and updating the user's avatar
   */
  uploadAndUpdateProfileImage: (profileImage: ImagePicker.ImagePickerAsset) => Promise<string | undefined>;

  /**
   * Uploads a pair of daily images (front and back) to the social feed bucket
   */
  uploadDailyImages: (
    frontImage: ImagePicker.ImagePickerAsset,
    backImage: ImagePicker.ImagePickerAsset,
  ) => Promise<void>;

  /**
   * Retrieves contents from the daily pictures bucket with pagination
   */
  getBucketContents: (limit: number, offset: number) => Promise<any>;

  /**
   * Indicates whether an asset upload operation is currently in progress
   */
  assetUploading: boolean;

  /**
   * The path of the most recently uploaded asset, if available
   */
  uploadPath?: string;
}

export function useAssetUpload(): AssetUploadFunc {
  const [assetUploading, setAssetUploading] = useState(false);
  const [uploadPath, setUploadPath] = useState<string>();
  const supabaseClient = useSupabaseClient();
  const session = useSession();

  async function updateAvatarImage(avatarUrl?: string) {
    try {
      setAssetUploading(true);
      if (!session?.user) throw new Error('No user on the session!');

      await updateProfileImage(supabaseClient, avatarUrl);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setAssetUploading(false);
    }
  }

  async function uploadProfileImage(profileImage: ImagePicker.ImagePickerAsset): Promise<string | undefined> {
    try {
      setAssetUploading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const uploadPath = await Assets.uploadProfileImage(
        supabaseClient,
        toUuidStr(session.user.id),
        profileImage as Assets.BaseImagePickerAsset,
      );
      if (uploadPath) {
        // const assetUrl = Assets.getPrivateAssetUrl(Profile.AVATAR_BUCKET, uploadPath);
        setUploadPath(uploadPath);
        return uploadPath;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setAssetUploading(false);
    }
  }

  async function uploadAndUpdateProfileImage(profileImage: ImagePicker.ImagePickerAsset): Promise<string | undefined> {
    const uploadPath = await uploadProfileImage(profileImage);
    if (uploadPath) {
      await updateAvatarImage(uploadPath);
      return uploadPath;
    }
  }

  async function uploadDailyImages(frontImage: ImagePicker.ImagePickerAsset, backImage: ImagePicker.ImagePickerAsset) {
    try {
      setAssetUploading(true);
      if (!session?.user) throw new Error('No user on the session!');
      const fileName = `${session.user.id}_${new Date().getTime()}`;
      const frontFilename = `${fileName}_front`;
      const backFilename = `${fileName}_back`;
      let compatibleImage = {
        ...frontImage,
        mimeType: frontImage.mimeType ?? 'image/jpeg', // CameraCapturedPicture doesn't include mimeType
        fileName: `${frontFilename}.jpg`,
        type: 'image',
      };

      let uploadResult = await Assets.uploadPrivateImage(
        supabaseClient,
        compatibleImage,
        Assets.SOCIAL_FEED_BUCKET,
        `${frontFilename}`,
      );
      compatibleImage = {
        ...backImage,
        mimeType: backImage.mimeType ?? 'image/jpeg', // CameraCapturedPicture doesn't include mimeType
        fileName: `${backFilename}.jpg`,
        type: 'image',
      };
      uploadResult = await Assets.uploadPrivateImage(
        supabaseClient,
        compatibleImage,
        Assets.SOCIAL_FEED_BUCKET,
        `${backFilename}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setAssetUploading(false);
    }
  }

  async function getDailyPicturesBucketContent(
    limit: number,
    offset: number,
  ): Promise<Assets.StorageObjectListResponse> {
    if (!session?.user) throw new Error('No user on the session!');
    return await Assets.getBucketContentsByLatestDatePaginated(
      Assets.SOCIAL_FEED_BUCKET,
      supabaseClient,
      limit,
      offset,
    );
  }

  return {
    session: session ?? undefined,
    updateAvatarImage,
    uploadProfileImage,
    uploadAndUpdateProfileImage,
    uploadDailyImages,
    getBucketContents: getDailyPicturesBucketContent,
    assetUploading,
    uploadPath,
  };
}
