import { forwardRef, type MouseEvent, useCallback } from 'react';

import { AIInsights, Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { StyledIconButton } from './Menus.styled';

const ViewInsightsMenu = forwardRef<
    HTMLButtonElement,
    {
        agentId: string;
        viewInsight: (agentId: string, uii: string) => void;
        showViewInsights: boolean;
        uii: string;
    }
>(({ agentId, viewInsight, showViewInsights, uii }, ref) => {
    const { t } = useTranslation();
    const viewAgentInsight = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            viewInsight(agentId, uii);
        },
        [agentId, uii, viewInsight]
    );
    return (
        <Tooltip
            title={t('MONITORING.TOOL_TIP.VIEW_INSIGHTS')}
            placement='left'
        >
            <StyledIconButton
                {...{
                    ref,
                    onClick: viewAgentInsight,
                    size: 'medium',
                    disabled: !showViewInsights,
                }}
            >
                <AIInsights />
            </StyledIconButton>
        </Tooltip>
    );
});

ViewInsightsMenu.displayName = 'ViewInsightsMenu';
export default ViewInsightsMenu;
