import { TriangleAlert } from 'lucide-react';
import { SUMI_SAFETY_WARNING } from '@/data/sumi';

/** Najdôležitejšia veta v celej aplikácii. Preto vyzerá tak, ako vyzerá. */
export function SumiWarning() {
  return (
    <div
      role="alert"
      className="rounded-card border-2 border-danger bg-danger/10 p-4 text-danger"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert size={26} className="mt-0.5 shrink-0" />
        <p className="text-lg font-semibold leading-snug">{SUMI_SAFETY_WARNING}</p>
      </div>
      <p className="mt-2 pl-9 text-sm">
        V lete stúpne teplota v zaparkovanom aute na nebezpečnú hodnotu za pár minút. Pootvorené okno
        ani tieň to nevyriešia. Pri prestávke ostáva jeden z vás pri Sumi.
      </p>
    </div>
  );
}
