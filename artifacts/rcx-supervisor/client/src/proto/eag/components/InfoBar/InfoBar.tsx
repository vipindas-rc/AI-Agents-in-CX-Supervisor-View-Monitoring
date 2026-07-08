import type { FC } from 'react';

import { InfoBar as InfobarComponent, InfoBarActionButton } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export const InfoBar: FC<any> = ({
    $state,
    text,
    linkText,
    onLinkClick = () => {},
    type = 'warning',
}) => (
    <InfobarComponent type={type}>
        <span>{text}</span>
        {linkText && (
            <InfoBarActionButton onClick={onLinkClick}>
                {linkText}
            </InfoBarActionButton>
        )}
    </InfobarComponent>
);

export default CreateAngularModule(
    'infobar',
    InfoBar,
    ['text', 'linkText', 'type', 'onLinkClick'],
    ['$state']
);
