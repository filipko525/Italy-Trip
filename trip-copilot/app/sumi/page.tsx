'use client';

import { Cat, Navigation, ParkingCircle, Trees } from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { SumiWarning } from '@/components/sumi/SumiWarning';
import { SumiTravelLog } from '@/components/sumi/SumiTravelLog';
import { ChecklistBlock } from '@/components/trip/ChecklistBlock';
import { Collapsible } from '@/components/ui/Collapsible';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Chip';
import { SUMI, SUMI_DOCS_CHECKLIST, SUMI_GEAR_CHECKLIST, SUMI_TRAVEL_TIPS } from '@/data/sumi';
import { POI_CATEGORY_LABELS } from '@/data/poi';
import { useAppState } from '@/lib/storage/app-state';
import { usePoisAhead } from '@/hooks/usePoisAhead';
import { formatKm } from '@/lib/calculations/geo';
import { googleMapsUrl } from '@/lib/geolocation/navigation-links';

export default function SumiPage() {
  const { state } = useAppState();
  const { ahead } = usePoisAhead();

  const petSpots = ahead.filter((p) => p.catFriendly).slice(0, 5);
  const docsDone = SUMI_DOCS_CHECKLIST.items.filter((i) => state.checkedItems[i.id]).length;
  const gearDone = SUMI_GEAR_CHECKLIST.items.filter((i) => state.checkedItems[i.id]).length;

  return (
    <main className="flex-1">
      <AppHeader title="Sumi" subtitle="Mačka na palube" />

      <div className="space-y-3 px-4 py-4">
        <SumiWarning />

        <SumiTravelLog />

        <Collapsible
          title="Doklady"
          summary={`${docsDone} z ${SUMI_DOCS_CHECKLIST.items.length} pripravených`}
          defaultOpen
        >
          <ChecklistBlock checklist={SUMI_DOCS_CHECKLIST} />
          <div className="mt-4 space-y-2 text-sm">
            <Field label="Číslo čipu" value={SUMI.chipNumber} />
            <Field label="Číslo pasu" value={SUMI.passportNumber} />
            <Field label="Besnota platná do" value={SUMI.rabiesValidUntil} />
            <Field label="Veterinár" value={SUMI.vetPhone} />
            <p className="text-xs text-muted">{SUMI.notes}</p>
          </div>
        </Collapsible>

        <Collapsible
          title="Výbava"
          summary={`${gearDone} z ${SUMI_GEAR_CHECKLIST.items.length} zbalených`}
        >
          <ChecklistBlock checklist={SUMI_GEAR_CHECKLIST} />
        </Collapsible>

        <Card className="p-4">
          <p className="eyebrow mb-3">Zastávky vhodné so Sumi pred nami</p>
          {petSpots.length === 0 ? (
            <p className="text-sm text-muted">
              Pred nami nie je žiadna zastávka označená ako vhodná so Sumi. Skús posunúť polohu alebo
              prepnúť smer cesty na obrazovke Mapa.
            </p>
          ) : (
            <ul className="space-y-3">
              {petSpots.map((poi) => (
                <li key={poi.id} className="rounded-2xl bg-raised/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium leading-snug">{poi.name}</p>
                      <p className="text-xs text-muted">
                        {POI_CATEGORY_LABELS[poi.category]} · {poi.region}
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-sm font-semibold">
                      {formatKm(poi.distanceToUserKm)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Tag tone="sea">
                      <Cat size={12} /> povolená mačka
                    </Tag>
                    {poi.quiet ? <Tag tone="sea">pokojné</Tag> : null}
                    {poi.shade ? (
                      <Tag tone="sea">
                        <Trees size={12} /> tieň
                      </Tag>
                    ) : null}
                    {poi.parking ? (
                      <Tag>
                        <ParkingCircle size={12} /> parkovanie blízko
                      </Tag>
                    ) : null}
                    <Tag>krátka prestávka {poi.stopMinutes} min</Tag>
                    {poi.isMockData ? <Tag tone="danger">testovacie dáta</Tag> : null}
                  </div>

                  <a
                    href={googleMapsUrl(poi.coords, poi.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sea"
                  >
                    <Navigation size={15} /> Navigovať
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            Prepravku otvárajte len tam, kde to sami vyhodnotíte ako bezpečné. Aplikácia to
            neodporúča za vás.
          </p>
        </Card>

        <Card className="p-4">
          <p className="eyebrow mb-2">Ako to zvládnuť</p>
          <ul className="space-y-2 text-sm">
            {SUMI_TRAVEL_TIPS.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sea" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className={value ? 'font-medium' : 'text-signal'}>{value ?? 'doplniť'}</span>
    </div>
  );
}
