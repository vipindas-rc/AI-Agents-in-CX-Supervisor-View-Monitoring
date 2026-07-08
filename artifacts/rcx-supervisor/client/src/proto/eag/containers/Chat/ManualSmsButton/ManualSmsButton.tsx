import type { FC } from 'react';

import { LinkButton } from '@ringcx/ui';

import { AddIcon, LinkWrapper } from './ManualSmsButton.styled';
import translate from '../../../helpers/translate';

interface IManualSmsButton {
    onManualSms(): void;
}
export const ManualSmsButton: FC<IManualSmsButton> = ({ onManualSms }) => {
    return (
        <LinkWrapper>
            <LinkButton
                {...{
                    title: translate('CHAT.OUTBOUND.OUTBOUND'),
                    icon: <AddIcon />,
                    onClick: onManualSms,
                }}
            />
        </LinkWrapper>
    );
};
