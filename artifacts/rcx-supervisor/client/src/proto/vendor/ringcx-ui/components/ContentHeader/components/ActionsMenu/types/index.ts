import type { IToolTipProps } from '../../../../Tooltip/types/Tooltip';

export type ActionType = {
    label: string;
    action?(): void;
    disabled?: boolean;
    color?: string;
    tooltipMessage?: IToolTipProps['title'];
    placement?: IToolTipProps['placement'];
};

export type ActionMenuType = {
    actions: ActionType[];
    disabled: boolean;
    accessibilityLabels?: {
        open: string;
        close: string;
    };
};
