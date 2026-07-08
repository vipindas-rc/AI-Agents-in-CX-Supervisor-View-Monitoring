import type { FC } from 'react';
import { useCallback, useState, useEffect, useMemo } from 'react';

import { ContentHeader } from '@ringcx/ui';

import type { ISuperviseeDetailHeader } from './types/SuperviseeDetailHeader';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const SuperviseeDetailHeader: FC<ISuperviseeDetailHeader> = ({
    agents,
    onContentItemsChange,
    currentContentItem,
    backOnClick,
    selectedAgentOffline,
    onLogoutAgent,
}) => {
    const [agentOffline, setAgentOffline] = useState(false);
    useEffect(() => {
        setAgentOffline(selectedAgentOffline);
    }, [selectedAgentOffline]);
    const contentItems = useMemo(() => ({ items: agents }), [agents]);
    const actions = useMemo(
        () => [
            {
                label: translate('MONITORING.AGENT_OPTIONS.LOGOUT'),
                action: onLogoutAgent,
                disabled: agentOffline,
                color: '#F44336',
            },
        ],
        [agentOffline]
    );
    const [currentSelectedItem, setCurrentSelectedItem] =
        useState(currentContentItem);

    const onChangeSelectedItem = useCallback((id: string) => {
        setCurrentSelectedItem(id);
        onContentItemsChange && onContentItemsChange(id);
    }, []);
    return (
        <div id='supervisee-detail-header'>
            <ContentHeader
                backTitle={translate('MONITORING.MONITORING')}
                backOnClick={backOnClick}
                contentItems={contentItems}
                currentContentItem={currentSelectedItem}
                onContentItemsChange={onChangeSelectedItem}
                actions={actions}
            />
        </div>
    );
};

export default CreateAngularModule(
    'superviseeDetailHeader',
    SuperviseeDetailHeader,
    [
        'agents',
        'backOnClick',
        'onContentItemsChange',
        'currentContentItem',
        'selectedAgentOffline',
        'onLogoutAgent',
    ],
    []
);
