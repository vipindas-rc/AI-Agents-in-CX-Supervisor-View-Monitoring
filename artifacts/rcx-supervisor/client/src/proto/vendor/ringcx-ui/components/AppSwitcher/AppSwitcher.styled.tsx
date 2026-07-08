import { forwardRef, type PropsWithChildren } from 'react';

import { alpha } from '@material-ui/core/styles';
import styled from 'styled-components';

import { UNUSED } from '../../helpers/usage';
import IconButton from '../IconButton/IconButton';
import Popper from '../Popper';
import type { IPopper } from '../Popper/types/Popper';

export const StyledPopper = styled(Popper)<IPopper>`
    && {
        max-width: 100%;
        min-width: 270px;
        min-height: 144px;
        max-height: 480px;
        padding: 14px 12px;
        z-index: ${({ theme }) => theme.zIndexes.popper};
    }
`;

export const StyledIconButton = styled(
    forwardRef<HTMLButtonElement, PropsWithChildren<{ isOpenMenu: boolean }>>(
        ({ isOpenMenu, ...props }, ref) => {
            UNUSED(isOpenMenu);
            return <IconButton ref={ref} {...props} />;
        }
    )
)<{ isOpenMenu: boolean }>`
    && {
        padding: 0;
        cursor: pointer;
        height: 40px;
        width: 40px;

        i {
            font-size: 24px;
            color: ${({ theme, isOpenMenu }) =>
                isOpenMenu ? theme.colors.primary : theme.colors.gray[700]};
        }

        ${({ theme, isOpenMenu }) =>
            isOpenMenu && {
                backgroundColor: alpha(theme.colors.gray[700], 0.17),
            }}
    }
`;

export const AppSwitcherWrapper = styled.div`
    position: relative;
    height: 40px;
    width: 40px;
    margin-right: 12px;
`;
