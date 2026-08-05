'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { LngLat, PoiWithGeoContext, Route } from '@/types';
import { DEFAULT_VIEW, MAP_STYLES, MAPBOX_TOKEN } from '@/lib/mapbox/config';

interface Props {
  route: Route;
  position: LngLat | null;
  pois: PoiWithGeoContext[];
  onSelectPoi?: (poi: PoiWithGeoContext) => void;
  dark: boolean;
}

/**
 * Mapa trasy. Zámerne nerobí navigáciu – len zobrazuje, kde sme,
 * kadiaľ ideme a čo je okolo. Turn-by-turn preberá Google Maps alebo Waze.
 */
export function RouteMap({ route, position, pois, onSelectPoi, dark }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Inicializácia mapy
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!containerRef.current || mapRef.current) return;
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: dark ? MAP_STYLES.dark : MAP_STYLES.light,
        center: DEFAULT_VIEW.center,
        zoom: DEFAULT_VIEW.zoom,
        attributionControl: true,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;

      // Mapa sa vie vytvoriť skôr, než má kontajner definitívny rozmer (napr. hneď
      // po prvom vykreslení stránky) – vtedy zostane "zaseknutá" na zlej veľkosti,
      // kým sa niečo nestane (napr. prepnutie záložky). ResizeObserver ju prinúti
      // prepočítať sa vždy, keď sa kontajner reálne zmení.
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(containerRef.current);
      resizeObserverRef.current = resizeObserver;

      // Poistka: aj bez zmeny rozmerov niekedy prehliadač dokončí layout
      // až po prvom render tiku, tak mapu ešte raz prepočítame o chvíľu.
      requestAnimationFrame(() => map.resize());
      setTimeout(() => map.resize(), 300);

      map.on('load', () => {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: route.geometry },
          },
        });

        map.addLayer({
          id: 'route-casing',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#08262E', 'line-width': 8, 'line-opacity': 0.35 },
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#E8952F', 'line-width': 4 },
        });

        const bounds = route.geometry.reduce(
          (b: any, c) => b.extend(c),
          new mapboxgl.LngLatBounds(route.geometry[0], route.geometry[0]),
        );
        map.fitBounds(bounds, { padding: 48, duration: 0 });

        // Ostatné efekty (trasa pri zmene smeru, body záujmu, poloha auta) čakajú
        // na tento signál – inak sa môže stať, že sa spustia skôr, než má mapa
        // pripravený štýl, potichu zlyhajú a značky sa už nikdy nedokreslia.
        setMapReady(true);
      });
    })();

    return () => {
      cancelled = true;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  // Aktualizácia trasy pri prepnutí smeru (aj nový výrez mapy, nová trasa má iný tvar)
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('route');
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: route.geometry },
      });
    }
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      const bounds = route.geometry.reduce(
        (b: any, c) => b.extend(c),
        new mapboxgl.LngLatBounds(route.geometry[0], route.geometry[0]),
      );
      map.fitBounds(bounds, { padding: 48, duration: 300 });
    })();
  }, [route, mapReady]);

  // Body záujmu
  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;
    (async () => {
      const map = mapRef.current;
      if (!map) return;
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      pois.slice(0, 40).forEach((poi) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.setAttribute('aria-label', poi.name);
        el.style.cssText =
          'width:16px;height:16px;border-radius:50%;border:2px solid #fff;background:#0E6B75;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer';
        el.addEventListener('click', () => onSelectPoi?.(poi));

        const marker = new mapboxgl.Marker({ element: el }).setLngLat(poi.coords).addTo(map);
        markersRef.current.push(marker);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pois, onSelectPoi, mapReady]);

  // Poloha auta
  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;
    (async () => {
      const map = mapRef.current;
      if (!map || !position) return;
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled) return;

      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.style.cssText =
          'width:22px;height:22px;border-radius:50%;background:#E8952F;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45)';
        userMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat(position).addTo(map);
      } else {
        userMarkerRef.current.setLngLat(position);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [position, mapReady]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Mapa trasy" />;
}
