import type { LngLat, Route } from '@/types';

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
 * Odkaz na trasu do Google Maps – zámerne len štart a cieľ, žiadne vynútené
 * medzizastávky. Naše súradnice bodov na trase sú len približné (nie presná
 * geometria z Directions API), takže keď by sme Google Maps nimi nútili
 * prechádzať, vie to paradoxne vybrať HORŠIU trasu, než keby sme mu len
 * povedali odkiaľ-kam a nechali ho nájsť skutočne najlepšiu cestu sám.
 */
export function fullRouteGoogleMapsUrl(route: Route): string {
  const [start, end] = [route.geometry[0], route.geometry[route.geometry.length - 1]];
  const origin = `${start[1]},${start[0]}`;
  const destination = `${end[1]},${end[0]}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

/** Otvorí celú trasu v Google Maps v novom okne/karte. */
export function openFullRouteInGoogleMaps(route: Route): void {
  window.open(fullRouteGoogleMapsUrl(route), '_blank', 'noopener,noreferrer');
}
