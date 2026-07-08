import { DateTimePicker } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule('dateTimePicker', DateTimePicker, [
    'value',
    'locale',
    'onChange',
    'format',
    'popperZindex',
    'legacyMode',
    'ariaLabelledBy',
    'inputId',
]);
