import type { LngLat } from '@/types';

/*
  Vlastnú turn-by-turn navigáciu nerobíme. Navigáciu odovzdávame
  Google Maps alebo Waze – tie majú aktuálnu dopravu aj hlasové pokyny.
*/

export function googleMapsUrl(coords: LngLat, label?: string): string {
  const [lng, lat] = coords;
  const query = label ? `${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
}

export function wazeUrl(coords: LngLat): string {
  const [lng, lat] = coords;
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}

export function appleMapsUrl(coords: LngLat): string {
  const [lng, lat] = coords;
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

/**
 * Odkaz na trasu do Google Maps. Štart a cieľ berieme ako presnú textovú
 * adresu (nie súradnice z našej zjednodušenej geometrie) – Google Maps si ju
 * sám zgeokóduje presne a nájde skutočne najlepšiu trasu. Zastávky (napr.
 * z obrazovky Pred nami) sú reálne, overené miesta, takže ako waypointy
 * trasu nekazia – len ju vedú cez ne.
 *
 * Google Maps webové rozhranie zvládne len obmedzený počet zastávok cez URL
 * (cca 9), preto pri dlhších zoznamoch orezávame.
 */
export function fullRouteGoogleMapsUrl(
  originAddress: string,
  destinationAddress: string,
  waypointCoords: LngLat[] = [],
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: originAddress,
    destination: destinationAddress,
    travelmode: 'driving',
  });

  const trimmed = waypointCoords.slice(0, 9);
  if (trimmed.length > 0) {
    params.set('waypoints', trimmed.map(([lng, lat]) => `${lat},${lng}`).join('|'));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Otvorí celú trasu v Google Maps v novom okne/karte. */
export function openFullRouteInGoogleMaps(
  originAddress: string,
  destinationAddress: string,
  waypointCoords: LngLat[] = [],
): void {
  window.open(
    fullRouteGoogleMapsUrl(originAddress, destinationAddress, waypointCoords),
    '_blank',
    'noopener,noreferrer',
  );
}
