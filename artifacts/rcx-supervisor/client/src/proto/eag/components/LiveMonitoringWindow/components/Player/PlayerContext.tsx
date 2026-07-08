import type { FC, MutableRefObject, PropsWithChildren } from 'react';
import { useState, useMemo, createContext, useContext } from 'react';

import type { PlayerController } from '../../../../common/services/LiveMonitoringSupervisorService/lib/PlayerController/PlayerController';

type PlayerContextProviderProps = {
    rootRef: MutableRefObject<HTMLDivElement | null>;
    playerController: PlayerController;
};

type PlayerContextValue = {
    rootRef: MutableRefObject<HTMLDivElement | null>;
    playerController: PlayerController;
    fullscreen: boolean;
    setFullscreen(value: boolean): void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerContextProvider: FC<
    PropsWithChildren<PlayerContextProviderProps>
> = ({ children, rootRef, playerController }) => {
    const [fullscreen, setFullscreen] = useState(false);

    const context = useMemo<PlayerContextValue>(() => {
        return { rootRef, playerController, fullscreen, setFullscreen };
    }, [rootRef, playerController, fullscreen]);

    return (
        <PlayerContext.Provider value={context}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayerContext = (): PlayerContextValue => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error(
            'usePlayerContext must be used within a PlayerContextProvider'
        );
    }
    return context;
};
