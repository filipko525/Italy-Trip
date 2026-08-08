'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { ChecklistBlock } from '@/components/trip/ChecklistBlock';
import { TollList } from '@/components/trip/TollList';
import { DocumentsList } from '@/components/trip/DocumentsList';
import { AccommodationCard } from '@/components/cards/AccommodationCard';
import { Collapsible } from '@/components/ui/Collapsible';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { TextField, TextAreaField } from '@/components/ui/Field';
import { ACCOMMODATIONS } from '@/data/accommodations';
import { CESTA_SPAT, CESTA_TAM } from '@/data/routes';
import { CHECKLISTS, CONTACTS } from '@/data/checklists';
import { DOCUMENTS } from '@/data/documents';
import { TOLLS } from '@/data/tolls';
import { BUDGET, CAR } from '@/data/trip';
import { GRAZ_TIPS, TALIANSKO_TIPS, type DiscoverTip } from '@/data/discover';
import { INSURANCE_BASE, INSURANCE_TIPS } from '@/data/insurance';
import { useAppState } from '@/lib/storage/app-state';
import { formatMinutes } from '@/lib/calculations/geo';
import { computeFuelStats, FUEL_RESERVE_WARNING } from '@/lib/calculations/fuel';
import { formatEur, formatNumber } from '@/lib/calculations/costs';
import type { InsuranceDocument } from '@/types';

type EditableField =
  | 'insurer'
  | 'policyNumber'
  | 'vehicleModel'
  | 'vehiclePlate'
  | 'vehicleVin'
  | 'validUntil'
  | 'coverageNote'
  | 'assistancePhone'
  | 'emergencyNote';

const FIELD_LABELS: Record<EditableField, string> = {
  insurer: 'Poisťovňa',
  policyNumber: 'Číslo poistnej zmluvy',
  vehicleModel: 'Vozidlo (značka, model)',
  vehiclePlate: 'ŠPZ',
  vehicleVin: 'VIN',
  validUntil: 'Zaplatené do',
  coverageNote: 'Krytie (sumy)',
  assistancePhone: 'Asistenčná linka',
  emergencyNote: 'Poznámka pre núdzové prípady',
};

/** Polia s dlhším textom dostanú textarea namiesto jednoriadkového vstupu. */
const LONG_FIELDS: EditableField[] = ['coverageNote', 'emergencyNote'];

/** Obrázok pred uložením zmenšíme, nech si nezaberá zbytočné miesto v úložisku. PDF necháme tak. */
function readDocument(file: File, maxSize = 1400, quality = 0.85): Promise<string> {
  const isPdf = file.type === 'application/pdf';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (isPdf) {
        resolve(reader.result as string);
        return;
      }
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

export default function ChecklistyPage() {
  const { state, setInsurance } = useAppState();
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [uploading, setUploading] = useState(false);

  const profile = { ...INSURANCE_BASE, ...state.insuranceOverrides };
  const documents = profile.documents ?? [];

  const openEditor = (field: EditableField) => {
    setEditingField(field);
    setDraftValue(profile[field] ?? '');
  };

  const saveField = () => {
    if (!editingField) return;
    setInsurance({ [editingField]: draftValue.trim() || undefined });
    setEditingField(null);
  };

  const onPickDocuments = async (files: FileList) => {
    setUploading(true);
    try {
      const newDocs: InsuranceDocument[] = [];
      for (const file of Array.from(files)) {
        try {
          const dataUrl = await readDocument(file);
          newDocs.push({
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            dataUrl,
            isPdf: file.type === 'application/pdf',
          });
        } catch {
          // Jeden nepodarený súbor nezastaví zvyšok – jednoducho sa preskočí.
        }
      }
      if (newDocs.length > 0) {
        setInsurance({ documents: [...documents, ...newDocs] });
      }
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (id: string) => {
    setInsurance({ documents: documents.filter((d) => d.id !== id) });
  };

  const departure = CHECKLISTS.find((c) => c.id === 'cl-departure')!;
  const returning = CHECKLISTS.find((c) => c.id === 'cl-return')!;
  const car = CHECKLISTS.find((c) => c.id === 'cl-car')!;

  const doneIn = (ids: string[]) => ids.filter((id) => state.checkedItems[id]).length;
  const tollsBought = TOLLS.filter((t) => state.tolls[t.id]?.purchased ?? t.purchased).length;
  const docsReady = DOCUMENTS.filter((d) => state.documents[d.id]?.ready).length;
  const fuel = computeFuelStats(state.fuelEntries);

  return (
    <main className="flex-1">
      <AppHeader title="Checklisty a tipy" subtitle="Poistenie, doklady, výbava, kontakty" />

      <div className="space-y-3 px-4 py-4">
        {profile.assistancePhone ? (
          <a
            href={`tel:${profile.assistancePhone.replace(/\s+/g, '')}`}
            className="flex items-center gap-3 rounded-card bg-signal p-4 text-white shadow-lift"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20">
              <Phone size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-condensed text-xs uppercase tracking-wider text-white/80">
                Asistenčná linka
              </p>
              <p className="text-lg font-bold leading-snug">{profile.assistancePhone}</p>
            </div>
            <Pencil
              size={16}
              className="shrink-0 text-white/70"
              onClick={(e) => {
                e.preventDefault();
                openEditor('assistancePhone');
              }}
            />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => openEditor('assistancePhone')}
            className="flex w-full items-center gap-3 rounded-card bg-signal/12 p-4 text-left"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal/20 text-signal">
              <TriangleAlert size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug text-signal">Doplň asistenčnú linku</p>
              <p className="text-sm text-muted">Nech ju máš poruke pri nehode alebo poruche.</p>
            </div>
            <Pencil size={16} className="shrink-0 text-signal" />
          </button>
        )}

        <Collapsible title="Poistná zmluva" summary={profile.insurer ?? 'doplniť poisťovňu'}>
          <div className="space-y-2 text-sm">
            <EditableRow
              label={FIELD_LABELS.insurer}
              value={profile.insurer}
              onEdit={() => openEditor('insurer')}
            />
            <EditableRow
              label={FIELD_LABELS.policyNumber}
              value={profile.policyNumber}
              onEdit={() => openEditor('policyNumber')}
            />
            <EditableRow
              label={FIELD_LABELS.validUntil}
              value={profile.validUntil}
              onEdit={() => openEditor('validUntil')}
            />
            <EditableRow
              label={FIELD_LABELS.coverageNote}
              value={profile.coverageNote}
              onEdit={() => openEditor('coverageNote')}
            />
          </div>
        </Collapsible>

        <Collapsible title="Vozidlo (poistenie)" summary={profile.vehiclePlate ?? 'doplniť ŠPZ'}>
          <div className="space-y-2 text-sm">
            <EditableRow
              label={FIELD_LABELS.vehicleModel}
              value={profile.vehicleModel}
              onEdit={() => openEditor('vehicleModel')}
            />
            <EditableRow
              label={FIELD_LABELS.vehiclePlate}
              value={profile.vehiclePlate}
              onEdit={() => openEditor('vehiclePlate')}
            />
            <EditableRow
              label={FIELD_LABELS.vehicleVin}
              value={profile.vehicleVin}
              onEdit={() => openEditor('vehicleVin')}
            />
          </div>
        </Collapsible>

        <Collapsible title="Doklady k poisteniu" summary={`${documents.length} nahratých`}>
          {documents.length > 0 ? (
            <div className="mb-3 space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-2xl border border-line p-2"
                >
                  {doc.isPdf ? (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-raised/60 text-muted">
                      <FileText size={20} />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.dataUrl}
                      alt={doc.name}
                      className="h-11 w-11 shrink-0 rounded-xl border border-line object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{doc.name}</span>
                  <a
                    href={doc.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={doc.name}
                    className="shrink-0 p-1 text-muted"
                    aria-label={`Otvoriť ${doc.name}`}
                  >
                    <ExternalLink size={17} />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="shrink-0 p-1 text-signal"
                    aria-label={`Odstrániť ${doc.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <Button
            variant="secondary"
            full
            icon={<Camera size={18} />}
            onClick={() => docInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Nahrávam…' : 'Pridať fotku alebo PDF'}
          </Button>
          <input
            ref={docInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) onPickDocuments(e.target.files);
              e.target.value = '';
            }}
          />
          <p className="mt-3 text-xs text-muted">
            Doklady sa ukladajú len v appke v tomto zariadení, nikam sa neposielajú. Naše osobné
            doklady (pas, OP) sem netreba – tie ukazujeme naživo. Sem patrí napr. zmluva
            k cestovnému poisteniu alebo PZP certifikát k autu.
          </p>
        </Collapsible>

        <Collapsible title="Poznámka pre núdzové prípady" summary={profile.emergencyNote ? 'doplnené' : 'doplniť'}>
          <EditableRow
            label={FIELD_LABELS.emergencyNote}
            value={profile.emergencyNote}
            onEdit={() => openEditor('emergencyNote')}
          />
        </Collapsible>

        <Collapsible title="Pri nehode alebo poruche v zahraničí" summary="Rýchle tipy">
          <ul className="space-y-2 text-sm">
            {INSURANCE_TIPS.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sea" />
                {tip}
              </li>
            ))}
          </ul>
        </Collapsible>

        <Collapsible
          title="Ubytovanie"
          summary={`${ACCOMMODATIONS[0].name} · rakúsky nocľah zatiaľ nevybraný`}
        >
          <div className="space-y-3">
            {ACCOMMODATIONS.map((a) => (
              <AccommodationCard key={a.id} accommodation={a} />
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Cesta" summary="Jeden segment tam, dva späť">
          <div className="space-y-4">
            {[CESTA_TAM, CESTA_SPAT].map((route) => (
              <div key={route.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{route.name}</h3>
                  <p className="tnum text-sm text-muted">
                    {route.distanceKm} km · {formatMinutes(route.drivingMinutes)}
                  </p>
                </div>
                <ul className="mt-2 space-y-2">
                  {route.segments.map((segment) => (
                    <li key={segment.id} className="rounded-2xl bg-raised/60 p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-medium">{segment.name}</p>
                        <p className="tnum shrink-0 text-sm text-muted">
                          {segment.distanceKm} km · {formatMinutes(segment.drivingMinutes)}
                        </p>
                      </div>
                      {segment.description ? (
                        <p className="mt-1 text-sm text-muted">{segment.description}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted">
                        {segment.waypoints.map((w) => w.name).join(' → ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-muted">
              Kilometre a časy sú odhady bez dopravy a prestávok. Trasa vedie cez Rakúsko a Tarvisio,
              nie cez Slovinsko.
            </p>
          </div>
        </Collapsible>

        <Collapsible
          title="Diaľničné známky a mýto"
          summary={`${tollsBought} z ${TOLLS.length} vybavených`}
        >
          <TollList />
        </Collapsible>

        <Collapsible
          title="Tankovanie"
          summary={
            fuel.totalLiters > 0
              ? `${formatNumber(fuel.totalLiters, 1)} l · ${formatEur(fuel.totalPrice)}`
              : `Odhad ${BUDGET.fuelLitersFrom}–${BUDGET.fuelLitersTo} l na dovolenku`
          }
        >
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-raised/60 p-3">
              <p className="font-medium">{CAR.model}</p>
              <p className="mt-1 text-muted">
                {CAR.power}, {CAR.fuel}, nádrž približne {CAR.tankLiters} l. Väčšina jazdy okolo{' '}
                {CAR.cruiseSpeedKmh} km/h na tempomate.
              </p>
            </div>
            <div className="rounded-2xl bg-raised/60 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Predbežný odhad na dovolenku</span>
                <Tag tone="signal">predbežné</Tag>
              </div>
              <p className="tnum mt-1 text-lg font-semibold">
                {BUDGET.fuelLitersFrom}–{BUDGET.fuelLitersTo} l · {BUDGET.fuelEurFrom}–
                {BUDGET.fuelEurTo} €
              </p>
            </div>
            <p className="rounded-2xl bg-signal/12 p-3 text-signal">{FUEL_RESERVE_WARNING}</p>
            <Link href="/naklady" className="block text-sea underline">
              Zapísať tankovanie na obrazovke Náklady
            </Link>
          </div>
        </Collapsible>

        <Collapsible title="Dokumenty" summary={`${docsReady} z ${DOCUMENTS.length} pripravených`}>
          <DocumentsList />
        </Collapsible>

        <Collapsible
          title="Checklist pred odchodom"
          summary={`${doneIn(departure.items.map((i) => i.id))} z ${departure.items.length} hotových`}
        >
          <ChecklistBlock checklist={departure} />
        </Collapsible>

        <Collapsible
          title="Checklist pred návratom"
          summary={`${doneIn(returning.items.map((i) => i.id))} z ${returning.items.length} hotových`}
        >
          <ChecklistBlock checklist={returning} />
        </Collapsible>

        <Collapsible
          title="Výbava auta"
          summary={`${doneIn(car.items.map((i) => i.id))} z ${car.items.length} hotových`}
        >
          <ChecklistBlock checklist={car} />
        </Collapsible>

        <Collapsible title="Dôležité kontakty" summary="112 platí v SK, AT aj IT">
          <ul className="divide-y divide-line/60">
            {CONTACTS.map((c) => {
              const value =
                c.id === 'k-4' ? state.accommodationOverrides['acc-austria']?.phone ?? c.value : c.value;
              const missing = value === 'doplniť';
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{c.label}</p>
                    {c.note ? <p className="text-xs text-muted">{c.note}</p> : null}
                  </div>
                  {missing ? (
                    <Tag tone="signal">doplniť</Tag>
                  ) : (
                    <a
                      href={`tel:${value}`}
                      className="inline-flex items-center gap-1.5 rounded-pill bg-sea px-3 py-2 text-sm font-medium text-white"
                    >
                      <Phone size={15} /> {value}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </Collapsible>

        <Collapsible title="Tipy v Grazi" summary="Čo pozrieť pri nocľahu cestou späť">
          <DiscoverList tips={GRAZ_TIPS} />
        </Collapsible>

        <Collapsible title="Tipy v Taliansku" summary="Výlety autom z Lignana">
          <DiscoverList tips={TALIANSKO_TIPS} />
        </Collapsible>
      </div>

      <Sheet
        open={editingField !== null}
        onClose={() => setEditingField(null)}
        title={editingField ? FIELD_LABELS[editingField] : ''}
      >
        <div className="space-y-4">
          {editingField && LONG_FIELDS.includes(editingField) ? (
            <TextAreaField
              label={FIELD_LABELS[editingField]}
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              placeholder="Zadaj hodnotu"
            />
          ) : (
            <TextField
              label={editingField ? FIELD_LABELS[editingField] : ''}
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              placeholder="Zadaj hodnotu"
            />
          )}
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
      <span
        className={`inline-flex items-center gap-1.5 text-right ${
          value ? 'font-medium' : 'text-signal'
        }`}
      >
        <span className="max-w-[180px] truncate">{value ?? 'doplniť'}</span>
        <Pencil size={13} className="shrink-0 text-muted" />
      </span>
    </button>
  );
}

function DiscoverList({ tips }: { tips: DiscoverTip[] }) {
  return (
    <ul className="divide-y divide-line/60">
      {tips.map((tip) => (
        <li key={tip.id} className="py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{tip.name}</p>
              <p className="eyebrow mt-0.5">{tip.category}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tip.mapsQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-raised/60 px-3 py-2 text-xs font-medium"
            >
              <MapPin size={13} /> mapa
            </a>
          </div>
          <p className="mt-1.5 text-sm text-muted">{tip.note}</p>
        </li>
      ))}
    </ul>
  );
}
