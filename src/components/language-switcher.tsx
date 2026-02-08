"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/routing";

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
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", newLocale);
    }

    router.replace(pathname, { locale: newLocale });
  };

  // Get current locale index
  const currentIndex = locales.indexOf(locale);
  const nextLocale = locales[(currentIndex + 1) % locales.length];

  if (!isClient) {
    return (
      <button
        type="button"
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card hover:bg-accent transition-colors"
        disabled
      >
        {localeNames[locale]}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => switchLocale(nextLocale)}
      className="px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card hover:bg-accent transition-colors"
      aria-label={`Switch to ${localeNames[nextLocale]}`}
    >
      {localeNames[locale]}
    </button>
  );
}
