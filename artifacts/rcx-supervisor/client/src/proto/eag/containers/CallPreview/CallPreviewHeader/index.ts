import { CallPreviewHeader } from './CallPreviewHeader';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'callPreviewHeader',
    CallPreviewHeader,
    [
        'countdown',
        'duration',
        'autoAnswer',
        'onReject',
        'onAccept',
        'timeoutAction',
        'pendingAction',
    ],
    [],
    true
);
