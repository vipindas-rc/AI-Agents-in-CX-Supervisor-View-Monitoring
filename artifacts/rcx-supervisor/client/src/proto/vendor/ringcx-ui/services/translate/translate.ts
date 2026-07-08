import {
    getUserLocale,
    Languages,
    Session,
    unescapeEntities,
    getLanguageFileName,
    i18nCustomPluralRule,
} from '@ringcx/shared';
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

const { regionalSettings } = Session.getUserDetails();

const lng: string = getUserLocale(regionalSettings?.language);

const i18next = createInstance();
const isTestEnv = process.env.NODE_ENV === 'test';
i18next
    .use(initReactI18next)
    .use(
        resourcesToBackend(async (language: string) => {
            /* istanbul ignore next */
            const lang = getLanguageFileName(language as Languages);
            return import(`./locales/${lang}.json`);
        })
    )
    .init({
        fallbackLng: Languages.EN_US,
        lng,
        interpolation: {
            escapeValue: false,
        },
        ...(isTestEnv && {
            resources: {
                [Languages.EN_US]: {
                    translation: require('./locales/en-US.json'),
                },
            },
        }),
        react: {
            unescape: unescapeEntities,
        },
    });

// Add custom plural rules for locales that need singular/plural support
// zh-CN and rc-* test locales don't have plural rules by default
i18next.services.pluralResolver.addRule(Languages.ZH_CN, i18nCustomPluralRule);
i18next.services.pluralResolver.addRule(Languages.RC_XX, i18nCustomPluralRule);
i18next.services.pluralResolver.addRule(Languages.RC_LS, i18nCustomPluralRule);

const t = i18next.t.bind(i18next);
const changeSharedComponentLanguage = i18next.changeLanguage.bind(i18next);

export { t, i18next, changeSharedComponentLanguage };
