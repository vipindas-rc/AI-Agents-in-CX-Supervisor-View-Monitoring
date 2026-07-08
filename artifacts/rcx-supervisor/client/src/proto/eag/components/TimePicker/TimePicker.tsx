import { TimePicker } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule('timePicker', TimePicker, [
    'value',
    'format',
    'locale',
    'onChange',
    'popperZindex',
    'legacyMode',
    'scriptPreview',
]);
