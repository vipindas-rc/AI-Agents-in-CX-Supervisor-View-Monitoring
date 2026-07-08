import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal i18n stub: returns the last segment of any key (or the key) so the
// vendored components render readable labels without the real translation files.
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: {} } },
  interpolation: { escapeValue: false },
  parseMissingKeyHandler: (key: string) => {
    const last = key.split('.').pop() || key;
    // Humanize: SCREAMING_SNAKE / dotted keys -> Title Case words
    return last
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  },
});

export default i18n;
