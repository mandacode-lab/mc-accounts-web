"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
    }

    router.replace(pathname, { locale: newLocale });
  };

  // Get current locale index
  const currentIndex = locales.indexOf(locale);
  const nextLocale = locales[(currentIndex + 1) % locales.length];

  if (!isClient) {
    return (
      <button
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card hover:bg-accent transition-colors"
        disabled
      >
        {localeNames[locale]}
      </button>
    );
  }

  return (
    <button
      onClick={() => switchLocale(nextLocale)}
      className="px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card hover:bg-accent transition-colors"
      aria-label={`Switch to ${localeNames[nextLocale]}`}
    >
      {localeNames[locale]}
    </button>
  );
}
