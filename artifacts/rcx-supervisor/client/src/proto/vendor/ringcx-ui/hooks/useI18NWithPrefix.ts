import { useCallback, useEffect, useState } from 'react';

import type { i18n, PostProcessorModule } from 'i18next';

declare module 'i18next' {
    interface CustomPluginOptions {
        keyPrefix?: string;
    }
}

const toArray = <T>(value: T | readonly T[]): T[] =>
    Array.isArray(value) ? Array.from<T>(value) : [value as T];

const translateWithPrefix: PostProcessorModule = {
    name: 'translateWithPrefix',
    type: 'postProcessor',

    process(value, key, options, translator) {
        const { postProcess } = options;
        const { keyPrefix } = translator.options;

        const postProcessWithoutPrefix = toArray(postProcess).filter(
            (pluginName) => pluginName !== this.name
        );

        return translator.translate(`${keyPrefix}.${key}`, {
            ...options,
            postProcess: postProcessWithoutPrefix,
        });
    },
};

/**
 * Creates a new instance of the i18n object with a specified key prefix.
 * It could be used to customize the translations for shared components
 * based on different contexts or usage scenarios.
 *
 * ```
 * const i18nFoo = useI18NWithPrefix(i18n, 'FOO');
 * i18nFoo.t('SHARED_COMPONENT.TITLE'); // returns i18n.t('FOO.SHARED_COMPONENT.TITLE')
 * ```
 */
export const useI18NWithPrefix = (i18n: i18n, keyPrefix: string) => {
    const [i18nWithPrefix, setI18nWithPrefix] = useState(i18n);

    useEffect(() => {
        setI18nWithPrefix(
            i18n
                .cloneInstance({
                    postProcess: [
                        ...toArray(i18n.options.postProcess || []),
                        translateWithPrefix.name,
                    ],
                    keyPrefix,
                })
                .use(translateWithPrefix)
        );
    }, [i18n, keyPrefix]);

    const handleLanguageChange = useCallback(
        (language: string) => {
            if (i18nWithPrefix.language === language) {
                return;
            }

            i18nWithPrefix.changeLanguage(language);
        },
        [i18nWithPrefix]
    );

    useEffect(() => {
        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n, handleLanguageChange]);

    return i18nWithPrefix;
};
