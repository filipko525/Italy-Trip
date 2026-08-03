'use client';

import { DOCUMENTS } from '@/data/documents';
import { useAppState } from '@/lib/storage/app-state';
import { CheckboxField, TextField } from '@/components/ui/Field';

export function DocumentsList() {
  const { state, setDocumentStatus } = useAppState();

  const categories = [...new Set(DOCUMENTS.map((d) => d.category))];

  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <div key={category}>
          <p className="eyebrow mb-2">{category}</p>
          <ul className="space-y-3">
            {DOCUMENTS.filter((d) => d.category === category).map((doc) => {
              const status = state.documents[doc.id];
              return (
                <li key={doc.id} className="rounded-2xl bg-raised/60 p-3">
                  <p className="font-medium leading-snug">{doc.name}</p>
                  {doc.note ? <p className="mt-0.5 text-xs text-muted">{doc.note}</p> : null}
                  <CheckboxField
                    label="Pripravené"
                    checked={Boolean(status?.ready)}
                    onChange={(v) => setDocumentStatus(doc.id, { ready: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Platnosť do"
                      type="date"
                      value={status?.validUntil ?? ''}
                      onChange={(e) => setDocumentStatus(doc.id, { validUntil: e.target.value })}
                    />
                    <TextField
                      label="Poznámka alebo odkaz"
                      placeholder="voliteľné"
                      value={status?.note ?? ''}
                      onChange={(e) => setDocumentStatus(doc.id, { note: e.target.value })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
