import { useEffect, useRef, type PropsWithChildren } from 'react';

import { CollapseLeftMd, CollapseRightMd } from '@ringcentral/spring-icon';
import { IconButton } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { HeaderTabs } from './HeaderTabs';
import type { IUnifiedWidgetHeader } from './types/PhoneDetails';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const UnifiedWidgetHeader = (
    props: PropsWithChildren<IUnifiedWidgetHeader>
) => {
    const isMounted = useRef(false);
    const {
        widgetTitle: title,
        expanded,
        showToggleButton,
        onTogglePanel,
        onPanelToggled,
        isScriptAvailable,
        isAgentPageAvailable,
        selectedTabIndex = 0,
        onTabChange,
    } = props;
    let { children } = props;
    const { t } = useTranslation();

    useEffect(() => {
        isMounted.current = true;
    }, []);

    useEffect(() => {
        if (isMounted.current) {
            onPanelToggled?.(expanded);
        }
    }, [onPanelToggled, expanded]);

    if (!children) {
        const headerTabs = (
            <HeaderTabs
                defaultTitle={title}
                isAgentScriptAvailable={isScriptAvailable}
                isAgentPageAvailable={isAgentPageAvailable}
                selectedTabIndex={selectedTabIndex}
                onTabChange={onTabChange}
            />
        );
        if (headerTabs) {
            children = headerTabs;
        }
    }

    return (
        <div className='flex h-[68px] flex-none items-center justify-between border-0 border-b border-solid border-b-neutral-200 pr-4'>
            {children}
            {showToggleButton && (
                <IconButton
                    variant='icon'
                    size='small'
                    color='secondary'
                    symbol={expanded ? CollapseRightMd : CollapseLeftMd}
                    classes={{
                        root: 'outline-0',
                    }}
                    aria-label={
                        expanded
                            ? t('PHONE.FLYOVER.COLLAPSE_TOOLTIP')
                            : t('PHONE.FLYOVER.EXPAND_TOOLTIP')
                    }
                    TooltipProps={{
                        title: expanded
                            ? t('PHONE.FLYOVER.COLLAPSE_TOOLTIP')
                            : t('PHONE.FLYOVER.EXPAND_TOOLTIP'),
                    }}
                    onClick={onTogglePanel}
                />
            )}
        </div>
    );
};

export default CreateAngularModule(
    'unifiedWidgetHeader',
    UnifiedWidgetHeader,
    [
        'widgetTitle',
        'expanded',
        'showToggleButton',
        'onTogglePanel',
        'onPanelToggled',
        'isScriptAvailable',
        'isAgentPageAvailable',
        'selectedTabIndex',
        'onTabChange',
    ],
    [],
    true
);
