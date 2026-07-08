import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import { CssGridContainerStyled } from './CssGridContainer.styled';

interface ICssGridContainer {
    columns: number;
    'data-aid': string;
    className: string;
    role?: string;
    'aria-label'?: string;
}

export const CssGridContainer = forwardRef<
    HTMLDivElement,
    PropsWithChildren<ICssGridContainer>
>((props, ref) => {
    const { children, columns, className, role } = props;
    return (
        <CssGridContainerStyled
            data-aid={props['data-aid']}
            ref={ref}
            columns={columns}
            className={className}
            role={role}
            aria-label={props['aria-label']}
        >
            {children}
        </CssGridContainerStyled>
    );
});
