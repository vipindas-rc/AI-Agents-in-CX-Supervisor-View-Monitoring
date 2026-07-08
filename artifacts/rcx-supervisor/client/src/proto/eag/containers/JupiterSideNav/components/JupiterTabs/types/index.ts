import type { ChangeEvent } from 'react';

import type { NavItemProps } from '../../../types';

export type TabsType = {
    tabs: NavItemProps[];
    value: string;
    onChange: (
        event: ChangeEvent<Record<string, unknown>>,
        value: string
    ) => void;
};
