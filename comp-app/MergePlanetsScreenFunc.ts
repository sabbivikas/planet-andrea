import { useState, useEffect, useRef } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import {
  createMergeRequest,
  readMergeScreenData,
  updateMergeRequestStatus,
  readOrbitByMergeRequest,
} from '@shared/planet-merge-db';
import { type MergeScreenDataV1, type OrbitScreenDataV1, type uuidstr } from '@shared/generated-db-types';

export interface MergePlanetsScreenProps {
  /** ID of an existing merge request to load (from notification) */
  mergeRequestId?: string;
  /** Target group ID when opening via ⊕ button (creates a new merge request) */
  targetGroupId?: string;
  onClose: () => void;
  onOrbitApproved: (orbitData: OrbitScreenDataV1) => void;
}

export interface MergePlanetsScreenFunc {
  isLoading: boolean;
  screenData?: MergeScreenDataV1;
  isSubmitting: boolean;
  isOptimisticWaiting: boolean;
  toastMessage?: string;
  onCollide: () => void;
  onSolo: () => void;
}

const TOAST_DISMISS_DELAY_IN_MS = 2500;
const MERGE_POLL_INTERVAL_IN_MS = 3000;

export function useMergePlanetsScreen(props: MergePlanetsScreenProps): MergePlanetsScreenFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [screenData, setScreenData] = useState<MergeScreenDataV1 | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimisticWaiting, setIsOptimisticWaiting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);
  const mergeRequestIdRef = useRef<string | undefined>(props.mergeRequestId);
  const isMountedRef = useRef(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    isMountedRef.current = true;
    loadDataAsync().catch((err) => {
      console.error('useMergePlanetsScreen loadData error:', err);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    });
    return () => {
      isMountedRef.current = false;
      if (toastTimerRef.current != null) {
        clearTimeout(toastTimerRef.current);
      }
      stopPolling();
    };
  }, []);

  function stopPolling(): void {
    if (pollIntervalRef.current != null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = undefined;
    }
  }

  function startPollingForMerge(): void {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      pollMergeStatusAsync().catch((err) => {
        console.warn('useMergePlanetsScreen poll error:', err);
      });
    }, MERGE_POLL_INTERVAL_IN_MS);
  }

  async function pollMergeStatusAsync(): Promise<void> {
    const mergeRequestId = mergeRequestIdRef.current;
    if (mergeRequestId == null || !isMountedRef.current) return;

    const data = await readMergeScreenData(supabaseClient, mergeRequestId as uuidstr);
    if (!isMountedRef.current) return;

    if (data?.mergeRequest?.status === 'MERGED') {
      stopPolling();
      const orbitData = await readOrbitByMergeRequest(supabaseClient, mergeRequestId as uuidstr);
      if (!isMountedRef.current) return;
      if (orbitData != null) {
        props.onOrbitApproved(orbitData);
      }
    } else if (data?.mergeRequest?.status === 'DECLINED') {
      stopPolling();
      if (isMountedRef.current) {
        setScreenData(data);
      }
    }
  }

  async function loadDataAsync(): Promise<void> {
    let mergeRequestId = mergeRequestIdRef.current;

    // If no existing merge request, create one from targetGroupId
    if (mergeRequestId == null && props.targetGroupId != null) {
      const created = await createMergeRequest(supabaseClient, props.targetGroupId as uuidstr);
      if (created == null) {
        if (isMountedRef.current) setIsLoading(false);
        return;
      }
      mergeRequestId = created.id;
      mergeRequestIdRef.current = mergeRequestId;
    }

    if (mergeRequestId == null) {
      if (isMountedRef.current) setIsLoading(false);
      return;
    }

    const data = await readMergeScreenData(supabaseClient, mergeRequestId as uuidstr);
    if (!isMountedRef.current) return;
    setScreenData(data);
    setIsLoading(false);

    // If already in INITIATED state and we are the initiating group, start polling immediately
    if (data?.mergeRequest?.status === 'INITIATED' && data.isInitiatingGroup) {
      startPollingForMerge();
    }
  }

  function showToast(message: string): void {
    if (toastTimerRef.current != null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setToastMessage(undefined);
      }
    }, TOAST_DISMISS_DELAY_IN_MS);
  }

  function onCollide(): void {
    handleCollideAsync().catch((err) => {
      console.error('useMergePlanetsScreen onCollide error:', err);
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    });
  }

  async function handleCollideAsync(): Promise<void> {
    if (isSubmitting) return;

    // Optimistic fallback: show waiting state immediately so the tap registers visually
    setIsOptimisticWaiting(true);
    setIsSubmitting(true);

    let mergeRequestId = mergeRequestIdRef.current;

    // If create failed on load, retry it now
    if (mergeRequestId == null && props.targetGroupId != null) {
      const created = await createMergeRequest(supabaseClient, props.targetGroupId as uuidstr).catch((err) => {
        console.error('handleCollideAsync createMergeRequest error:', err);
        return undefined;
      });
      if (created != null) {
        mergeRequestId = created.id;
        mergeRequestIdRef.current = mergeRequestId;
      }
    }

    if (mergeRequestId == null) {
      // DB unavailable — keep optimistic waiting state visible so tap is confirmed visually
      setIsSubmitting(false);
      return;
    }

    if (!isMountedRef.current) return;

    // If screenData still not loaded, fetch it now
    let currentScreenData = screenData;
    if (currentScreenData == null) {
      currentScreenData = await readMergeScreenData(supabaseClient, mergeRequestId as uuidstr).catch((err) => {
        console.error('handleCollideAsync readMergeScreenData error:', err);
        return undefined;
      });
      if (currentScreenData != null && isMountedRef.current) {
        setScreenData(currentScreenData);
      }
    }

    if (currentScreenData == null) {
      setIsOptimisticWaiting(false);
      setIsSubmitting(false);
      return;
    }

    const isInitiating = currentScreenData.isInitiatingGroup;
    const newStatus = isInitiating ? 'INITIATED' : 'MERGED';

    const updated = await updateMergeRequestStatus(
      supabaseClient,
      mergeRequestId as uuidstr,
      newStatus,
    );

    if (!isMountedRef.current) return;

    if (updated == null) {
      setIsOptimisticWaiting(false);
      setIsSubmitting(false);
      return;
    }

    if (newStatus === 'MERGED') {
      // Approving group: load orbit data and navigate
      const orbitData = await readOrbitByMergeRequest(supabaseClient, mergeRequestId as uuidstr);
      if (!isMountedRef.current) return;
      if (orbitData != null) {
        props.onOrbitApproved(orbitData);
      }
    } else {
      // INITIATED: update UI state and start polling for the other group's approval
      setScreenData((prev) =>
        prev != null
          ? { ...prev, mergeRequest: prev.mergeRequest != null ? { ...prev.mergeRequest, status: 'INITIATED' } : prev.mergeRequest }
          : prev,
      );
      setIsSubmitting(false);
      showToast('Collision request sent! Waiting for them to approve 🚀');
      startPollingForMerge();
    }
  }

  function onSolo(): void {
    handleSoloAsync().catch((err) => {
      console.error('useMergePlanetsScreen onSolo error:', err);
    });
  }

  async function handleSoloAsync(): Promise<void> {
    const mergeRequestId = mergeRequestIdRef.current;
    stopPolling();
    if (mergeRequestId == null) {
      props.onClose();
      return;
    }

    await updateMergeRequestStatus(supabaseClient, mergeRequestId as uuidstr, 'DECLINED');
    if (!isMountedRef.current) return;

    showToast('Going solo tonight. 🌙');

    setTimeout(() => {
      if (isMountedRef.current) {
        props.onClose();
      }
    }, TOAST_DISMISS_DELAY_IN_MS);
  }

  return {
    isLoading,
    screenData,
    isSubmitting,
    isOptimisticWaiting,
    toastMessage,
    onCollide,
    onSolo,
  };
}
