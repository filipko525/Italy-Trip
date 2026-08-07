'use client';

import {
  Bookmark,
  BookmarkCheck,
  Cat,
  Check,
  Clock,
  CornerUpRight,
  Fuel,
  MapPin,
  Navigation,
  ParkingCircle,
  Trees,
} from 'lucide-react';
import type { PoiWithGeoContext } from '@/types';
import { POI_CATEGORY_LABELS } from '@/data/poi';
import { formatKm, formatMinutes } from '@/lib/calculations/geo';
import { googleMapsUrl, wazeUrl } from '@/lib/geolocation/navigation-links';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Chip';

export function PoiCard({
  poi,
  saved,
  visited,
  onToggleSaved,
  onToggleVisited,
}: {
  poi: PoiWithGeoContext;
  saved: boolean;
  visited: boolean;
  onToggleSaved: () => void;
  onToggleVisited: () => void;
}) {
  return (
    <Card as="li" className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{POI_CATEGORY_LABELS[poi.category]}</p>
            <h3 className="mt-0.5 text-[17px] font-semibold leading-snug">{poi.name}</h3>
            <p className="mt-0.5 text-xs text-muted">{poi.region}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="tnum font-condensed text-2xl font-bold leading-none">
              {formatKm(poi.distanceToUserKm)}
            </p>
            <p className="mt-1 text-xs text-muted">o {formatMinutes(poi.etaMinutes)}</p>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CornerUpRight size={15} className="text-muted" />
            <span>
              zachádzka{' '}
              <span className="tnum font-medium">
                {poi.estimatedDetourMinutes === 0
                  ? 'žiadna'
                  : formatMinutes(poi.estimatedDetourMinutes)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-muted" />
            <span>
              {poi.category === 'noclah' ? (
                <span className="tnum font-medium">cez noc</span>
              ) : (
                <>
                  zastávka <span className="tnum font-medium">{poi.stopMinutes} min</span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ParkingCircle size={15} className="text-muted" />
            <span>{poi.parking ? 'parkovanie áno' : 'parkovanie neisté'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-muted" />
            <span>{formatKm(poi.distanceFromRouteKm)} od trasy</span>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {poi.catFriendly ? (
            <Tag tone="sea">
              <Cat size={13} /> vhodné so Sumi
            </Tag>
          ) : (
            <Tag>bez Sumi</Tag>
          )}
          {poi.shade ? (
            <Tag tone="sea">
              <Trees size={13} /> tieň
            </Tag>
          ) : null}
          {poi.quiet ? <Tag tone="sea">pokojné</Tag> : null}
          {poi.category === 'pumpa' ? (
            <Tag tone="signal">
              <Fuel size={13} /> tankovanie
            </Tag>
          ) : null}
          {poi.openingHours ? <Tag>otvorené: {poi.openingHours}</Tag> : null}
          {poi.isMockData ? <Tag tone="danger">testovacie dáta</Tag> : null}
        </div>

        {poi.note ? <p className="mt-3 text-sm text-muted">{poi.note}</p> : null}
      </div>

      <div className="grid grid-cols-4 border-t border-line/70 text-sm">
        <a
          href={googleMapsUrl(poi.coords, poi.name)}
          target="_blank"
          rel="noreferrer"
          className="col-span-2 flex h-14 items-center justify-center gap-2 bg-sea font-semibold text-white"
        >
          <Navigation size={17} /> Navigovať
        </a>
        <a
          href={wazeUrl(poi.coords)}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 items-center justify-center border-l border-line/70 text-xs font-medium text-muted"
        >
          Waze
        </a>
        <div className="flex border-l border-line/70">
          <button
            onClick={onToggleSaved}
            aria-pressed={saved}
            aria-label={saved ? 'Odobrať z uložených' : 'Uložiť'}
            className={`flex flex-1 items-center justify-center ${saved ? 'text-sea' : 'text-muted'}`}
          >
            {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
          </button>
          <button
            onClick={onToggleVisited}
            aria-pressed={visited}
            aria-label="Označiť ako navštívené"
            className={`flex flex-1 items-center justify-center border-l border-line/70 ${
              visited ? 'text-sea' : 'text-muted'
            }`}
          >
            <Check size={19} />
          </button>
        </div>
      </div>
    </Card>
  );
}
