'use client';

import { useMemo } from 'react';
import type { PoiCategory, PoiWithGeoContext, PointOfInterest } from '@/types';
import { POINTS_OF_INTEREST } from '@/data/poi';
import { ACCOMMODATIONS } from '@/data/accommodations';
import { useTripPosition, type TripPosition } from '@/hooks/useTripPosition';
import { useAppState } from '@/lib/storage/app-state';
import {
  etaMinutesForKm,
  haversineKm,
  makeRouteScaler,
  projectOntoRoute,
} from '@/lib/calculations/geo';

export interface AheadFilters {
  maxDetourMinutes: number | null;
  maxStopMinutes: number | null;
  categories: PoiCategory[];
  onlyCatFriendly: boolean;
}

export const DEFAULT_FILTERS: AheadFilters = {
  maxDetourMinutes: null,
  maxStopMinutes: null,
  categories: [],
  onlyCatFriendly: false,
};

/**
 * Body pred nami.
 *
 * Nepoužívame len vzdušnú vzdialenosť. Každý bod najprv premietneme na trasu,
 * čím zistíme jeho poradie (kilometer trasy). Bod je „pred nami“, keď jeho
 * kilometer na trase je väčší než náš aktuálny. Body, ktoré sme už minuli,
 * v zozname nie sú.
 *
 * Zachádzka = kombinácia deklarovaného odhadu a skutočnej vzdialenosti bodu
 * od trasy. Presnejšie čísla vie dať Mapbox Directions/Matrix API – to je
 * pripravené ako ďalší krok, aby prvá verzia nepotrebovala žiadne volania.
 */
export function usePoisAhead(filters: AheadFilters = DEFAULT_FILTERS): {
  position: TripPosition;
  all: PoiWithGeoContext[];
  ahead: PoiWithGeoContext[];
  filtered: PoiWithGeoContext[];
} {
  const position = useTripPosition();
  const { state } = useAppState();

  const all = useMemo<PoiWithGeoContext[]>(() => {
    const { route, progressKm, coords } = position;
    const scaler = makeRouteScaler(route.geometry, route.distanceKm);
    const direction = state.settings.direction;

    const basePois = POINTS_OF_INTEREST.filter(
      (poi) => !poi.directions || poi.directions.includes(direction),
    );

    // Nocľah v Rakúsku (len cesta späť) nie je v POINTS_OF_INTEREST, lebo je
    // to živý, editovateľný bod (jeho adresa sa mení, keď si používateľ
    // vyberie/doplní ubytovanie). Syntetizujeme ho tu, nech sa objaví ako
    // reálna zastávka aj na obrazovke Pred nami, nielen ako banner na mape.
    const overnightPoi: PointOfInterest | null = (() => {
      if (direction !== 'spat') return null;
      let waypoint = null;
      for (const seg of route.segments) {
        const wp = seg.waypoints.find((w) => w.note?.includes('Nocľah'));
        if (wp) {
          waypoint = wp;
          break;
        }
      }
      if (!waypoint) return null;

      const austriaBase = ACCOMMODATIONS.find((a) => a.id === 'acc-austria');
      const override = state.accommodationOverrides['acc-austria'];
      const isConfirmed = override?.status === 'potvrdene';

      return {
        id: 'acc-austria-stop',
        name: isConfirmed && override?.name ? override.name : waypoint.name,
        category: 'noclah',
        region: 'Rakúsko',
        country: 'AT',
        coords: waypoint.coords,
        detourMinutes: 0,
        stopMinutes: 0,
        catFriendly: true,
        parking: true,
        isMockData: false,
        note:
          isConfirmed && override?.address
            ? override.address
            : (waypoint.note ?? austriaBase?.notes),
        directions: ['spat'],
      };
    })();

    const withOvernight = overnightPoi ? [...basePois, overnightPoi] : basePois;

    return withOvernight.map((poi) => {
      const projection = projectOntoRoute(route.geometry, poi.coords, scaler.cumulative);
      const routeProgressKm = scaler.toRouteKm(projection.progressKm);
      const distanceAlongRoute = routeProgressKm - progressKm;

      // Vzdialenosť k bodu: po trase + odbočka z trasy k bodu.
      const distanceToUserKm = coords
        ? Math.max(0, distanceAlongRoute) + projection.distanceFromRouteKm
        : Math.abs(distanceAlongRoute);

      // Zachádzka: tam aj späť z trasy, minimálne deklarovaný odhad.
      const detourFromDistance = etaMinutesForKm(projection.distanceFromRouteKm * 2, 55);
      const estimatedDetourMinutes = Math.round(
        Math.max(poi.detourMinutes, detourFromDistance),
      );

      return {
        ...poi,
        routeProgressKm,
        distanceFromRouteKm: projection.distanceFromRouteKm,
        distanceToUserKm: coords ? distanceToUserKm : haversineKm(route.geometry[0], poi.coords),
        isAhead: distanceAlongRoute > 1,
        etaMinutes: etaMinutesForKm(Math.max(0, distanceAlongRoute)) + estimatedDetourMinutes,
        estimatedDetourMinutes,
      };
    }).sort((a, b) => a.routeProgressKm - b.routeProgressKm);
  }, [position, state.settings.direction]);

  const ahead = useMemo(
    () => all.filter((p) => p.isAhead),
    [all],
  );

  const filtered = useMemo(() => {
    return ahead.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (filters.maxDetourMinutes !== null && p.estimatedDetourMinutes > filters.maxDetourMinutes)
        return false;
      if (filters.maxStopMinutes !== null && p.stopMinutes > filters.maxStopMinutes) return false;
      if (filters.onlyCatFriendly && !p.catFriendly) return false;
      return true;
    });
  }, [ahead, filters]);

  return { position, all, ahead, filtered };
}
