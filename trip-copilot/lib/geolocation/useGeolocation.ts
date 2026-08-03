'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LngLat } from '@/types';

export type GeoPermission = 'unknown' | 'granted' | 'denied' | 'unsupported' | 'error';

export interface GeoState {
  coords: LngLat | null;
  accuracyM: number | null;
  speedKmh: number | null;
  heading: number | null;
  updatedAt: number | null;
  permission: GeoPermission;
  message: string | null;
  watching: boolean;
}

const INITIAL: GeoState = {
  coords: null,
  accuracyM: null,
  speedKmh: null,
  heading: null,
  updatedAt: null,
  permission: 'unknown',
  message: null,
  watching: false,
};

/**
 * Sledovanie polohy cez Geolocation API prehliadača.
 *
 * Poznámka k iOS: Safari poskytuje polohu len keď je stránka v popredí.
 * Na pozadí sa sledovanie zastaví – appka to používateľovi povie
 * namiesto toho, aby predstierala presné dáta.
 */
export function useGeolocation(enabled: boolean) {
  const [state, setState] = useState<GeoState>(INITIAL);
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setState((s) => ({ ...s, watching: false }));
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState((s) => ({
        ...s,
        permission: 'unsupported',
        message: 'Tento prehliadač nevie zistiť polohu. Mapu môžeš používať bez nej.',
      }));
      return;
    }

    setState((s) => ({ ...s, watching: true, message: null }));

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          coords: [pos.coords.longitude, pos.coords.latitude],
          accuracyM: pos.coords.accuracy ?? null,
          speedKmh: pos.coords.speed !== null ? pos.coords.speed * 3.6 : null,
          heading: pos.coords.heading ?? null,
          updatedAt: Date.now(),
          permission: 'granted',
          message: null,
          watching: true,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState((s) => ({
          ...s,
          permission: denied ? 'denied' : 'error',
          watching: false,
          message: denied
            ? 'Poloha je zakázaná. Povoľ ju v Nastavenia → Safari → Poloha, alebo pokračuj bez nej – trasa a zastávky fungujú ďalej.'
            : 'Polohu sa nepodarilo zistiť. Skús to znova alebo pokračuj bez GPS.',
        }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }, []);

  useEffect(() => {
    if (enabled) start();
    else stop();
    return stop;
  }, [enabled, start, stop]);

  return { ...state, start, stop };
}
