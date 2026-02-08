import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`@/i18n/messages/${locale}.json`)).default
  };
});
