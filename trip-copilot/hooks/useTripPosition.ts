'use client';

import { useMemo } from 'react';
import type { LngLat, Route, RouteSegment, Waypoint } from '@/types';
import { getRoute } from '@/data/routes';
import { useAppState } from '@/lib/storage/app-state';
import { useGeolocation } from '@/lib/geolocation/useGeolocation';
import {
  etaMinutesForKm,
  makeRouteScaler,
  pointAtRouteKm,
  projectOntoRoute,
} from '@/lib/calculations/geo';

export type PositionSource = 'gps' | 'test' | 'none';

export interface TripPosition {
  route: Route;
  /** Aktuálna poloha (GPS alebo testovacia). */
  coords: LngLat | null;
  source: PositionSource;
  /** Prejdené kilometre po trase. */
  progressKm: number;
  remainingKm: number;
  remainingMinutes: number;
  /** Kolmá vzdialenosť od trasy – veľká hodnota znamená, že sme mimo trasy. */
  distanceFromRouteKm: number;
  onRoute: boolean;
  currentSegment: RouteSegment | null;
  nextWaypoint: Waypoint | null;
  distanceToNextWaypointKm: number | null;
  geo: ReturnType<typeof useGeolocation>;
}

/**
 * Spája GPS polohu s geometriou trasy.
 *
 * Ak je zapnutá testovacia poloha (predvolené počas vývoja), poloha sa
 * odvodí z posunutia na trase v kilometroch. Vďaka tomu sa dá celá logika
 * „čo je pred nami“ odskúšať aj z gauča v Trnave.
 */
export function useTripPosition(): TripPosition {
  const { state } = useAppState();
  const { direction, useMockLocation, mockProgressKm } = state.settings;
  const geo = useGeolocation(!useMockLocation);

  const route = useMemo(() => getRoute(direction), [direction]);

  return useMemo(() => {
    const scaler = makeRouteScaler(route.geometry, route.distanceKm);

    let coords: LngLat | null = null;
    let source: PositionSource = 'none';
    let progressKm = 0;
    let distanceFromRouteKm = 0;

    if (useMockLocation) {
      const clamped = Math.max(0, Math.min(route.distanceKm, mockProgressKm));
      coords = pointAtRouteKm(route.geometry, route.distanceKm, clamped);
      progressKm = clamped;
      source = 'test';
    } else if (geo.coords) {
      const projection = projectOntoRoute(route.geometry, geo.coords, scaler.cumulative);
      coords = geo.coords;
      progressKm = scaler.toRouteKm(projection.progressKm);
      distanceFromRouteKm = projection.distanceFromRouteKm;
      source = 'gps';
    }

    const remainingKm = Math.max(0, route.distanceKm - progressKm);
    const onRoute = source === 'test' || distanceFromRouteKm < 15;

    // Segment, v ktorom sa práve nachádzame (podľa prejdených kilometrov).
    let acc = 0;
    let currentSegment: RouteSegment | null = null;
    let segmentStartKm = 0;
    for (const seg of route.segments) {
      if (progressKm <= acc + seg.distanceKm || seg === route.segments[route.segments.length - 1]) {
        currentSegment = seg;
        segmentStartKm = acc;
        break;
      }
      acc += seg.distanceKm;
    }

    // Najbližší waypoint pred nami.
    let nextWaypoint: Waypoint | null = null;
    let distanceToNextWaypointKm: number | null = null;
    if (currentSegment) {
      const inSegmentKm = progressKm - segmentStartKm;
      const upcoming = currentSegment.waypoints.find((w) => w.kmFromStart > inSegmentKm + 1);
      if (upcoming) {
        nextWaypoint = upcoming;
        distanceToNextWaypointKm = upcoming.kmFromStart - inSegmentKm;
      }
    }

    return {
      route,
      coords,
      source,
      progressKm,
      remainingKm,
      remainingMinutes: etaMinutesForKm(remainingKm),
      distanceFromRouteKm,
      onRoute,
      currentSegment,
      nextWaypoint,
      distanceToNextWaypointKm,
      geo,
    };
  }, [route, useMockLocation, mockProgressKm, geo]);
}
