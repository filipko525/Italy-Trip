import { NextRequest, NextResponse } from 'next/server';

/**
 * Appka obsahuje citlivé osobné údaje (poistenie, doklady, domáce info) a je
 * verejne dostupná na internete, preto ju chránime jednoduchým HTTP Basic
 * Auth priamo na serveri (Edge Middleware). Meno a heslo bývajú vo Vercel
 * premenných prostredia (SITE_USER, SITE_PASSWORD) – nikdy v kóde appky.
 *
 * Prehliadač/telefón zobrazí natívne prihlasovacie okienko a heslo si
 * zapamätá, takže se netreba prihlasovať znova pri každom otvorení appky.
 */
export function middleware(request: NextRequest) {
  const expectedUser = process.env.SITE_USER;
  const expectedPassword = process.env.SITE_PASSWORD;

  // Ak nie sú premenné nastavené (napr. v lokálnom vývoji), appka beží bez zámku.
  if (!expectedUser || !expectedPassword) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Basic ')) {
    const encoded = authHeader.slice('Basic '.length);
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(':');
    const suppliedUser = decoded.slice(0, separatorIndex);
    const suppliedPassword = decoded.slice(separatorIndex + 1);

    if (suppliedUser === expectedUser && suppliedPassword === expectedPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Prihlásenie je potrebné.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Kika Filip & Sumi na tripe"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)'],
};
