/**
 * Business logic for the Verification route
 */
import { useState, useEffect, useRef } from 'react';

import { type BaseImagePickerAsset, uploadVerificationIdDocument, uploadVerificationSelfie } from '@/api/planet-verify-api';
import { supabaseClient } from '@/api/supabase-client';
import { VerificationProps } from '@/app/settings/verification';
import { useImagePicker } from '@/comp-lib/assets/useImagePicker';
import { t } from '@/i18n';
import type { VerificationStatus, uuidstr } from '@shared/generated-db-types';
import { readUserAppProfile } from '@shared/planet-user-db';
import { submitVerificationDocuments } from '@shared/planet-verify-db';

// ── Types ──

export type VerificationStep = 'uploadId' | 'selfie' | 'review';

export interface StepInfo {
  key: VerificationStep;
  label: string;
  stepNumber: number;
}

// ── Constants ──

const TOTAL_STEPS = 3;

const STEPS: StepInfo[] = [
  { key: 'uploadId', label: t('verification.stepUploadId'), stepNumber: 1 },
  { key: 'selfie', label: t('verification.stepSelfie'), stepNumber: 2 },
  { key: 'review', label: t('verification.stepReview'), stepNumber: 3 },
];

/**
 * Interface for the return value of the useVerification hook
 */
export interface VerificationFunc {
  isLoading: boolean;
  isSubmitting: boolean;
  error?: string;
  verificationStatus: VerificationStatus;
  currentStep: VerificationStep;
  steps: StepInfo[];
  totalSteps: number;
  currentStepNumber: number;
  idDocumentUri?: string;
  selfieUri?: string;
  onPickIdFromCamera: () => void;
  onPickIdFromGallery: () => void;
  onCaptureSelfie: () => void;
  onNextStep: () => void;
  onSubmitVerification: () => void;
  onRetry: () => void;
  onDone: () => void;
  onGoBack: () => void;
}

/**
 * Custom hook that provides business logic for the Verification component
 */
export function useVerification(props: VerificationProps): VerificationFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('NOT_STARTED');
  const [currentStep, setCurrentStep] = useState<VerificationStep>('uploadId');

  const {
    pickImageFromLibrary: pickIdFromLibrary,
    pickCameraImage: pickIdFromCamera,
    currentImage: idImage,
  } = useImagePicker();

  const {
    pickCameraImage: captureSelfieImage,
    currentImage: selfieImage,
  } = useImagePicker();

  const idDocumentUri = idImage?.uri;
  const selfieUri = selfieImage?.uri;

  const currentStepInfo = STEPS.find((s) => s.key === currentStep);
  const currentStepNumber = currentStepInfo?.stepNumber ?? 1;

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    loadVerificationStatusAsync().catch((err) => {
      console.error('loadVerificationStatus error:', err);
      setIsLoading(false);
    });
  }, []);

  async function loadVerificationStatusAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const userProfile = await readUserAppProfile(supabaseClient);
      const status = userProfile?.verificationStatus ?? 'NOT_STARTED';
      setVerificationStatus(status);

      if (status === 'PENDING' || status === 'VERIFIED' || status === 'FAILED') {
        setCurrentStep('review');
      }
    } catch (err) {
      console.error('Failed to load verification status:', err);
    } finally {
      setIsLoading(false);
    }
  }
  function onPickIdFromCamera(): void {
    pickIdFromCamera().catch((err) => {
      console.error('onPickIdFromCamera error:', err);
    });
  }

  function onPickIdFromGallery(): void {
    pickIdFromLibrary().catch((err) => {
      console.error('onPickIdFromGallery error:', err);
    });
  }

  function onCaptureSelfie(): void {
    captureSelfieImage().catch((err) => {
      console.error('onCaptureSelfie error:', err);
    });
  }

  function onNextStep(): void {
    if (currentStep === 'uploadId' && idDocumentUri != null) {
      setCurrentStep('selfie');
      setError(undefined);
    } else if (currentStep === 'selfie' && selfieUri != null) {
      setCurrentStep('review');
      setError(undefined);
    }
  }

  function onSubmitVerification(): void {
    if (idImage == null || selfieImage == null) {
      return;
    }
    handleSubmitAsync(idImage, selfieImage).catch((err) => {
      console.error('onSubmitVerification error:', err);
    });
  }

  function toBaseImagePickerAsset(asset: NonNullable<typeof idImage>): BaseImagePickerAsset {
    return {
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType,
      fileName: asset.fileName,
      type: asset.type ?? undefined,
    };
  }

  async function handleSubmitAsync(
    idDoc: NonNullable<typeof idImage>,
    selfie: NonNullable<typeof selfieImage>,
  ): Promise<void> {
    setIsSubmitting(true);
    setError(undefined);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user == null) {
        throw new Error('User not authenticated');
      }
      const userId = user.id as uuidstr;

      const idDocumentUrl = await uploadVerificationIdDocument(supabaseClient, userId, toBaseImagePickerAsset(idDoc));
      const selfieUrl = await uploadVerificationSelfie(supabaseClient, userId, toBaseImagePickerAsset(selfie));

      await submitVerificationDocuments(supabaseClient, idDocumentUrl, selfieUrl);

      setVerificationStatus('PENDING');
      setCurrentStep('review');
    } catch (err) {
      console.error('Verification submission error:', err);
      setError(t('errors.defaultMessage'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function onRetry(): void {
    setVerificationStatus('NOT_STARTED');
    setCurrentStep('uploadId');
    setError(undefined);
  }

  function onDone(): void {
    props.onNavigateToProfile();
  }

  function onGoBack(): void {
    props.onGoBack();
  }

  return {
    isLoading,
    isSubmitting,
    error,
    verificationStatus,
    currentStep,
    steps: STEPS,
    totalSteps: TOTAL_STEPS,
    currentStepNumber,
    idDocumentUri,
    selfieUri,
    onPickIdFromCamera,
    onPickIdFromGallery,
    onCaptureSelfie,
    onNextStep,
    onSubmitVerification,
    onRetry,
    onDone,
    onGoBack,
  };
}
