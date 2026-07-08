import type { MouseEvent, ReactNode, Dispatch, SetStateAction } from 'react';

import type { INotificationType } from '../../constants/types';

export type TwoActionsMax = [IToastAction, IToastAction] | [IToastAction];

export interface IToastAction {
    label: string;
    callback: (event?: MouseEvent<HTMLElement>) => void;
    closeAfter?: boolean;
}

export interface IToastProps extends INotificationType {
    id: string | number;
    text: ReactNode;
    timeout?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
    hasCloseButton?: boolean;
    actions?: TwoActionsMax | [];
    removeToast: (id: IToastProps['id']) => void;
    origin?: string;
    stayOpen?: boolean;
    showAnimation?: boolean;
    uniqId?: number | string;
    disableFocus?: boolean;
}

export interface IToastBuildData
    extends Omit<IToastProps, 'id' | 'removeToast' | 'classes' | 'timeout'> {
    timeout?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
}

export type IParticularToastBuildData = Omit<IToastBuildData, 'type'>;

export type toastContextValue = [
    IToastProps[],
    Dispatch<SetStateAction<IToastProps[]>>,
];
