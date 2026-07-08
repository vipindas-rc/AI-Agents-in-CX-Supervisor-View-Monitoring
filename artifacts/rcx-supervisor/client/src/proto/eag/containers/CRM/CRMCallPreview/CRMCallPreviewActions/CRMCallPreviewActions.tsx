import { useTranslation } from 'react-i18next';

import {
    CRMCallPreviewActionsWrapper,
    CRMCallPreviewActionsSpinner,
} from './CRMCallPreviewActions.styled';
import CreateAngularModule from '../../../../helpers/CreateAngularModule';
import {
    CallPreviewActions,
    type CallPreviewActionsProps,
} from '../../../CallPreview/CallPreviewCard/CallPreviewActions';
import { TimeoutAction } from '../../../CallPreview/CallPreviewCard/types';

export const CRMCallPreviewActions = (props: CallPreviewActionsProps) => {
    const { pendingAction } = props;
    const isAcceptPending = pendingAction === TimeoutAction.Accept;
    const { t } = useTranslation();
    return (
        <CRMCallPreviewActionsWrapper>
            {isAcceptPending && (
                <CRMCallPreviewActionsSpinner>
                    {t('PHONE.CALL_PREVIEW.ACCEPT_PENDING')}
                </CRMCallPreviewActionsSpinner>
            )}
            {!isAcceptPending && (
                <CallPreviewActions
                    {...props}
                    size='medium'
                ></CallPreviewActions>
            )}
        </CRMCallPreviewActionsWrapper>
    );
};

export default CreateAngularModule(
    'crmCallPreviewActions',
    CRMCallPreviewActions,
    [
        'countdown',
        'duration',
        'autoAnswer',
        'onReject',
        'onAccept',
        'timeoutAction',
        'pendingAction',
    ],
    []
);
