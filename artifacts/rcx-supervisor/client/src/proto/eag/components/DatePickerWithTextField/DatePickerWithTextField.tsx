import { DatePickerWithTextField } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export default CreateAngularModule(
    'datePickerWithTextField',
    DatePickerWithTextField,
    [
        'onChange',
        'defaultValue',
        'locale',
        'required',
        'placeholder',
        'scriptPreview',
    ]
);
