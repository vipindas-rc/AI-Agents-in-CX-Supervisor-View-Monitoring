import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useCurrentStateWatcher = ($rootScope: any, AgentSvc: any) => {
    const [refreshCurrentStateMode, setRefreshCurrentStateMode] =
        useState<number>(0);

    useEffect(() => {
        const refreshHeaderItems = () =>
            setRefreshCurrentStateMode((state) => (state + 1) % 10);

        return $rootScope.$watchGroup(
            [() => AgentSvc.currentAgentState],
            refreshHeaderItems
        );
    }, []);

    return refreshCurrentStateMode;
};

export default useCurrentStateWatcher;
