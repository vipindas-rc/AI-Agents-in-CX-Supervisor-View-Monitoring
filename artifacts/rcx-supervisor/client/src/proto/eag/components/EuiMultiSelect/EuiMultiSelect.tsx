import { useEffect } from 'react';

import type { IMultiSelectProps } from '@ringcx/ui';
import { MultiSelect } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

const Component = (props: IMultiSelectProps) => {
    useEffect(() => {
        // as part of angularjs code, MultiSelect can't calculate the visibility of items from the cold start
        // to show items correctly we have to force MultiSelect to make a render one more time
        // 'resize' event triggers the calculation of visible/hidden items

        window.dispatchEvent(new Event('resize'));
    }, []);

    return <MultiSelect {...props} />;
};

export default CreateAngularModule(
    'engageUiMultiSelect',
    Component,
    [
        'size',
        'title',
        'placeholder',
        'data',
        'selectedItemsIds',
        'onChange',
        'required',
        'disabled',
        'error',
        'message',
        'enableActions',
        'enableClearButton',
    ],
    []
);
