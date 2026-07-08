import { InteractionList } from './InteractionList';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { withBrandTheme } from '../../helpers/withBrandTheme';

export default CreateAngularModule(
    'interactionList',
    withBrandTheme(InteractionList),
    [
        'chats',
        'chatSvc',
        'loggedInSmsChatQueues',
        'allowSmsChatOnAccount',
        'selectedUii',
        'isInCRM',
        'crmSvc',
        'digitalOutboundChannels',
        'suggestedNumber',
        'notificationSvc',
        'CallSvc',
        'CallPreviewSvc',
        'countdown',
    ],
    [
        '$rootScope',
        '$state',
        'growl',
        'AgentSvc',
        'AnalyticsSvc',
        'SessionSvc',
        'JupiterService',
        'AGENT_EVENTS',
        'CALL_EVENTS',
    ]
);
