import { type FC } from 'react';

import { Button } from '@ringcx/ui';

import { MonitorDialogContainer, DialogModal } from './Supervisor.styled';
import type { IMonitorDialog } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';
import translate from '../../helpers/translate';

export const MonitorDialog: FC<IMonitorDialog> = ({
    onConfirm,
    title,
    agent,
    customer,
    open,
    onCloseModal,
}) => {
    const options = {
        disableBackdropClick: true,
        hideCloseWithX: true,
        maxPaperWidth: 500,
        scrollable: true,
        dialogTitle: title,
        content: <DialogContent agent={agent} customer={customer} />,
        actions: [
            <Button
                key='cancel'
                variant='text'
                onClick={onCloseModal}
                data-aid={SupervisorDataId.MODAL_CANCEL}
            >
                {translate('GENERICS.ACTIONS.CANCEL')}
            </Button>,
            <Button
                key='continue'
                onClick={onConfirm}
                data-aid={SupervisorDataId.MODAL_CONFIRM}
            >
                {translate('GENERICS.ACTIONS.CONFIRM')}
            </Button>,
        ],
        open,
        onClose: onCloseModal,
    };
    return (
        <MonitorDialogContainer>
            <DialogModal {...options} />
        </MonitorDialogContainer>
    );
};
const DialogContent: FC<{ agent?: string; customer?: string }> = ({
    agent,
    customer,
}) => {
    return (
        <div data-aid={SupervisorDataId.DIALOG_MONITOR_CONTAINER}>
            <div>
                {translate('SUPERVISOR.AGENT')} : {agent}
            </div>
            {customer && (
                <div>
                    {translate('SUPERVISOR.CALLER')} : {customer}
                </div>
            )}
        </div>
    );
};
