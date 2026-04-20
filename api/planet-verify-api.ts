import { type SupabaseClient } from '@supabase/supabase-js';

import { uploadPrivateImage, getPrivateAssetUrl, type BaseImagePickerAsset } from './asset-api';
import type { uuidstr } from '@shared/generated-db-types';

export type { BaseImagePickerAsset };

const VERIFICATION_DOCUMENTS_BUCKET = 'verification-documents';

export async function uploadVerificationIdDocument(
  supabaseClient: SupabaseClient,
  userId: uuidstr,
  image: BaseImagePickerAsset,
): Promise<string> {
  const filePath = `${userId}/id_document_${Date.now()}`;
  const res = await uploadPrivateImage(supabaseClient, image, VERIFICATION_DOCUMENTS_BUCKET, filePath);
  return getPrivateAssetUrl(VERIFICATION_DOCUMENTS_BUCKET, res.path);
}

export async function uploadVerificationSelfie(
  supabaseClient: SupabaseClient,
  userId: uuidstr,
  image: BaseImagePickerAsset,
): Promise<string> {
  const filePath = `${userId}/selfie_${Date.now()}`;
  const res = await uploadPrivateImage(supabaseClient, image, VERIFICATION_DOCUMENTS_BUCKET, filePath);
  return getPrivateAssetUrl(VERIFICATION_DOCUMENTS_BUCKET, res.path);
}
