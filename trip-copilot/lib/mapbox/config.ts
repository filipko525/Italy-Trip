export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const hasMapbox = () => MAPBOX_TOKEN.length > 0;

export const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/outdoors-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

/** Východiskový pohľad – celá trasa Trnava → Lignano. */
export const DEFAULT_VIEW = {
  center: [15.4, 47.0] as [number, number],
  zoom: 5.6,
};
