import { useEffect, useRef, useState, useMemo } from 'react';

import { RefreshMd } from '@ringcentral/spring-icon';
import { Button, CircularProgressIndicator } from '@ringcentral/spring-ui';
import { UserService } from '@ringcx/shared';
import { Virtuoso, type VirtuosoHandle, type Components } from 'react-virtuoso';

import { HistoryItem } from './HistoryItem';
import type { ActivityLog } from '../../../../common/services/transport';
import {
    CONTACT_MANAGEMENT_HISTORY_LOADING,
    CONTACT_MANAGEMENT_INTERACTION_LOG,
} from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import translate from '../../../../helpers/translate';
import { ContactAccordion } from '../../components/ContactAccordion';
import { useGetActivities } from '../../hooks';
import { type PageType, CustomerType } from '../../types';

type HistoryListProps = {
    defaultExpanded: boolean;
    contactId: string;
    AgentSvc?: any;
    section: PageType;
    highlightDialogId?: string;
    isLoading: boolean;
    onLoaded: () => void;
    isExternalContact: boolean;
    externalId: string;
};

export const HistoryList = ({
    contactId,
    defaultExpanded,
    AgentSvc = injector('AgentSvc'),
    section,
    highlightDialogId = '',
    onLoaded,
    isLoading: isPageLoading,
    isExternalContact,
    externalId,
}: HistoryListProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const fullUserDetails = UserService.getFullUserDetails();
    const rcAccountId = fullUserDetails.rcAccountId || '';
    const rcxSubAccountId = AgentSvc.agentSettings.accountId || '';
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    const { totalCount, getActivities, hasMore, historyList, isLoading } =
        useGetActivities();

    const finishInitialized = () => {
        setInitialized(true);
        onLoaded();
    };

    const highlightIndex = useMemo(
        () =>
            historyList.findIndex(
                (item) => item.dialogId === highlightDialogId
            ),
        [highlightDialogId, historyList]
    );

    const isHighlightFound = highlightIndex >= 0;

    const initialTopMostItemIndex = isHighlightFound ? highlightIndex : 0;

    useEffect(() => {
        const fetchActivities = async () => {
            if (initialized) return;
            const params = {
                accountId: rcAccountId,
                rcxSubAccountId,
                contactId,
                externalId,
                isExternalContact,
            };
            if (!highlightDialogId) {
                await getActivities(params);
                finishInitialized();
                return;
            }
            const hasMoreOrFirstFetch = hasMore || !historyList.length;
            if (!isHighlightFound && hasMoreOrFirstFetch) {
                await getActivities(params);
                return;
            }
            finishInitialized();
        };

        fetchActivities();
    }, [
        initialized,
        contactId,
        hasMore,
        highlightDialogId,
        isHighlightFound,
        historyList.length,
        rcAccountId,
        rcxSubAccountId,
        externalId,
        isExternalContact,
    ]);

    if (isPageLoading || !historyList.length) {
        return null;
    }

    const renderFooter: Components['Footer'] = () => {
        if (isLoading) {
            return (
                <div
                    className='flex h-16 w-full items-center justify-center py-3'
                    data-aid={CONTACT_MANAGEMENT_HISTORY_LOADING}
                >
                    <CircularProgressIndicator variant='indeterminate' />
                </div>
            );
        }
        if (!hasMore) return null;
        return (
            <div className='border-neutral-b4-t50 flex h-16 items-center justify-center border-0 border-t border-solid py-3'>
                <Button
                    size='large'
                    variant='text'
                    startIcon={RefreshMd}
                    classes={{ root: '!rounded' }}
                    onClick={() =>
                        getActivities({
                            accountId: rcAccountId,
                            rcxSubAccountId,
                            contactId,
                            externalId,
                            isExternalContact,
                        })
                    }
                >
                    {translate('CHAT.INTERACTION_HISTORY.LOAD_MORE')}
                </Button>
            </div>
        );
    };

    const handleDataTracking = (isExpanded: boolean) => {
        const action = 'history ' + (isExpanded ? 'expand' : 'collapse');
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.KnownCustomer,
            section,
            action,
        });
    };

    return (
        <ContactAccordion
            testId={CONTACT_MANAGEMENT_INTERACTION_LOG}
            title={translate('CHAT.INTERACTION_HISTORY.TITLE')}
            subTitle={translate('CHAT.INTERACTION_HISTORY.INTERACTIONS', {
                count: totalCount,
            })}
            key={`${contactId}-interaction-history`}
            defaultExpanded={defaultExpanded}
            classes={{
                expandedRoot: 'min-h-[36rem]',
                panelInnerWrapper: 'pt-0',
            }}
            responsive
            handleDataTracking={handleDataTracking}
        >
            <Virtuoso<ActivityLog>
                ref={virtuosoRef}
                className='h-full'
                data={historyList}
                initialTopMostItemIndex={initialTopMostItemIndex}
                itemContent={(index, item) => (
                    <HistoryItem
                        historyActivity={item}
                        hideDivider={index >= historyList.length - 1 && hasMore}
                        section={section}
                        highlightDialogId={highlightDialogId}
                    />
                )}
                components={{ Footer: renderFooter }}
            />
        </ContactAccordion>
    );
};
