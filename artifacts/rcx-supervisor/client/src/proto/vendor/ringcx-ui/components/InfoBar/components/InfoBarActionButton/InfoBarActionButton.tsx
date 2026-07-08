import type { FC, PropsWithChildren } from 'react';

import { InfoBarActionButtonStyled } from './InfoBarActionButton.styled';
import type { IInfoBarActionButtonProps } from './types';

const InfoBarActionButton: FC<PropsWithChildren<IInfoBarActionButtonProps>> = ({
    children,
    onClick,
}) => {
    return (
        <InfoBarActionButtonStyled
            href='#'
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
        </InfoBarActionButtonStyled>
    );
};

export default InfoBarActionButton;
