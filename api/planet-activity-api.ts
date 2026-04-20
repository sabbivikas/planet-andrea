import { type SupabaseClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';

import { uploadPrivateImage, getPrivateAssetUrl } from './asset-api';

const ACTIVITY_IMAGES_BUCKET = 'activity-images';

/**
 * Opens the image picker and uploads the selected image to the activity-images bucket.
 * Returns the asset URL or undefined if the user cancelled.
 */
export async function uploadActivityImage(
  supabaseClient: SupabaseClient,
): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return undefined;
  }

  const asset = result.assets[0];
  const filePath = `activities/hero_${Date.now()}`;

  const uploadResult = await uploadPrivateImage(
    supabaseClient,
    {
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName,
      type: 'image',
    },
    ACTIVITY_IMAGES_BUCKET,
    filePath,
  );

  return getPrivateAssetUrl(ACTIVITY_IMAGES_BUCKET, uploadResult.path);
}
