import type { FC } from 'react';

import { RcThemeProvider } from '@ringcentral/juno';
import { Session } from '@ringcx/shared';

import { useBehaviorSubject } from './useBehaviorSubject';
import { $theme } from '../common/services/jupiter';

export const withBrandTheme = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    const ComponentWithThemeProvider: FC<P> = (props) => {
        const isEmbedded = Session.isEmbeddedAgentClientAppType();

        const theme = useBehaviorSubject($theme);

        return (
            <RcThemeProvider theme={isEmbedded && theme ? theme : undefined}>
                <WrappedComponent {...props} />
            </RcThemeProvider>
        );
    };

    return ComponentWithThemeProvider;
};
