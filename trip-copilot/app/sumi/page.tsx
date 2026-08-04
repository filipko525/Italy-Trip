'use client';

import { useRef, useState } from 'react';
import { Camera, Cat, Navigation, ParkingCircle, Pencil, Trees } from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { SumiWarning } from '@/components/sumi/SumiWarning';
import { SumiTravelLog } from '@/components/sumi/SumiTravelLog';
import { ChecklistBlock } from '@/components/trip/ChecklistBlock';
import { Collapsible } from '@/components/ui/Collapsible';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { SUMI, SUMI_DOCS_CHECKLIST, SUMI_GEAR_CHECKLIST, SUMI_TRAVEL_TIPS } from '@/data/sumi';
import { POI_CATEGORY_LABELS } from '@/data/poi';
import { useAppState } from '@/lib/storage/app-state';
import { usePoisAhead } from '@/hooks/usePoisAhead';
import { formatKm } from '@/lib/calculations/geo';
import { googleMapsUrl } from '@/lib/geolocation/navigation-links';

type EditableField = 'chipNumber' | 'passportNumber' | 'rabiesValidUntil' | 'vetPhone';

const FIELD_LABELS: Record<EditableField, string> = {
  chipNumber: 'Číslo čipu',
  passportNumber: 'Číslo pasu',
  rabiesValidUntil: 'Besnota platná do',
  vetPhone: 'Veterinár',
};

/** Fotku pred uložením zmenšíme, nech si nezaberá zbytočné miesto v lokálnom úložisku. */
function compressPhoto(file: File, maxSize = 480, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas nie je dostupný.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SumiPage() {
  const { state, setPetProfile } = useAppState();
  const { ahead } = usePoisAhead();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const profile = { ...SUMI, ...state.petProfileOverrides };
  const petSpots = ahead.filter((p) => p.catFriendly).slice(0, 5);
  const docsDone = SUMI_DOCS_CHECKLIST.items.filter((i) => state.checkedItems[i.id]).length;
  const gearDone = SUMI_GEAR_CHECKLIST.items.filter((i) => state.checkedItems[i.id]).length;

  const openEditor = (field: EditableField) => {
    setEditingField(field);
    setDraftValue(profile[field] ?? '');
  };

  const saveField = () => {
    if (!editingField) return;
    setPetProfile({ [editingField]: draftValue.trim() || undefined });
    setEditingField(null);
  };

  const onPickPhoto = async (file: File) => {
    try {
      const dataUrl = await compressPhoto(file);
      setPetProfile({ photoDataUrl: dataUrl });
    } catch {
      // Ak sa fotka nepodarí spracovať, jednoducho sa neuloží – nič sa nerozbije.
    }
  };

  return (
    <main className="flex-1">
      <AppHeader title="Sumi" subtitle="Mačka na palube" />

      <div className="space-y-3 px-4 py-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-raised"
              aria-label="Zmeniť fotku Sumi"
            >
              {profile.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoDataUrl} alt="Sumi" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-muted">
                  <Cat size={28} />
                </span>
              )}
              <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-sea text-white">
                <Camera size={13} />
              </span>
            </button>
            <div>
              <p className="font-semibold leading-snug">{profile.name}</p>
              <p className="text-sm text-muted">{profile.species}</p>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="mt-1 text-sm font-medium text-sea"
              >
                {profile.photoDataUrl ? 'Zmeniť fotku' : 'Pridať fotku'}
              </button>
            </div>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPickPhoto(file);
              e.target.value = '';
            }}
          />
        </Card>

        <SumiWarning />

        <SumiTravelLog />

        <Collapsible
          title="Doklady"
          summary={`${docsDone} z ${SUMI_DOCS_CHECKLIST.items.length} pripravených`}
          defaultOpen
        >
          <ChecklistBlock checklist={SUMI_DOCS_CHECKLIST} />
          <div className="mt-4 space-y-2 text-sm">
            <EditableRow
              label={FIELD_LABELS.chipNumber}
              value={profile.chipNumber}
              onEdit={() => openEditor('chipNumber')}
            />
            <EditableRow
              label={FIELD_LABELS.passportNumber}
              value={profile.passportNumber}
              onEdit={() => openEditor('passportNumber')}
            />
            <EditableRow
              label={FIELD_LABELS.rabiesValidUntil}
              value={profile.rabiesValidUntil}
              onEdit={() => openEditor('rabiesValidUntil')}
            />
            <EditableRow
              label={FIELD_LABELS.vetPhone}
              value={profile.vetPhone}
              onEdit={() => openEditor('vetPhone')}
            />
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

      <Sheet
        open={editingField !== null}
        onClose={() => setEditingField(null)}
        title={editingField ? FIELD_LABELS[editingField] : ''}
      >
        <div className="space-y-4">
          <TextField
            label={editingField ? FIELD_LABELS[editingField] : ''}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            placeholder="Zadaj hodnotu"
          />
          <Button full onClick={saveField}>
            Uložiť
          </Button>
        </div>
      </Sheet>
    </main>
  );
}

function EditableRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value?: string;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center justify-between gap-3 py-0.5 text-left"
    >
      <span className="text-muted">{label}</span>
      <span className={`inline-flex items-center gap-1.5 ${value ? 'font-medium' : 'text-signal'}`}>
        {value ?? 'doplniť'}
        <Pencil size={13} className="text-muted" />
      </span>
    </button>
  );
}
