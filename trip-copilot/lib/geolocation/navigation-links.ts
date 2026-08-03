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
