import { UnifiedCallPreviewDetails } from './UnifiedCallPreviewDetails';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'unifiedCallPreviewDetails',
    UnifiedCallPreviewDetails,
    [
        'displayMainColumn',
        'expanded',
        'onTogglePanel',
        'onPanelToggled',
        'leadDetails',
        'isRcAgent',
        'details',
    ],
    [
        'AgentSvc',
        'CallSvc',
        'SessionSvc',
        'CallPreviewSvc',
        'LeadSvc',
        'ProgressiveDialSvc',
        'LeadDialogFactory',
        '$state',
    ],
    true
);
