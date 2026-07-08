import type { ReactNode } from 'react';

import { ReactComponent as EmptyIcon } from './assets/icon.svg';
import {
    EmptyButton,
    EmptyDescription,
    EmptyIconWrapper,
    EmptyTitle,
    EmptyWrapper,
} from './EmptyPage.styled';

type PropsType = {
    icon?: ReactNode;
    title: string;
    description: string;
    buttonText?: string;
    buttonAction?: () => void;
};

export const EmptyPage = ({
    icon,
    title,
    description,
    buttonText,
    buttonAction,
}: PropsType) => (
    <EmptyWrapper>
        <EmptyIconWrapper>{icon || <EmptyIcon />}</EmptyIconWrapper>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>

        {buttonText && (
            <EmptyButton
                color='primary'
                variant='outlined'
                onClick={buttonAction}
            >
                {buttonText}
            </EmptyButton>
        )}
    </EmptyWrapper>
);
