'use client';

import { AppHeader } from '@/components/navigation/AppHeader';
import { Timeline } from '@/components/trip/Timeline';
import { Card } from '@/components/ui/Card';

export default function PlanPage() {
  return (
    <main className="flex-1">
      <AppHeader title="Plán" subtitle="15. – 23. augusta 2026" />
      <div className="space-y-3 px-4 py-4">
        <Card className="p-4">
          <p className="eyebrow mb-3">Časová os</p>
          <Timeline />
        </Card>
        <p className="px-1 text-xs text-muted">
          Ubytovanie, cestu, doklady, checklisty a kontakty nájdeš na obrazovke Checklisty.
        </p>
      </div>
    </main>
  );
}
