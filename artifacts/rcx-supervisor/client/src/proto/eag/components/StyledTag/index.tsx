import type { FC, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import {
    StyledCloseIcon,
    StyledTagInner,
    StyledTagCloseButton,
} from './styled';
import { CRM_TAG_CLOSE_ICON } from '../../constants/testIds';

export const StyledTag: FC<{
    color?: string;
    outline?: boolean;
    onClose?: () => void;
    children: ReactNode;
    className?: string;
}> = ({ children, onClose, color, outline, ...restProps }) => {
    const { t } = useTranslation();
    return (
        <StyledTagInner
            color={color}
            outline={outline}
            onClose={onClose}
            {...restProps}
        >
            {children}
            {onClose && (
                <StyledTagCloseButton
                    data-aid={CRM_TAG_CLOSE_ICON}
                    onClick={onClose}
                    aria-label={t('GENERICS.ACTIONS.DELETE')}
                >
                    <StyledCloseIcon color={color} outline={outline} />
                </StyledTagCloseButton>
            )}
        </StyledTagInner>
    );
};
