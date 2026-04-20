import { SupabaseClient } from '@supabase/supabase-js';

import type { Database, VerificationDocumentV1, uuidstr } from './generated-db-types.ts';

export async function submitVerificationDocuments(
  supabaseClient: SupabaseClient<Database>,
  idDocumentUrl: string,
  selfieUrl: string,
): Promise<VerificationDocumentV1> {
  const res = await supabaseClient.rpc('app:planetVerify:submit', {
    idDocumentUrl,
    selfieUrl,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readVerificationDocument(
  supabaseClient: SupabaseClient<Database>,
): Promise<VerificationDocumentV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetVerify:read');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function adminReviewVerification(
  supabaseAdminClient: SupabaseClient<Database>,
  documentId: uuidstr,
  approved: boolean,
): Promise<void> {
  const res = await supabaseAdminClient.rpc('admin:planetVerify:review', {
    documentId,
    approved,
  });
  if (res.error) {
    throw res.error;
  }
}
