import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import { GL_CLASSES, type GridListType } from '../../GridList';
import { StyledGridListBase } from '../AccountPicker.styled';
import type { GridListAccount } from '../types';

// 40px is height of headers
export const StyledBody = styled.div`
    height: calc(100% - 40px);
    overflow: auto;
`;

export const StyledAccountToggle = styled.a`
    color: ${({ theme }) => theme.colors.gray[800]};
    font-weight: 500;
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
        text-decoration: none;
    }
`;

export const regularUserBaseGridStyle = css`
    grid-template-columns: 16px minmax(auto, 217px) 12% 12% auto;
    grid-gap: 40px;

    & > :nth-child(2) {
        margin-left: -32px;
    }
`;
export const superUserBaseGridStyle = css`
    grid-template-columns:
        16px minmax(auto, 190px) 10% 10% 13% 8% minmax(13%, 1fr)
        70px;
    grid-gap: 16px;

    & > :nth-child(2) {
        margin-left: -8px;
    }
`;
export const accountGridListPadding = css`
    padding: 0 24px;
`;
export const StyledGridList = styled(
    (
        props: {
            isSuperUser?: boolean;
            disableDefaultCheckedHighlight?: boolean;
        } & GridListType<GridListAccount>
    ) => <StyledGridListBase {...props} />
)`
    min-width: 855px;

    .${GL_CLASSES.HEAD_WRAPPER} {
        min-width: 100%;
    }

    .${GL_CLASSES.HEAD} {
        ${({ isSuperUser }) =>
            isSuperUser ? superUserBaseGridStyle : regularUserBaseGridStyle};
        padding: 0 32px;
        align-items: center;
        height: auto;
        min-height: 40px;
    }

    .${GL_CLASSES.ROW} {
        grid-template-columns: 1fr;
        align-items: center;
        padding: 9px 8px;
        height: auto;
        min-height: 40px;
        word-break: break-word;

        &:has(i):not(:hover) {
            background-color: ${({ theme }) =>
                alpha(theme.colors.primary, 0.07)};
        }
    }

    .${GL_CLASSES.LIST} {
        padding: 0 24px 8px;
        min-width: 100%;
    }
`;

export const HeaderColumnWrapper = styled.div`
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
`;
