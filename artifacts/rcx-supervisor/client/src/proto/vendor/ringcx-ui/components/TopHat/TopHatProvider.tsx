import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';

import { Session } from '@ringcx/shared';

import TopHat from './components/TopHat';
import { useTopHatEventService } from './TopHat.service';
import TopHatContext from './TopHatContext';
import type { ITopHatState } from './types';
import { FlatRef } from '../../types/FlatRef';

type TopHatProviderProps = {
    containerId?: string;
};

const TopHatProvider: FC<PropsWithChildren<TopHatProviderProps>> = ({
    children,
    containerId,
}) => {
    const [topHat, setTopHat] = useState<FlatRef<ITopHatState>>(
        new FlatRef({
            queue: {},
            current: null,
        })
    );

    useTopHatEventService(topHat, setTopHat);
    const isElectron =
        !!window.process?.versions?.electron ||
        navigator.userAgent.toLowerCase().includes('electron');

    const shouldSuppressTopHat =
        Session.isEmbeddedAgentClientAppType() || isElectron;

    return (
        <TopHatContext.Provider value={[topHat, setTopHat]}>
            {!shouldSuppressTopHat && <TopHat containerId={containerId} />}
            {children}
        </TopHatContext.Provider>
    );
};

export { TopHatProvider };
