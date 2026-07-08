import type { ReactNode, SyntheticEvent } from 'react';

import type { DialogContentProps, DialogTitleProps } from '@material-ui/core';
import type { DialogProps } from '@material-ui/core/Dialog';
import type { DialogActionsProps } from '@material-ui/core/DialogActions';
import type { i18n } from 'i18next';

export interface IStyledDialogProps
    extends Omit<DialogProps, 'children' | 'content'> {
    actions?: ReactNode;
    onClose?: (e: SyntheticEvent) => void;
    content?: ReactNode;
    dialogTitle?: string;
    closeButtonText?: string;
    bottomText?: string;
    hideCloseWithX?: boolean;
    disabledX?: boolean;
    visible?: boolean;
    scrollable?: boolean;
    i18n?: i18n;
}

export interface IStyledDialogActionProps extends DialogActionsProps {
    readonly withBorder: boolean;
}

export interface IStyledDialogContentProps extends DialogContentProps {
    readonly maxWidth: DialogProps['maxWidth'];
    readonly scrollable: boolean;
    readonly withBorder: boolean;
}

export interface IStyledDialogTitleProps extends DialogTitleProps {
    readonly withShadow: boolean;
}
