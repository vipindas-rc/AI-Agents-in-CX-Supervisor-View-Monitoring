import { Requeue } from './Requeue';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'requeue',
    Requeue,
    [],
    ['CallSvc', 'AcdSvc', 'AgentSvc', 'AnalyticsSvc', 'CrmSvc'],
    true
);

export { Requeue };
