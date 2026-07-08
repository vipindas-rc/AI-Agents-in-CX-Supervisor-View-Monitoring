import { useContext, useEffect, useState } from 'react';

import { useAngularModule } from './useAngularModule';
import { LogKindContext, LogKindType } from '../../../helpers/logKind';
import { DataTrackingEventNames } from '../constants';

export function useDataTracking({
    isMatched,
    eventMatchedItems,
    peopleMatchedItems,
}: {
    isMatched: boolean;
    eventMatchedItems?: any[];
    peopleMatchedItems?: any[];
}) {
    const logKind = useContext(LogKindContext);
    const AnalyticsSvc = useAngularModule('AnalyticsSvc');
    const [eventLogged, setEventLogged] = useState(false);
    const eventName =
        logKind?.logKindType === LogKindType.VOICE
            ? DataTrackingEventNames.ViewedRCXVoiceMatchPage
            : DataTrackingEventNames.ViewedRCXDigitalMatchPage;

    useEffect(() => {
        if (!isMatched) {
            return;
        }
        if (!eventLogged) {
            AnalyticsSvc.track(eventName, {
                eventMatched: eventMatchedItems?.length || 0,
                peopleMatched: peopleMatchedItems?.length || 0,
            });
            setEventLogged(true);
        }
    }, [
        isMatched,
        eventMatchedItems,
        peopleMatchedItems,
        eventLogged,
        AnalyticsSvc,
        eventName,
    ]);
}
