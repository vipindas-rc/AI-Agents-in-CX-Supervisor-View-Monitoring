import type { ChangeEvent } from 'react';

import { Tabs } from '@ringcx/ui';
import styled from 'styled-components';

import { MIDDLE_PANEL_TAB_TYPES } from '../../constants/middlePanelTabs';
import translate from '../../helpers/translate';
import { TabsStyled } from '../../layout/CallDetails/components/Flyover.styled';

const HeaderTabsStyled = styled(TabsStyled)`
    > * > * {
        height: 100% !important;
    }

    && {
        div.MuiTabs-root {
            border-bottom: none !important;
            height: 100%;
        }
        div.MuiTabs-flexContainer,
        button.MuiButtonBase-root {
            height: 100% !important;
        }
    }
`;

type HeaderTabsProps = {
    isAgentScriptAvailable?: boolean;
    isAgentPageAvailable?: boolean;
    selectedTabIndex?: number;
    onTabChange?: (index: number) => void;
    defaultTitle?: React.ReactNode;
};

export function HeaderTabs({
    isAgentScriptAvailable,
    isAgentPageAvailable,
    selectedTabIndex = 0,
    onTabChange,
    defaultTitle,
}: HeaderTabsProps) {
    if (!!isAgentScriptAvailable && !!isAgentPageAvailable) {
        const selectedTabType =
            selectedTabIndex === 0
                ? MIDDLE_PANEL_TAB_TYPES.AGENT_PAGE
                : MIDDLE_PANEL_TAB_TYPES.SCRIPT;

        return (
            <HeaderTabsStyled
                id='dynamic-content-tabs'
                data-selected-tab-type={selectedTabType}
            >
                <Tabs
                    tabs={[
                        { label: translate('RIGHT_PANEL.TABS.WORKFLOW') },
                        { label: translate('RIGHT_PANEL.TABS.SCRIPT') },
                    ]}
                    value={selectedTabIndex}
                    onChange={(
                        _event: ChangeEvent<Record<string, unknown>>,
                        value: string
                    ) => onTabChange?.(Number(value))}
                    size={'headline'}
                />
            </HeaderTabsStyled>
        );
    }
    if (isAgentScriptAvailable) {
        return (
            <h2 className='typography-subtitle px-4'>
                {translate('RIGHT_PANEL.TABS.SCRIPT')}
            </h2>
        );
    }
    if (isAgentPageAvailable) {
        // keep the header tab empty for agent page, and maintain the layout untouched
        return <h2 className='typography-subtitle px-4' />;
    }
    return defaultTitle ? (
        <h2 className='typography-subtitle px-4'>{defaultTitle}</h2>
    ) : null;
}
