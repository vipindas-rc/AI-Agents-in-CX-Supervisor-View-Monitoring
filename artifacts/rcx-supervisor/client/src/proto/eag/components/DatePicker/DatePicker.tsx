import { DatePicker } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule('datePicker', DatePicker, [
    'value',
    'locale',
    'onChange',
    'format',
    'popperZindex',
    'legacyMode',
    'scriptPreview',
]);
