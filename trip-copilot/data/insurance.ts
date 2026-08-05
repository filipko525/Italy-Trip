import type { InsuranceProfile } from '@/types';

/* =========================================================
   POISTENIE
   ---------------------------------------------------------
   Zámerne prázdne – žiadne skutočné čísla zmlúv, ŠPZ, VIN
   ani sumy tu nepatria (appka je verejne dostupná bez hesla).
   Všetko dopĺňa používateľ priamo v appke cez editovateľné
   riadky na stránke Poistenie – uloží sa to len lokálne do
   jeho vlastného telefónu/prehliadača (rovnaký princíp ako
   pri profile Sumi).
   ========================================================= */

export const INSURANCE_BASE: InsuranceProfile = {};

export const INSURANCE_TIPS: string[] = [
  'Pri nehode v zahraničí volaj najprv miestnu políciu (112 funguje v celej EÚ), potom asistenčnú linku poisťovne.',
  'Európsky formulár o nehode (zápis o škodovej udalosti) maj vytlačený v aute, nie len v appke.',
  'Fotku dokladu tu použi na rýchlu kontrolu pre seba – originál alebo digitálny doklad ukáž kontrole naživo.',
  'Pri poruche na diaľnici v Rakúsku/Taliansku najprv zapni výstražné svetlá a vesty, až potom volaj asistenciu.',
];
