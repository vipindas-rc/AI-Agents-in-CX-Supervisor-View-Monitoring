import type { ChangeEvent } from 'react';

import type { TabsProps } from '@material-ui/core/Tabs';

import type ITabItem from './TabItem';

export interface ITabsProps extends Omit<TabsProps, 'value' | 'onChange'> {
    tabs: ITabItem[];
    initialIndex?: number;
    size?: 'headline' | 'caption';
    // https://github.com/mui-org/material-ui/issues/17454
    value?: string | number;
    onChange?: (
        event: ChangeEvent<Record<string, unknown>>,
        value: string
    ) => void;
    keepAlive?: boolean;
}
