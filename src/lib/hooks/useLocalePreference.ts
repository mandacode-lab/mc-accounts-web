"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { defaultLocale, type Locale, locales } from "@/i18n/config";

/**
 * Hook to manage locale preference from localStorage
 * This should be called once in the root layout to sync localStorage preference
 */
export function useLocalePreference() {
  const locale = useLocale() as Locale;

  useEffect(() => {
    // Save current locale to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", locale);
    }
  }, [locale]);
}

/**
 * Get the preferred locale from localStorage or browser settings
 * This is a utility function that can be used in server components
 */
export function getPreferredLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const stored = localStorage.getItem("preferred-locale");
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  // Fallback to browser language
  const browserLang = navigator.language.split("-")[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}
