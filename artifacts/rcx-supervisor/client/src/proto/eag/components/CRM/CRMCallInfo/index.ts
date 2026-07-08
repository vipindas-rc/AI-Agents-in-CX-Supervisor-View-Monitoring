import { CRMCallInfo } from './CRMCallInfo';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'crmCallInfo',
    CRMCallInfo,
    ['crmCallInfo', 'call', 'destination', 'queueName', 'showCRMSearchDetail'],
    ['CrmSvc']
);
