import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { StyledRcTab, StyledRcTabs } from './JupiterTabs.styled';
import type { TabsType } from './types';

export const JupiterTabs: FC<TabsType> = ({ tabs, value, onChange }) => {
    const [selectedTabValue, setSelectedTabValue] = useState<string>(value);

    useEffect(() => {
        setSelectedTabValue(value);
    }, [value]);

    const TabChildren = useMemo(
        () =>
            tabs.map((tab, index) => {
                const { value, label, disabled, unreadCount, ...rest } = tab;
                const tabLabel = `${label}${
                    unreadCount ? ' (' + unreadCount + ')' : ''
                }`;
                return (
                    <StyledRcTab
                        key={index}
                        label={tabLabel}
                        value={value}
                        disabled={disabled}
                        text-color={'primary'}
                        size={'small'}
                        {...rest}
                    />
                );
            }),
        [tabs]
    );

    return (
        <StyledRcTabs
            value={selectedTabValue}
            onChange={onChange}
            variant='moreMenu'
        >
            {TabChildren}
        </StyledRcTabs>
    );
};
