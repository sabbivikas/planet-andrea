/**
 * Web shim for @maplibre/maplibre-react-native (v11 API).
 * Metro aliases the native module to this file on web builds (see metro.config.js).
 * Implements the small API surface the app uses (Map, Camera, Marker)
 * on top of maplibre-gl JS. Native builds use the real MapLibre RN SDK.
 */
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { createContext, useContext, useRef, type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useApplyCamera, useGLMap, useGLMarker } from './MapLibre.webFunc';
import type { Map as GLMap } from 'maplibre-gl';

const MapContext = createContext<GLMap | null>(null);

export interface MapProps {
  mapStyle?: string;
  style?: ViewStyle | ViewStyle[];
  children?: ReactNode;
  // Interaction props accepted for API parity with the native SDK (web map is always non-interactive here).
  dragPan?: boolean;
  touchZoom?: boolean;
  doubleTapZoom?: boolean;
  doubleTapHoldZoom?: boolean;
  touchRotate?: boolean;
  touchPitch?: boolean;
  attribution?: boolean;
  logo?: boolean;
}

export function Map(props: MapProps): ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const map = useGLMap(containerRef, {
    mapStyle: props.mapStyle,
    attribution: props.attribution,
    logo: props.logo,
  });

  return (
    <View style={props.style}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MapContext.Provider value={map}>{props.children}</MapContext.Provider>
    </View>
  );
}

export interface CameraProps {
  initialViewState?: {
    center?: [number, number];
    zoom?: number;
  };
}

/** Applies the initial center/zoom to the parent map. Mirrors the native Camera API. */
export function Camera(props: CameraProps): ReactNode {
  const map = useContext(MapContext);
  useApplyCamera(map, props.initialViewState?.center, props.initialViewState?.zoom);
  return null;
}

export interface MarkerProps {
  lngLat: [number, number];
  children?: ReactNode;
}

/** Renders an arbitrary React Native view as a map marker. */
export function Marker(props: MarkerProps): ReactNode {
  const map = useContext(MapContext);
  const markerRef = useRef<HTMLDivElement | null>(null);
  useGLMarker(map, markerRef, props.lngLat);
  return <div ref={markerRef}>{props.children}</div>;
}
