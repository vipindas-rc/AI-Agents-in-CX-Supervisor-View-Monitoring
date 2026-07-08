import { createContext, useContext, useEffect, useState, useRef } from 'react';

import { debounce } from 'lodash';

import { useAngularModule } from '../../CRM/Hooks/useAngularModule';

interface StatsDataContextType {
    stats_agent_daily: any;
    stats_campaign: any;
    stats_queue: any;
    stats_chat_queue: any;
}
const StatsDataContext = createContext<StatsDataContextType | undefined>(
    undefined
);

export const useStatsDataContext = () => {
    const context = useContext(StatsDataContext);
    if (!context) {
        throw new Error(
            'useStatsDataContext must be used within a StatsDataProvider'
        );
    }
    return context;
};
const SET_STATS_DATA_DELAY = 50;
export const StatsDataProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const StatsSvc = useAngularModule('StatsSvc');
    const rootScope = useAngularModule('$rootScope');
    const statsEvents = useAngularModule('STATS_EVENTS');

    const [statsData, setStatsData] = useState<StatsDataContextType>({
        stats_agent_daily: StatsSvc['stats_agent_daily'][0],
        stats_campaign: StatsSvc['stats_campaign'][0],
        stats_queue: StatsSvc['stats_queue'][0],
        stats_chat_queue: StatsSvc['stats_chat_queue'][0],
    });
    const statsDataRef = useRef<StatsDataContextType>(statsData);

    useEffect(() => {
        //setState in rootScope.$on will not batched, so we need to debounce the updates
        const debouncedSetStatsData = debounce(() => {
            setStatsData(statsDataRef.current);
        }, SET_STATS_DATA_DELAY);
        const handler = (event: any, data: any) => {
            statsDataRef.current = {
                ...statsDataRef.current,
                [event.name]: data,
            };
            debouncedSetStatsData();
        };
        const unsubscribeAgentDaily = rootScope.$on(
            statsEvents.AGENT_DAILY,
            handler
        );
        const unsubscribeCampaign = rootScope.$on(
            statsEvents.CAMPAIGN,
            handler
        );
        const unsubscribeQueue = rootScope.$on(statsEvents.QUEUE, handler);
        const unsubscribeChat = rootScope.$on(statsEvents.CHAT, handler);
        return () => {
            unsubscribeAgentDaily();
            unsubscribeCampaign();
            unsubscribeQueue();
            unsubscribeChat();
        };
    }, [rootScope, statsEvents]);
    return (
        <StatsDataContext.Provider value={statsData}>
            {children}
        </StatsDataContext.Provider>
    );
};
