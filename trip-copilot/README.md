# TRIP COPILOT – LIGNANO 2026

Road-trip copilot pre cestu z Trnavy do Lignano Sabbiadoro a späť. Dve osoby, Seat Ibiza 2011
a mačka Sumi. Aplikácia ukazuje trasu, polohu, zastávky pred nami, plán, checklisty, náklady,
tankovanie a všetko okolo Sumi.

**Aplikácia nie je navigácia.** Turn-by-turn navigáciu odovzdáva Google Maps alebo Waze.

Next.js (App Router) · TypeScript · Tailwind CSS · Mapbox GL · Supabase (voliteľné) · PWA

---

## 1. Požiadavky

- Node.js 18.17 alebo novší (odporúčam 20 LTS)
- npm 9+
- Účet Mapbox (bezplatný) – pre živú mapu
- Účet Supabase – voliteľné, Etapa 1 funguje aj bez neho
- Účet Vercel – na nasadenie

## 2. Inštalácia

```bash
cd trip-copilot
npm install
```

## 3. Vytvorenie `.env.local`

V koreňovom priečinku projektu vytvor súbor `.env.local` podľa vzoru `.env.example`:

```bash
cp .env.example .env.local
```

Obsah:

```
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Súbor `.env.local` nikdy necommituj – je v `.gitignore`.

## 4. Nastavenie Mapbox

1. Zaregistruj sa na https://account.mapbox.com
2. V sekcii **Tokens** skopíruj *Default public token* (začína `pk.`)
3. Vlož ho do `.env.local` ako `NEXT_PUBLIC_MAPBOX_TOKEN`
4. Reštartuj `npm run dev`

Bez tokenu appka nespadne – obrazovka Mapa zobrazí schematický zákres trasy so všetkými
hranicami a polohou. Rovnaká schéma sa použije aj offline.

## 5. Nastavenie Supabase (voliteľné pre Etapu 1)

1. Vytvor projekt na https://supabase.com
2. **Settings → API** → skopíruj *Project URL* a *anon public key* do `.env.local`
3. **SQL Editor** → vlož obsah `supabase/migrations/0001_init.sql` → **Run**

Etapa 1 zapisuje dáta do `localStorage` prehliadača, takže Supabase nepotrebuje. Schéma aj klient
sú pripravené na krok, keď budeš chcieť dáta synchronizovať medzi telefónmi.

## 6. Spustenie lokálne

```bash
npm run dev
```

Otvor http://localhost:3000

Ďalšie príkazy:

```bash
npm run build      # produkčný build
npm run start      # spustenie produkčného buildu
npm run typecheck  # kontrola TypeScript typov
```

## 7. Nasadenie na Vercel

1. Nahraj projekt do repozitára na GitHube
2. Na https://vercel.com klikni **Add New → Project** a vyber repozitár
3. Framework preset sa zistí automaticky (Next.js)
4. V **Environment Variables** pridaj `NEXT_PUBLIC_MAPBOX_TOKEN` a prípadne obe supabase premenné
5. **Deploy**

Service worker sa registruje len v produkčnom builde, takže PWA funguje až po nasadení
(alebo lokálne cez `npm run build && npm run start`).

## 8. Pridanie na plochu iPhonu

1. Otvor nasadenú adresu v **Safari** (nie v Chrome – ten na iOS neponúka inštaláciu)
2. Ťukni na ikonu zdieľania
3. **Pridať na plochu**
4. Potvrď názov a ťukni **Pridať**

Aplikácia sa spustí na celú obrazovku bez adresného riadka.

## 9. Povolenie GPS v Safari

Pri prvom prepnutí na skutočnú GPS (obrazovka Mapa → Poloha) sa Safari opýta na povolenie.
Ak si ho omylom zamietol:

- **Nastavenia → Safari → Poloha → Opýtať sa** alebo **Povoliť**
- **Nastavenia → Ochrana osobných údajov a zabezpečenie → Poloha → Safari**
- Pri appke na ploche: **Nastavenia → Trip Copilot → Poloha**

Poloha vyžaduje HTTPS. Na `localhost` funguje aj bez neho.

## 10. Známe obmedzenia GPS na pozadí v iOS

- Safari a webové aplikácie **nedostávajú polohu na pozadí**. Keď zamkneš telefón alebo prepneš
  do inej appky, sledovanie sa zastaví a po návrate sa obnoví.
- Preto sa v aute oplatí nechať appku v popredí na držiaku, alebo ju používať v prestávkach
  a navigáciu nechať na Google Maps.
- Presnosť polohy v tuneloch a horských úsekoch (Wechsel, Packsattel, Tarvisio) je slabá.
  Appka v takom prípade ukáže poslednú známu polohu.
- iOS môže po dlhšom čase v pozadí zahodiť stránku z pamäte. Všetky zapísané dáta sú
  v `localStorage`, takže sa nič nestratí.

---

## Čo je v Etape 1 hotové

- kompletná štruktúra projektu a znovupoužiteľné komponenty
- mobile-first responzívny dizajn, svetlý aj tmavý režim
- spodná navigácia s piatimi sekciami
- domovská obrazovka s odpočtom dní a prehľadom
- mapa s pevnou trasou, hranicami a bodmi záujmu (Mapbox + offline schéma)
- testovacia poloha na posuvníku a skutočná GPS cez Geolocation API
- obrazovka Pred nami s filtrami, rýchlymi tlačidlami a logikou poradia na trase
- plán dovolenky, checklisty, poplatky, dokumenty, kontakty
- náklady, rozpočet, tankovanie a výpočet spotreby
- sekcia Sumi vrátane cestovného režimu pre mačku
- PWA manifest, ikony, service worker, offline fallback
- SQL migrácia pre Supabase

## Čo musíš doplniť

| Kde | Čo |
| --- | --- |
| `.env.local` | `NEXT_PUBLIC_MAPBOX_TOKEN` (a voliteľne Supabase) |
| `data/accommodations.ts` | rezervačné číslo, telefón, e-mail a presná GPS Yachting Residence |
| `data/accommodations.ts` | rakúske ubytovanie na noc 23. – 24. 8. |
| `data/sumi.ts` | číslo čipu, číslo pasu, platnosť besnoty, telefón na veterinára |
| `data/checklists.ts` | telefónne čísla v sekcii kontakty |
| `data/tolls.ts` | ceny známok a mýta pre rok 2026 |
| `data/poi.ts` | **všetky body záujmu** – teraz sú to testovacie dáta |

## Čo sú mock dáta

- **Body záujmu** v `data/poi.ts` – každý záznam má `isMockData: true` a v UI sa označuje štítkom
  „testovacie dáta“. Sú to neutrálne testovacie názvy, nie reálne prevádzky.
- **Geometria trasy** v `data/routes.ts` – zjednodušená lomená čiara cez hlavné body, nie presná
  geometria z Directions API. Na zákres a poradie bodov stačí, na navigáciu nie.
- **Časy v pláne** v `data/plan.ts` – označené ako predbežné.
- **Odhad benzínu** 90–100 l a 180–190 € – predbežný, prepočíta sa po prvých tankovaniach.
- Žiadne potvrdené rezervácie ani ceny appka nevymýšľa. Kde údaj chýba, ukáže „doplniť“.

## Odporúčaný ďalší krok (Etapa 2)

Nahradiť testovacie body záujmu overenými miestami a zapojiť **Mapbox Directions API**:

1. serverová route `app/api/route/route.ts`, ktorá si vypýta reálnu geometriu trasy a uloží ju
2. **Matrix API** na presný výpočet zachádzky namiesto dnešného odhadu
3. import overených pump a odpočívadiel (Mapbox Search alebo ručný zoznam) s `isMockData: false`
4. až potom synchronizácia do Supabase a prihlásenie
