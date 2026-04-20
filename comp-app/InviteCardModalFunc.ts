/**
 * Business logic for the InviteCardModal component
 */
import { useState } from 'react';
import { Platform, Share } from 'react-native';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import type { InviteCardData } from '@/app-pages/group/[groupId]/ResultsFunc';

// ── Constants ──

const TOAST_DURATION_IN_MS = 2500;
const CAPTURE_QUALITY = 1.0;
const CAPTURE_FORMAT = 'jpg';
const CAPTURE_SCALE = 2;
const DEEP_LINK_BASE = 'planet://group';

// ── Types ──

export interface InviteCardModalFuncProps {
  data: InviteCardData;
  onClose: () => void;
}

export interface InviteCardModalFuncReturn {
  toast?: string;
  isSaving: boolean;
  onSaveAsImage: (cardRef: RefObject<View | null>) => void;
  onShareImage: (cardRef: RefObject<View | null>) => void;
  onCopyLink: () => void;
  onClose: () => void;
}

// ── Helpers ──

async function captureCardAsync(cardRef: RefObject<View | null>): Promise<string> {
  const { captureRef } = await import('react-native-view-shot');
  if (cardRef.current == null) {
    throw new Error('Card ref not ready');
  }
  return captureRef(cardRef.current, {
    format: CAPTURE_FORMAT,
    quality: CAPTURE_QUALITY,
    result: 'tmpfile',
    snapshotContentContainer: false,
  });
}

// ── Hook ──

export function useInviteCardModal(props: InviteCardModalFuncProps): InviteCardModalFuncReturn {
  const [toast, setToast] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  function showToast(message: string): void {
    setToast(message);
    setTimeout(() => {
      setToast(undefined);
    }, TOAST_DURATION_IN_MS);
  }

  function onSaveAsImage(cardRef: RefObject<View | null>): void {
    if (Platform.OS === 'web') {
      showToast('Save not available on web');
      return;
    }
    saveAsImageAsync(cardRef).catch((err: unknown) => {
      console.error('onSaveAsImage error:', err);
      setIsSaving(false);
    });
  }

  async function saveAsImageAsync(cardRef: RefObject<View | null>): Promise<void> {
    setIsSaving(true);
    try {
      const MediaLibrary = await import('expo-media-library');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast('Camera roll permission required');
        return;
      }
      const uri = await captureCardAsync(cardRef);
      await MediaLibrary.saveToLibraryAsync(uri);
      showToast('Saved to camera roll 📸');
    } finally {
      setIsSaving(false);
    }
  }

  function onShareImage(cardRef: RefObject<View | null>): void {
    shareImageAsync(cardRef).catch((err: unknown) => {
      console.error('onShareImage error:', err);
    });
  }

  async function shareImageAsync(cardRef: RefObject<View | null>): Promise<void> {
    if (Platform.OS === 'web') {
      showToast('Share not available on web');
      return;
    }
    const uri = await captureCardAsync(cardRef);
    await Share.share(
      Platform.OS === 'ios'
        ? { url: uri }
        : { message: uri },
    );
  }

  function onCopyLink(): void {
    copyLinkAsync().catch((err: unknown) => {
      console.error('onCopyLink error:', err);
    });
  }

  async function copyLinkAsync(): Promise<void> {
    const Clipboard = await import('expo-clipboard');
    const deepLink = `${DEEP_LINK_BASE}/${props.data.groupId}`;
    await Clipboard.setStringAsync(deepLink);
    showToast('Link copied 🔗');
  }

  function onClose(): void {
    props.onClose();
  }

  return {
    toast,
    isSaving,
    onSaveAsImage,
    onShareImage,
    onCopyLink,
    onClose,
  };
}

