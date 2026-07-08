import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

import type { IconButtonProps } from '@material-ui/core/IconButton';
import styled from 'styled-components';

import { TEST_AID } from '../../constants';
import { UNUSED } from '../../helpers/usage';
import IconButton from '../IconButton/IconButton';

export const TopPanelActionsWrapper = styled.div`
    display: flex;
    flex-flow: row;
    align-items: center;
`;

export const TopPanelContainer = styled.header`
    display: flex;
    flex-flow: row;
    align-items: center;
    height: ${({ theme }) => theme.dimensions.topPanelHeight};
    text-align: center;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.gray[0]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};

    ${TopPanelActionsWrapper} {
        justify-content: flex-end;
        flex: 1;
        margin: 0;
    }

    * {
        box-sizing: border-box;
    }
`;

export const StyledIconButton = styled(
    forwardRef<
        HTMLButtonElement,
        PropsWithChildren<{ isOpenMenu?: boolean }> & IconButtonProps
    >(({ isOpenMenu, ...props }, ref) => {
        UNUSED(isOpenMenu);
        return <IconButton ref={ref} {...props} />;
    })
)<{ isOpenMenu: boolean }>`
    && {
        margin: 12px;
        padding: 0;
        cursor: pointer;
        height: 40px;
        width: 40px;
        i {
            font-size: 24px;
            color: ${({ theme, isOpenMenu }) =>
                isOpenMenu ? theme.colors.primary : theme.colors.gray[700]};
        }
    }
`;

export const TopPanelDivider = styled(
    ({ loading, ...props }: { loading?: boolean }) => {
        UNUSED(loading);
        return <div data-aid={TEST_AID.TOP_PANEL_DIVIDER} {...props} />;
    }
)`
    width: 1px;
    height: 32px;
    background: ${({ theme, loading }) =>
        loading ? theme.colors.gray[50] : theme.colors.gray[400]};
    margin: 0 24px;
`;

export const UserMenuWrapper = styled.div`
    margin-right: 12px;
    padding: 2px;

    button {
        padding: 8px;
        i {
            font-size: 24px;
        }
    }
`;
