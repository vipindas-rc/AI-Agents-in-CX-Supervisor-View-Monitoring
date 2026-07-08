import styled from 'styled-components';

import AvatarUserCircle from './assets/svgs/AvatarUserCircle';
import IconButton from '../../../IconButton/IconButton';
import type { IIconButtonProps } from '../../../IconButton/types/IconButton';
import Popper from '../../../Popper';

export const UserMenuDivider = styled.div`
    margin: 8px 16px 6px;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

export const StyledPopper = styled(Popper)`
    z-index: ${({ theme }) => theme.zIndexes.popper};
    margin: 8px 0 6px;
    padding-bottom: 6px;
    min-width: 200px;
    max-width: 450px;
    border-radius: 4px;
    .MuiPopover-paper {
        max-width: none;
        padding: 16px 0 0;
        line-height: 20px;
        letter-spacing: 0;
    }
    * {
        box-sizing: border-box;
    }
    overflow-y: visible;
`;

export const StyledUserToggleButton = styled(IconButton)<IIconButtonProps>`
    && {
        background-color: ${({ theme }) => theme.colors.accent.darkLake};
        padding: 0;

        &:hover {
            background-color: ${({ theme }) => theme.colors.accent.darkNight};
        }
    }
`;

export const size = 36;
const sizeAvatar = `${size}px`;

const avatarDimensions = () => `
    width:  ${sizeAvatar};
    height: ${sizeAvatar};
`;

export const StyledAvatarUserCircle = styled(AvatarUserCircle)`
    ${avatarDimensions};
`;

export const StyledAvatarTextUser = styled.span`
    ${avatarDimensions};
    color: ${({ theme }) => theme.colors.gray[0]};
    font-weight: 500;
    font-size: 14px;
    line-height: ${sizeAvatar};
`;
