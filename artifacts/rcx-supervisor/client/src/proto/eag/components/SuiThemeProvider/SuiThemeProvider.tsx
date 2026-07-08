import { useEffect, useState } from 'react';

import { ThemeProvider } from '@ringcentral/spring-ui';

import { getSpringTheme } from './getSpringTheme';
import { overwriteTheme } from '../../helpers/initializeTheme';
import injector from '../../helpers/injector';

export const SuiThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const $rootScope = injector('$rootScope');
    const [themeName, setThemeName] = useState(
        overwriteTheme($rootScope.theme?.value)
    );
    useEffect(() => {
        const $rootScope = injector('$rootScope');
        const unsubscribe = $rootScope.$on(
            'sui-theme-changed',
            (...args: any[]) => {
                setThemeName(args[1]);
            }
        );
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const globalSuiStyleTags = Array.from(
            document.querySelectorAll('style[data-sui-theme-tag="global"]')
        );
        if (globalSuiStyleTags.length > 1) {
            globalSuiStyleTags.slice(0, -1).forEach((tag) => {
                tag.remove();
            });
        }
    }, []);

    return (
        <ThemeProvider theme={getSpringTheme(themeName)}>
            {children}
        </ThemeProvider>
    );
};
