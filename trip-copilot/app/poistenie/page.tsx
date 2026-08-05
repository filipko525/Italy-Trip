'use client';

import { useRef, useState } from 'react';
import { Camera, Pencil, Phone, ShieldCheck, TriangleAlert } from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Card } from '@/components/ui/Card';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { TextField, TextAreaField } from '@/components/ui/Field';
import { INSURANCE_BASE, INSURANCE_TIPS } from '@/data/insurance';
import { useAppState } from '@/lib/storage/app-state';

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

/** Fotku dokladu pred uložením zmenšíme, nech si nezaberá zbytočné miesto v úložisku. */
function compressPhoto(file: File, maxSize = 1400, quality = 0.85): Promise<string> {
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

export default function InsurancePage() {
  const { state, setInsurance } = useAppState();
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const profile = { ...INSURANCE_BASE, ...state.insuranceOverrides };

  const openEditor = (field: EditableField) => {
    setEditingField(field);
    setDraftValue(profile[field] ?? '');
  };

  const saveField = () => {
    if (!editingField) return;
    setInsurance({ [editingField]: draftValue.trim() || undefined });
    setEditingField(null);
  };

  const onPickDocument = async (file: File) => {
    try {
      const dataUrl = await compressPhoto(file);
      setInsurance({ documentDataUrl: dataUrl, documentName: file.name });
    } catch {
      // Ak sa fotka nepodarí spracovať, jednoducho sa neuloží – nič sa nerozbije.
    }
  };

  return (
    <main className="flex-1">
      <AppHeader title="Poistenie" subtitle="Zmluva, vozidlo, asistencia" />

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

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-sea" />
            <p className="eyebrow">Poistná zmluva</p>
          </div>
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
        </Card>

        <Card className="p-4">
          <p className="eyebrow mb-3">Vozidlo</p>
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
        </Card>

        <Card className="p-4">
          <p className="eyebrow mb-3">Doklad (napr. PZP certifikát)</p>
          {profile.documentDataUrl ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.documentDataUrl}
                alt="Doklad o poistení"
                className="w-full rounded-2xl border border-line object-cover"
              />
              <Button
                variant="secondary"
                full
                icon={<Camera size={18} />}
                onClick={() => docInputRef.current?.click()}
              >
                Nahradiť fotku
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              full
              icon={<Camera size={18} />}
              onClick={() => docInputRef.current?.click()}
            >
              Nahrať fotku dokladu
            </Button>
          )}
          <input
            ref={docInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPickDocument(file);
              e.target.value = '';
            }}
          />
          <p className="mt-3 text-xs text-muted">
            Fotka se ukladá len v appke v tomto zariadení, nikam sa neposiela. Originál dokladu
            radšej maj pre istotu aj v aute.
          </p>
        </Card>

        <Card className="p-4">
          <p className="eyebrow mb-2">Poznámka pre núdzové prípady</p>
          <EditableRow
            label={FIELD_LABELS.emergencyNote}
            value={profile.emergencyNote}
            onEdit={() => openEditor('emergencyNote')}
          />
        </Card>

        <Card className="p-4">
          <p className="eyebrow mb-2">Pri nehode alebo poruche v zahraničí</p>
          <ul className="space-y-2 text-sm">
            {INSURANCE_TIPS.map((tip) => (
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
