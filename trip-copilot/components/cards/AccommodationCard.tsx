'use client';

import { ExternalLink, Navigation, Phone } from 'lucide-react';
import type { Accommodation } from '@/types';
import { formatDateSk } from '@/lib/calculations/dates';
import { googleMapsUrl, telUrl } from '@/lib/geolocation/navigation-links';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Chip';

const STATUS_LABEL: Record<Accommodation['status'], { label: string; tone: 'sea' | 'signal' | 'danger' }> = {
  potvrdene: { label: 'potvrdené', tone: 'sea' },
  nevybrane: { label: 'nevybrané', tone: 'danger' },
  overit: { label: 'overiť pred cestou', tone: 'signal' },
};

export function AccommodationCard({ accommodation: a }: { accommodation: Accommodation }) {
  const status = STATUS_LABEL[a.status];

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{a.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{a.address}</p>
          </div>
          <Tag tone={status.tone}>{status.label}</Tag>
        </div>

        <dl className="mt-3 space-y-1.5 text-sm">
          <Row label="Príchod" value={formatDateSk(a.checkIn)} />
          <Row label="Odchod" value={formatDateSk(a.checkOut)} />
          <Row label="Rezervačné číslo" value={a.reservationNumber ?? 'doplniť'} />
          <Row label="Telefón" value={a.phone ?? 'doplniť'} />
          <Row label="E-mail" value={a.email ?? 'doplniť'} />
          <Row label="Parkovanie" value={a.parking ?? 'doplniť'} />
          <Row label="Mačka" value={a.petPolicy ?? 'doplniť'} />
          <Row label="Poplatok za mačku" value={a.petFee ?? 'doplniť'} />
          {a.budgetEur ? <Row label="Rozpočet" value={`približne ${a.budgetEur} €`} /> : null}
        </dl>

        {a.notes ? <p className="mt-3 text-sm text-muted">{a.notes}</p> : null}
      </div>

      <div className="grid grid-cols-3 border-t border-line/70 text-sm">
        <a
          href={a.coords ? googleMapsUrl(a.coords, a.name) : '#'}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!a.coords}
          className={`flex h-14 items-center justify-center gap-2 font-medium ${
            a.coords ? 'text-sea' : 'pointer-events-none text-muted/50'
          }`}
        >
          <Navigation size={17} /> Navigovať
        </a>
        <a
          href={a.phone ? telUrl(a.phone) : '#'}
          aria-disabled={!a.phone}
          className={`flex h-14 items-center justify-center gap-2 border-x border-line/70 font-medium ${
            a.phone ? 'text-sea' : 'pointer-events-none text-muted/50'
          }`}
        >
          <Phone size={17} /> Zavolať
        </a>
        <a
          href={a.bookingUrl ?? '#'}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!a.bookingUrl}
          className={`flex h-14 items-center justify-center gap-2 font-medium ${
            a.bookingUrl ? 'text-sea' : 'pointer-events-none text-muted/50'
          }`}
        >
          <ExternalLink size={17} /> Rezervácia
        </a>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const missing = value === 'doplniť';
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${missing ? 'text-signal' : 'font-medium'}`}>{value}</dd>
    </div>
  );
}
