import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Prečíta z fotky bločku len celkovú sumu. Kľúč (ANTHROPIC_API_KEY) žije
 * len tu na serveri – appka v prehliadači ho nikdy neuvidí.
 */
export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = (await req.json()) as { image?: string; mediaType?: string };

    if (!image) {
      return NextResponse.json({ error: 'Chýba fotka.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server nemá nastavený ANTHROPIC_API_KEY.' },
        { status: 500 },
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 30,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image },
              },
              {
                type: 'text',
                text:
                  'Toto je fotka pokladničného bločku. Nájdi na ňom CELKOVÚ sumu na zaplatenie ' +
                  '(spolu / total / suma). Odpovedz VÝLUČNE číslom s desatinnou bodkou, bez meny ' +
                  'a bez akéhokoľvek ďalšieho textu. Ak sumu nevieš s istotou určiť, odpovedz ' +
                  'presne slovom NEISTE.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `Anthropic API vrátilo chybu (${response.status}): ${detail.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const textBlock = (data.content ?? []).find((c: { type: string }) => c.type === 'text');
    const raw: string = (textBlock?.text ?? '').trim();

    if (!raw || raw.toUpperCase().includes('NEISTE')) {
      return NextResponse.json({ amount: null });
    }

    const match = raw.replace(',', '.').match(/[\d]+(\.\d+)?/);
    const amount = match ? Number(match[0]) : null;

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ amount: null });
    }

    return NextResponse.json({ amount });
  } catch {
    return NextResponse.json({ error: 'Nepodarilo sa spracovať fotku.' }, { status: 500 });
  }
}
