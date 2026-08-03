'use client';

import { Cat, Check, Droplets, Utensils } from 'lucide-react';
import { useAppState } from '@/lib/storage/app-state';
import { timeAgoSk } from '@/lib/calculations/dates';
import { Card } from '@/components/ui/Card';
import { TextAreaField } from '@/components/ui/Field';

const now = () => new Date().toISOString();

/** Cestovný režim pre Sumi – jedno ťuknutie zapíše čas, nič viac. */
export function SumiTravelLog() {
  const { state, updatePetLog } = useAppState();
  const { petLog } = state;

  const rows = [
    {
      key: 'lastBreakAt' as const,
      label: 'Posledná prestávka',
      icon: <Cat size={20} />,
      value: petLog.lastBreakAt,
    },
    {
      key: 'lastWaterAt' as const,
      label: 'Naposledy voda',
      icon: <Droplets size={20} />,
      value: petLog.lastWaterAt,
    },
    {
      key: 'lastFoodAt' as const,
      label: 'Naposledy jedlo',
      icon: <Utensils size={20} />,
      value: petLog.lastFoodAt,
    },
    {
      key: 'lastCheckAt' as const,
      label: 'Posledná kontrola',
      icon: <Check size={20} />,
      value: petLog.lastCheckAt,
    },
  ];

  return (
    <Card className="p-4">
      <p className="eyebrow mb-3">Cestovný režim pre Sumi</p>

      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-3 rounded-2xl bg-raised/60 p-3">
            <span className="text-sea">{row.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{row.label}</span>
              <span className="block text-xs text-muted">{timeAgoSk(row.value)}</span>
            </span>
            <button
              onClick={() => updatePetLog({ [row.key]: now() })}
              className="h-11 shrink-0 rounded-pill bg-sea px-4 text-sm font-semibold text-white"
            >
              Teraz
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <TextAreaField
          label="Poznámky k Sumi"
          placeholder="Ako znáša cestu, čo jedla, čo si všimnete"
          value={petLog.notes}
          onChange={(e) => updatePetLog({ notes: e.target.value })}
        />
      </div>
    </Card>
  );
}
