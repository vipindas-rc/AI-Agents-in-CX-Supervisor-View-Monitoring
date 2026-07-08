import type { MouseEvent } from 'react';

import type { INotificationType } from '../../constants/types';

export type topHatContextValue = [ITopHatState, (x: ITopHatState) => void];

export interface IActionButton {
    actionTitle: string;
    external?: boolean;
    action(event?: MouseEvent<HTMLElement>): void;
}
export interface ITopHatOptions {
    primary?: IActionButton;
    secondary?: IActionButton;
    closeWithX?: ICloseActionButton;
    timeout?: number;
}

export type ICloseActionButton = Pick<IActionButton, 'action'>;

export interface ITopHatState extends INotificationType {
    message: string;
    open: boolean;
    options?: ITopHatOptions;
}

export type BuildNewTopHatFunction = (
    color: ITopHatState['type'],
    message: string,
    options?: ITopHatOptions
) => void;

export interface ITopHatService {
    open: () => void;
    close: () => void;
    toggle: () => void;
    clear: () => void;

    get: () => ITopHatState;

    info: (message: string, options?: ITopHatOptions) => void;
    error: (message: string, options?: ITopHatOptions) => void;
    warning: (message: string, options?: ITopHatOptions) => void;
    success: (message: string, options?: ITopHatOptions) => void;
}
