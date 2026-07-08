import { DialogActions } from '@material-ui/core';
import styled, { css } from 'styled-components';

import { GL_CLASSES } from '../../../components/GridList';
import { UNUSED } from '../../../helpers/usage';
import type { IStyledDialogActionProps } from '../../Dialog';
import { StyledGridListBase, StyledHeader } from '../AccountPicker.styled';

// 40px - height of headers, 88px - height of actions
export const StyledBody = styled.div`
    height: calc(100% - 40px - 88px);
    overflow: auto;
`;

export const StyledMultiHeader = styled(StyledHeader)`
    display: flex;
    align-items: center;
`;

// 245px - width of checkbox to hide/show selected items
export const StyledSearchInputWrapper = styled.div`
    width: calc(100% - 245px);
`;

export const StyledCheckBoxWrapper = styled.span`
    margin: 2px 20px 0;

    .label {
        display: inline;
    }
`;

export const StyledDialogActions = styled(
    ({ withBorder, children, ...rest }: IStyledDialogActionProps) => {
        UNUSED(withBorder);
        return <DialogActions {...rest}>{children}</DialogActions>;
    }
)`
    && {
        border-top: ${({ withBorder, theme }) =>
            `1px solid ${theme.colors.gray[withBorder ? 300 : 0]}`};
        padding: 20px;
        height: auto;
        box-sizing: border-box;
        button:not(:first-child) {
            margin-left: 24px;
        }
    }
`;

export const multiAccountBaseGridStyle = css`
    grid-template-columns: 32px 140px 1fr;
    justify-content: center;
    align-content: center;
    div:nth-child(1) {
        align-self: center;
        > span {
            margin-top: 0;
        }
    }
`;

export const StyleGridList = styled(StyledGridListBase)`
    .${GL_CLASSES.HEAD} {
        ${multiAccountBaseGridStyle};
        padding: 0 24px;
    }
    .${GL_CLASSES.ROW} {
        grid-template-columns: 1fr;
    }
    .${GL_CLASSES.LIST} {
        padding: 0 24px;
    }
`;
