/**
 * Hook logic for the web MapLibre shim (see MapLibre.web.tsx).
 */
import { Map as GLMap, Marker as GLMarker, setWorkerUrl } from 'maplibre-gl';
import { useEffect, useState, type RefObject } from 'react';

// maplibre-gl v6 locates its web worker via import.meta.url, which in a Metro bundle
// points at the app bundle and 404s - so no tiles ever load. Serve the worker from
// the Expo public/ directory instead (copied from the maplibre-gl package).
setWorkerUrl('/maplibre-gl-worker.mjs');

export interface GLMapOptions {
  mapStyle?: string;
  attribution?: boolean;
  logo?: boolean;
}

/** Creates the maplibre-gl JS map once the container div is mounted. */
export function useGLMap(containerRef: RefObject<HTMLDivElement | null>, options: GLMapOptions): GLMap | null {
  const [map, setMap] = useState<GLMap | null>(null);
  const { mapStyle, attribution, logo } = options;

  useEffect(() => {
    if (!containerRef.current) return;
    const m = new GLMap({
      container: containerRef.current,
      style: mapStyle ?? 'https://tiles.openfreemap.org/styles/liberty',
      center: [0, 0],
      zoom: 1,
      interactive: false,
      attributionControl: attribution === false ? false : { compact: true },
    });
    if (logo === false) {
      m.on('load', () => {
        const logoEl = containerRef.current?.querySelector('.maplibregl-ctrl-logo') as HTMLElement | null;
        if (logoEl) logoEl.style.display = 'none';
      });
    }
    setMap(m);
    return () => {
      m.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return map;
}

/** Applies the initial center/zoom once the map exists. */
export function useApplyCamera(map: GLMap | null, center?: [number, number], zoom?: number): void {
  useEffect(() => {
    if (!map) return;
    if (center) map.setCenter({ lng: center[0], lat: center[1] });
    if (zoom != null) map.setZoom(zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
}

/** Attaches a marker element to the map at the given coordinate. */
export function useGLMarker(map: GLMap | null, markerRef: RefObject<HTMLDivElement | null>, lngLat: [number, number]): void {
  useEffect(() => {
    if (!map || !markerRef.current) return;
    const marker = new GLMarker({ element: markerRef.current })
      .setLngLat({ lng: lngLat[0], lat: lngLat[1] })
      .addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, markerRef, lngLat]);
}
