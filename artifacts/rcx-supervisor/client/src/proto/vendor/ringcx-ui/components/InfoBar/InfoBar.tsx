import type { FC, PropsWithChildren } from 'react';

import { InfoBarStyled } from './InfoBar.styled';
import type { IInfoBarProps } from './types';
import { NotificationTypes } from '../constants/Notifications';

const InfoBar: FC<PropsWithChildren<IInfoBarProps>> = ({
    children,
    className,
    type = NotificationTypes.WARNING,
}) => {
    return (
        <InfoBarStyled {...{ className, type, 'data-aid': 'info-bar' }}>
            {children}
        </InfoBarStyled>
    );
};

export default InfoBar;
