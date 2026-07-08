import type { FC } from 'react';

import { ContentHeader } from '@ringcx/ui';

import type { IDigitalInteractionHeader } from './types/DigitalInteractionHeader';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const DigitalInteractionHeader: FC<IDigitalInteractionHeader> = ({
    backOnClick,
}) => {
    const backTitle = translate('PHONE.MENU_BUTTON_LABEL.SUPERVISOR');

    return (
        <ContentHeader
            {...{
                backTitle,
                backOnClick,
            }}
        />
    );
};

export default CreateAngularModule(
    'digitalInteractionHeader',
    DigitalInteractionHeader,
    ['backOnClick'],
    []
);
