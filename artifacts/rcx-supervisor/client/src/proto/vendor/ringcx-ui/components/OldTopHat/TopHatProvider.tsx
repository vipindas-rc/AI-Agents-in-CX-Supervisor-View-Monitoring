import type { FC, PropsWithChildren } from 'react';
import { useState, createContext } from 'react';

import { Session } from '@ringcx/shared';

import TopHat from './components/TopHat';
import { DEFAULT_TOPHAT_STATE } from './constants';
import { useTopHatEventService } from './TopHat.service';
import type { ITopHatState, topHatContextValue } from './types';

const TopHatContext = createContext([
    DEFAULT_TOPHAT_STATE,
    () => {
        // empty function
    },
] as topHatContextValue);

const TopHatProvider: FC<PropsWithChildren> = ({ children }) => {
    const [topHat, setTopHat] = useState<ITopHatState>(DEFAULT_TOPHAT_STATE);

    useTopHatEventService(topHat, setTopHat);

    return (
        <TopHatContext.Provider value={[topHat, setTopHat]}>
            {Session.isEmbeddedAgentClientAppType() ? null : <TopHat />}
            {children}
        </TopHatContext.Provider>
    );
};

export { TopHatProvider as OldTopHatProvider, TopHatContext };
