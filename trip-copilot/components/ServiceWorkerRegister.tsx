'use client';

import { useEffect } from 'react';

/** Registrácia service workera pre offline režim a inštaláciu na plochu. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* Bez service workera appka funguje ďalej, len bez offline cache. */
      });
    };

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
