import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Odbočka mimo trasy</p>
      <h1 className="mt-2 text-2xl font-semibold">Táto obrazovka neexistuje</h1>
      <p className="mt-2 text-muted">
        Buď zlý odkaz, alebo obrazovka, ktorá príde až v ďalšej etape.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-pill bg-sea px-5 py-3 font-medium text-white"
      >
        Späť na domovskú obrazovku
      </Link>
    </main>
  );
}
