import { CallPreviewCard } from './CallPreviewCard';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'callPreviewCard',
    CallPreviewCard,
    [
        'duration',
        'countdown',
        'autoAnswer',
        'onReject',
        'onAccept',
        'timeoutAction',
        'pendingAction',
        'dialDestValue',
        'name',
    ],
    [],
    true
);
