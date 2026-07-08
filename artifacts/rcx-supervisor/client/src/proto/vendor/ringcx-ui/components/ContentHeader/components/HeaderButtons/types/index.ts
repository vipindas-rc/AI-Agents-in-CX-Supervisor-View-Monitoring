import type { ReactNode } from 'react';

import type { IStyledButtonProps } from '../../../../Button';

export type HeaderButtonsItem = Omit<IStyledButtonProps, 'classes'> & {
    title: ReactNode;
};

export interface IHeaderButtons {
    items: HeaderButtonsItem[];
    disabled: boolean;
}
