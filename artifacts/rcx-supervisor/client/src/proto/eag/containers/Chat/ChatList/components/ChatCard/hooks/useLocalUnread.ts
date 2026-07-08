import { useMemo } from 'react';

import type { IChatListContainer } from '../../../types/ChatList';

export const useLocalUnread = (readIndicator?: string, CrmSvc?: any) => {
    const hasReadList = CrmSvc?.messageLogViewedList || [];
    const isViewed = useMemo(() => {
        if (readIndicator) {
            return hasReadList.includes(readIndicator);
        } else {
            return false;
        }
    }, [readIndicator, hasReadList]);
    return {
        isViewed,
        addNewUnread(value: string, CrmSvc: any) {
            const hasReadList: string[] = CrmSvc?.messageLogViewedList || [];
            if (!hasReadList.includes(value)) {
                hasReadList.push(value);
            }
            CrmSvc.setMessageLogViewedList(hasReadList);
        },
        removeAllUnmatchedUnread(
            values: IChatListContainer['chatMap'],
            CrmSvc: any
        ) {
            const hasReadList: string[] = CrmSvc.messageLogViewedList || [];
            const chatUiiList = Object.keys(values).reduce((acc, group) => {
                return acc.concat(values[group].map((e) => e.uii));
            }, [] as string[]);
            CrmSvc.setMessageLogViewedList(
                hasReadList.filter((e) => chatUiiList.includes(e))
            );
        },
    };
};
