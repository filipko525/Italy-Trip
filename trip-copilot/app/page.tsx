'use client';

import { useEffect } from 'react';
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
  TriangleAlert,
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
  const { state, setTravel, setSettings, autoStoppedTravel, dismissAutoStoppedTravel } = useAppState();
  const position = useTripPosition();

  // Cesta tam má byť vždy prioritná pri otvorení appky – ak nie sme práve
  // v aktívnom cestovnom režime, domovská obrazovka smer potichu resetuje.
  useEffect(() => {
    if (!state.travel.active && state.settings.direction !== 'tam') {
      setSettings({ direction: 'tam' });
    }
    // Zámerne bez state.travel/setSettings v deps – reaguje len na zmenu smeru
    // (napr. po tom, čo sa stav dotiahne z localStorage po prvom vykreslení),
    // nech nevzniká nekonečná slučka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.direction]);

  const days = daysUntil(TRIP.departureDate);
  const lignano = ACCOMMODATIONS[0];
  const austria = ACCOMMODATIONS[1];
  const austriaStay = { ...austria, ...state.accommodationOverrides['acc-austria'] };

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
        {autoStoppedTravel ? (
          <div className="flex items-start gap-3 rounded-card bg-signal/12 p-4">
            <TriangleAlert size={20} className="mt-0.5 shrink-0 text-signal" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-signal">Cestovný režim sa sám vypol</p>
              <p className="mt-0.5 text-sm text-muted">
                Bežal viac než 10 hodín bez ukončenia (asi ste zabudli zastaviť jazdu), tak sme ho
                pre istotu vypli sami.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissAutoStoppedTravel}
              className="shrink-0 text-sm font-medium text-signal underline"
            >
              OK
            </button>
          </div>
        ) : null}

        <Card className="p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Cesta tam</p>
            <p className="tnum text-sm text-muted">
              {CESTA_TAM.distanceKm} km · {formatMinutes(CESTA_TAM.drivingMinutes)}
            </p>
          </div>
          <KilometerRibbon route={CESTA_TAM} progressKm={position.progressKm} showLabels={false} />
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
            title="659 km"
            detail="Trnava → Lignano, cez Semmering a Wörthersee"
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
            href="/mapa"
            icon={<BedDouble size={18} />}
            eyebrow="Rakúsky nocľah"
            title={austriaStay.name}
            detail={
              austriaStay.status !== 'nevybrane' && austriaStay.address
                ? austriaStay.address
                : '22. – 23. 8., Graz alebo okolie, do 100 €'
            }
            warn={austriaStay.status === 'nevybrane' ? 'doplniť' : undefined}
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

        <Link
          href="/hra"
          className="flex items-center gap-3 rounded-card border border-signal/30 bg-signal/10 p-4"
        >
          <span className="text-3xl">🇮🇹</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug">Prežiješ dovolenku v Taliansku?</p>
            <p className="mt-0.5 text-xs text-muted">
              Minihra pre chvíle nudy v aute – slovíčka, kvízy aj Sumi bonus
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-signal">Hrať →</span>
        </Link>

        <p className="px-1 pb-2 text-xs leading-relaxed text-muted">
          Body záujmu v aplikácii sú zatiaľ testovacie dáta. Navigáciu preberá Google Maps alebo
          Waze – táto aplikácia je copilot, nie navigácia. Vodič ju neovláda počas jazdy.
        </p>

        <button
          type="button"
          onClick={() => {
            if (!confirm('Appka ťa odhlási – nabudúce bude znova pýtať meno a heslo. Pokračovať?')) {
              return;
            }
            const { protocol, host } = window.location;
            window.location.href = `${protocol}//odhlasenie:odhlasenie@${host}/`;
          }}
          className="px-1 pb-4 text-xs text-muted underline underline-offset-2"
        >
          Odhlásiť sa (napr. pred odovzdaním telefónu na testovanie)
        </button>
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
