/* PROTOTYPE STUB — replaces the real i18n loader (no @ringcx/shared, no language
 * JSON files). `translate(key, opts)` humanizes the last key segment so the
 * vendored components render readable labels. */
import i18next from 'i18next';
import { Trans } from 'react-i18next';

const humanize = (key: string, opts?: { count?: number }): string => {
  if (!key) return '';
  let last = key.split('.').pop() || key;
  last = last.replace(/_plural$/i, '');
  let s = last
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  if (opts && typeof opts.count === 'number') {
    s = `${opts.count} ${s}`;
  }
  return s;
};

const translate = (key: string, opts?: { count?: number }): string =>
  humanize(key, opts);

export default translate;
export { Trans, i18next, };
export const userLocale = 'en';
