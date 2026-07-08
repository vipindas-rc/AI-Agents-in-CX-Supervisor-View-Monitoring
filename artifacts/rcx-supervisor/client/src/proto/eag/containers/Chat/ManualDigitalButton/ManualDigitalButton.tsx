import type { FC } from 'react';

import { LinkButton } from '@ringcx/ui';

import { AddIcon, LinkWrapper } from './ManualDigitalButton.styled';
import translate from '../../../helpers/translate';

// cleanup this component after New Message Button is tested and merged
// it was being used only in apps/eag/src/layout/Chat/ChatList/ChatList.tsx
type AriaHasPopup = 'menu' | 'dialog' | 'listbox' | 'tree' | 'grid' | boolean;

interface IManualDigitalButton {
    disabled: boolean;
    ariaHasPopup?: AriaHasPopup;
}
export const ManualDigitalButton: FC<IManualDigitalButton> = ({
    disabled,
    ariaHasPopup,
}) => {
    return (
        <LinkWrapper>
            <LinkButton
                {...{
                    title: translate('CHAT.OUTBOUND.OUTBOUND_DIGITAL'),
                    icon: <AddIcon />,
                    disabled,
                    ...(ariaHasPopup && { 'aria-haspopup': ariaHasPopup }),
                }}
            />
        </LinkWrapper>
    );
};
