'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BedDouble,
  Cat,
  CircleAlert,
  FileText,
  Fuel,
  Play,
  Route as RouteIcon,
  Ticket,
} from 'lucide-react';
import { CESTA_TAM } from '@/data/routes';
import { ACCOMMODATIONS } from '@/data/accommodations';
import { TOLLS } from '@/data/tolls';
import { DOCUMENTS } from '@/data/documents';
import { SUMI_DOCS_CHECKLIST, SUMI_GEAR_CHECKLIST } from '@/data/sumi';
import { BUDGET, TRIP } from '@/data/trip';
import { useAppState } from '@/lib/storage/app-state';
import { useTripPosition } from '@/hooks/useTripPosition';
import { daysUntil, formatDateSk } from '@/lib/calculations/dates';
import { formatMinutes } from '@/lib/calculations/geo';
import { KilometerRibbon } from '@/components/trip/KilometerRibbon';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Chip';

export default function HomePage() {
  const router = useRouter();
  const { state, setTravel } = useAppState();
  const position = useTripPosition();

  const days = daysUntil(TRIP.departureDate);
  const lignano = ACCOMMODATIONS[0];
  const austria = ACCOMMODATIONS[1];

  const sumiItems = [...SUMI_DOCS_CHECKLIST.items, ...SUMI_GEAR_CHECKLIST.items];
  const sumiDone = sumiItems.filter((i) => state.checkedItems[i.id]).length;

  const tollsBought = TOLLS.filter((t) => state.tolls[t.id]?.purchased ?? t.purchased).length;
  const docsReady = DOCUMENTS.filter((d) => state.documents[d.id]?.ready).length;

  const startTravelMode = () => {
    setTravel({
      active: true,
      status: 'jazda',
      startedAt: new Date().toISOString(),
      drivingSinceAt: new Date().toISOString(),
    });
    router.push('/mapa');
  };

  return (
    <main className="flex-1">
      {/* Hero – kilometrová stuha je hlavný orientačný prvok, nie ozdoba. */}
      <section className="relative overflow-hidden bg-sea px-5 pb-6 pt-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-condensed text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Trip Copilot
            </p>
            <h1 className="font-condensed text-4xl font-bold uppercase leading-none tracking-tight">
              Lignano 2026
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-5 flex items-end gap-4">
          <div>
            <p className="tnum font-condensed text-6xl font-bold leading-none">
              {days > 0 ? days : 0}
            </p>
            <p className="font-condensed text-sm uppercase tracking-wider text-white/75">
              {days === 1 ? 'deň do odchodu' : days < 5 && days > 0 ? 'dni do odchodu' : 'dní do odchodu'}
            </p>
          </div>
          <div className="pb-1 text-sm text-white/80">
            <p>Odchod {formatDateSk(TRIP.departureDate)}</p>
            <p>Návrat {formatDateSk(TRIP.arrivalHomeDate)}</p>
          </div>
        </div>
      </section>

      <div className="space-y-4 px-4 py-5">
        <Card className="p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Cesta tam</p>
            <p className="tnum text-sm text-muted">
              {CESTA_TAM.distanceKm} km · {formatMinutes(CESTA_TAM.drivingMinutes)}
            </p>
          </div>
          <KilometerRibbon route={CESTA_TAM} progressKm={position.progressKm} />
        </Card>

        <button
          onClick={startTravelMode}
          className="flex h-20 w-full items-center justify-center gap-3 rounded-card bg-signal text-xl font-semibold text-white shadow-lift active:bg-signal/90"
        >
          <Play size={26} fill="currentColor" />
          Spustiť cestovný režim
        </button>

        <div className="grid grid-cols-2 gap-3">
          <HomeCard
            href="/mapa"
            icon={<RouteIcon size={18} />}
            eyebrow="Trasa tam"
            title="636 km"
            detail="Trnava → Lignano, cez Judenburg a Tarvisio"
          />
          <HomeCard
            href="/plan"
            icon={<BedDouble size={18} />}
            eyebrow="Ubytovanie"
            title={lignano.name}
            detail={`${formatDateSk(lignano.checkIn)} – ${formatDateSk(lignano.checkOut)}`}
            warn={lignano.status === 'overit' ? 'overiť' : undefined}
          />
          <HomeCard
            href="/sumi"
            icon={<Cat size={18} />}
            eyebrow="Sumi"
            title={`${sumiDone} / ${sumiItems.length}`}
            detail="Doklady a výbava pripravené"
          />
          <HomeCard
            href="/plan"
            icon={<Ticket size={18} />}
            eyebrow="Diaľničné známky"
            title={`${tollsBought} / ${TOLLS.length}`}
            detail="SK, AT 10 dní, AT 1 deň, IT mýto"
          />
          <HomeCard
            href="/naklady"
            icon={<Fuel size={18} />}
            eyebrow="Odhad benzínu"
            title={`${BUDGET.fuelEurFrom}–${BUDGET.fuelEurTo} €`}
            detail={`${BUDGET.fuelLitersFrom}–${BUDGET.fuelLitersTo} l na celú dovolenku`}
            warn="predbežné"
          />
          <HomeCard
            href="/plan"
            icon={<BedDouble size={18} />}
            eyebrow="Rakúsky nocľah"
            title={austria.name}
            detail="22. – 23. 8., Graz alebo okolie, do 100 €"
            warn="doplniť"
          />
          <HomeCard
            href="/plan"
            icon={<FileText size={18} />}
            eyebrow="Dokumenty"
            title={`${docsReady} / ${DOCUMENTS.length}`}
            detail="Pripravené doklady"
            className="col-span-2"
          />
        </div>

        <p className="px-1 pb-2 text-xs leading-relaxed text-muted">
          Body záujmu v aplikácii sú zatiaľ testovacie dáta. Navigáciu preberá Google Maps alebo
          Waze – táto aplikácia je copilot, nie navigácia. Vodič ju neovláda počas jazdy.
        </p>
      </div>
    </main>
  );
}

function HomeCard({
  href,
  icon,
  eyebrow,
  title,
  detail,
  warn,
  className = '',
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  detail: string;
  warn?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <Card className="h-full p-4 transition-colors hover:bg-raised/40">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sea">{icon}</span>
          {warn ? (
            <Tag tone="signal">
              <CircleAlert size={12} /> {warn}
            </Tag>
          ) : null}
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-0.5 truncate text-lg font-semibold leading-tight">{title}</p>
        <p className="mt-1 text-xs leading-snug text-muted">{detail}</p>
      </Card>
    </Link>
  );
}
