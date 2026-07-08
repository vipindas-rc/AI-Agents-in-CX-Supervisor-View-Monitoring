import type { ReactNode } from 'react';

import { ContentHeaderWrapper } from './ContentHeader.styled';

type PropsType = {
    children: ReactNode;
    className?: string;
};

export const ContentHeader = ({ children, className }: PropsType) => {
    return (
        <ContentHeaderWrapper className={className}>
            {children}
        </ContentHeaderWrapper>
    );
};
