'use client';

import { useRef, useState } from 'react';
import {
  Camera,
  ExternalLink,
  FileText,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Card } from '@/components/ui/Card';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { TextField, TextAreaField } from '@/components/ui/Field';
import { INSURANCE_BASE, INSURANCE_TIPS } from '@/data/insurance';
import { useAppState } from '@/lib/storage/app-state';
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

export default function InsurancePage() {
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
          <p className="eyebrow mb-3">Doklady (zmluva, prílohy, PZP...)</p>

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
            Doklady sa ukladahú len v appke v tomto zariadení, nikam sa neposielajú. Naše osobné
            doklady (pas, OP) sem netreba – tie ukazujeme naživo. Sem patrí napr. zmluva
            k cestovnému poisteniu alebo PZP certifikát k autu.
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
