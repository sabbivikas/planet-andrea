import html2canvas from 'html2canvas';
import { useCallback, useEffect, useRef } from 'react';

import { useReactInspectorContext } from '../provider/useReactInspectorContext.ts';
import { getReactData } from '../utils/react-fiber.utils.ts';
import type { ReactElementData } from '@shared/inspector/element-inspector-types.ts';
import {
  parseInspectorClearSelectionMessage,
  parseInspectorRemoveElementMessage,
  INSPECTOR_MESSAGE_TO_CLEAR_SELECTION_REQUEST,
  INSPECTOR_MESSAGE_TO_REMOVE_ELEMENT_REQUEST,
} from '../react-inspector-types.ts';
import {
  INSPECTOR_CLEAR_BUTTON_ATTR,
  createHoverOverlay,
  createSelectedOverlay,
} from './inspector-overlay-elements.ts';

type SelectedOverlayData = {
  overlay: HTMLDivElement;
  element: Element;
};

function generateSelectionId(): string {
  return `inspector-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useReactInspectorOverlay(): void {
  const { status, onElementSelected, onElementUnselected, onClearAllElements } = useReactInspectorContext();
  const hoverOverlay = useRef<HTMLDivElement | null>(null);
  const selectedOverlays = useRef<Map<string, SelectedOverlayData>>(new Map());
  const currentHoverElement = useRef<Element | null>(null);

  const getOrCreateHoverOverlay = useCallback((): HTMLDivElement => {
    if (hoverOverlay.current) return hoverOverlay.current;
    hoverOverlay.current = createHoverOverlay();
    return hoverOverlay.current;
  }, []);

  const removeSelectedOverlay = useCallback(
    (selectionId: string) => {
      const overlayData = selectedOverlays.current.get(selectionId);
      if (overlayData) {
        overlayData.overlay.remove();
        selectedOverlays.current.delete(selectionId);
        onElementUnselected(selectionId);
      }
    },
    [onElementUnselected],
  );

  const clearAllOverlays = useCallback(() => {
    for (const [_selectionId, overlayData] of selectedOverlays.current) {
      overlayData.overlay.remove();
    }
    selectedOverlays.current.clear();
    onClearAllElements();
  }, [onClearAllElements]);

  const updateHoverOverlayPosition = useCallback((rect: DOMRect) => {
    if (!hoverOverlay.current) return;
    hoverOverlay.current.style.left = `${rect.left}px`;
    hoverOverlay.current.style.top = `${rect.top}px`;
    hoverOverlay.current.style.width = `${rect.width}px`;
    hoverOverlay.current.style.height = `${rect.height}px`;
  }, []);

  const showHoverOverlay = useCallback(() => {
    const overlay = getOrCreateHoverOverlay();
    overlay.style.display = 'block';
  }, [getOrCreateHoverOverlay]);

  const hideHoverOverlay = useCallback(() => {
    if (hoverOverlay.current) {
      hoverOverlay.current.style.display = 'none';
    }
  }, []);

  const isElementAlreadySelected = useCallback((element: Element): boolean => {
    for (const overlayData of selectedOverlays.current.values()) {
      if (overlayData.element === element) {
        return true;
      }
    }
    return false;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const element = document.elementFromPoint(e.clientX, e.clientY);

      // Skip if no element or if it's part of inspector UI
      if (!element) return;
      if (element === hoverOverlay.current) return;
      if (element.closest('[data-element-id]')) return;
      if (element.hasAttribute(INSPECTOR_CLEAR_BUTTON_ATTR)) return;

      // Show overlay if it was hidden
      if (hoverOverlay.current?.style.display === 'none') {
        hoverOverlay.current.style.display = 'block';
      }

      currentHoverElement.current = element;
      const rect = element.getBoundingClientRect();
      updateHoverOverlayPosition(rect);
    },
    [updateHoverOverlayPosition],
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      // Hide overlay when mouse leaves the document/window
      const relatedTarget = e.relatedTarget as Node | null;
      if (!relatedTarget || !document.documentElement.contains(relatedTarget)) {
        hideHoverOverlay();
        currentHoverElement.current = null;
      }
    },
    [hideHoverOverlay],
  );

  const handleClick = useCallback(async () => {
    const elementToInspect = currentHoverElement.current;
    if (!elementToInspect) return;

    // Check if element is already selected
    if (isElementAlreadySelected(elementToInspect)) {
      return;
    }

    try {
      const elementComponentData = await getReactData(elementToInspect);

      // Always generate unique ID for each DOM element selection
      const selectionId = generateSelectionId();

      const elementCanvas = await html2canvas(elementToInspect as HTMLElement);
      const mimeType = 'image/png';
      const elementScreenshotData = elementCanvas.toDataURL(mimeType);
      const elementDataWithScreenshot: ReactElementData = {
        ...elementComponentData,
        screenshotImage: { mimeType, data: elementScreenshotData },
      };

      // Create selected overlay with clear button
      const rect = elementToInspect.getBoundingClientRect();
      const overlay = createSelectedOverlay(selectionId, rect, () => {
        removeSelectedOverlay(selectionId);
      });

      selectedOverlays.current.set(selectionId, {
        overlay,
        element: elementToInspect,
      });

      onElementSelected(selectionId, elementDataWithScreenshot);
    } catch (error) {
      console.error('Error capturing element data:', error);
    }
  }, [onElementSelected, isElementAlreadySelected, removeSelectedOverlay]);

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (status !== 'on') return;

      // Don't process clicks on inspector overlay clear buttons
      const target = e.target as HTMLElement;
      if (target.closest('[data-element-id]') || target.closest(`[${INSPECTOR_CLEAR_BUTTON_ATTR}]`)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      handleClick().catch((error) => {
        console.error('Error in handleClick:', error);
      });
    },
    [status, handleClick],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (status !== 'on') return;

      // Don't process mousedown on inspector overlay clear buttons
      const target = e.target as HTMLElement;
      if (target.closest('[data-element-id]') || target.closest(`[${INSPECTOR_CLEAR_BUTTON_ATTR}]`)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
    [status],
  );

  // Handle incoming messages from parent
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const clearEvent = parseInspectorClearSelectionMessage(event.data);
      if (clearEvent?.type === INSPECTOR_MESSAGE_TO_CLEAR_SELECTION_REQUEST) {
        clearAllOverlays();
        return;
      }

      const removeEvent = parseInspectorRemoveElementMessage(event.data);
      if (removeEvent?.type === INSPECTOR_MESSAGE_TO_REMOVE_ELEMENT_REQUEST) {
        removeSelectedOverlay(removeEvent.selectionId);
        return;
      }
    },
    [clearAllOverlays, removeSelectedOverlay],
  );

  useEffect(() => {
    if (status === 'on') {
      showHoverOverlay();
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', onClick, true);
      window.addEventListener('mousedown', handleMouseDown, true);
      window.addEventListener('message', handleMessage);
      window.addEventListener('mouseout', handleMouseOut);
      return () => {
        hideHoverOverlay();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', onClick, true);
        window.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('message', handleMessage);
        window.removeEventListener('mouseout', handleMouseOut);
      };
    } else {
      hideHoverOverlay();
      // Clear all selected overlays when inspector is turned off
      for (const overlayData of selectedOverlays.current.values()) {
        overlayData.overlay.remove();
      }
      selectedOverlays.current.clear();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('mouseout', handleMouseOut);
    }
  }, [
    status,
    showHoverOverlay,
    hideHoverOverlay,
    onClick,
    handleMouseDown,
    handleMouseMove,
    handleMessage,
    handleMouseOut,
  ]);
}
