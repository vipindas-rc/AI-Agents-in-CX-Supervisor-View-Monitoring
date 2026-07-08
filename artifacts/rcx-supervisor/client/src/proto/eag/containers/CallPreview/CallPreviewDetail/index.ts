import { CallPreviewDetail } from './CallPreviewDetail';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'callPreviewDetail',
    CallPreviewDetail,
    [
        'isScriptAvailable',
        'details',
        'leadDetails',
        'loadFrame',
        'contactManagementEnabled',
        'expanded',
        'onTogglePanel',
        'onPanelToggled',
    ],
    [
        '$state',
        'LeadDialogFactory',
        'CallSvc',
        'AgentSvc',
        'LeadSvc',
        'ProgressiveDialSvc',
        'CallPreviewSvc',
    ]
);
