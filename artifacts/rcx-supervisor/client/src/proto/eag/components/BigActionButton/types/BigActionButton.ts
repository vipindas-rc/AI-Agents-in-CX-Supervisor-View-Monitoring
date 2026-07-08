import { type RcButtonProps } from '@ringcentral/juno';

export enum ButtonType {
    START_WORKING = 'startWorking',
    FETCH_LEADS = 'fetchLeads',
}

export interface ActionButtonsProps extends Omit<RcButtonProps, 'symbol'> {
    buttonType?: ButtonType;
    title?: string;
    label?: string;
}
