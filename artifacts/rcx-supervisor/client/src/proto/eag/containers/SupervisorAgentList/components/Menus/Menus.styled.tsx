import { alpha } from '@material-ui/core/styles';
import { RcIcon } from '@ringcentral/juno';
import { IconButton, Menu } from '@ringcx/ui';
import styled from 'styled-components';

export const StyledRcIcon = styled(RcIcon)`
    font-size: 18px;
`;

export const StyledIconButton = styled(IconButton)`
    && {
        margin: auto 0;
        color: ${({ theme }) => theme.colors.gray[700]};

        &:hover {
            color: ${({ theme }) =>
                `var(--neutral-f04-rgb, ${theme.colors.gray[900]})`};
            background-color: ${({ theme }) =>
                `var(--neutral-f04-hover, ${theme.colors.gray[200]})`};
        }

        &:disabled {
            color: ${({ theme }) => theme.colors.gray[400]};
        }
    }
`;

export const StyledInformationButton = styled(IconButton)`
    && {
        margin: auto 0;
        color: ${({ theme }) => theme.colors.accent.orange};
        background-color: inherit;

        &:hover {
            background-color: inherit;
        }
    }
`;

export const StyledToolTipLinkButton = styled.a`
    text-decoration: underline;
    color: inherit;

    &:hover {
        color: inherit;
    }
`;

export const StyledMenu = styled(Menu)`
    .MuiListItem-button {
        color: ${({ theme }) => theme.colors.accent.firetruck};
    }
    .MuiPaper-root:focus,
    .MuiPaper-root:active {
        box-shadow:
            0 2px 4px 0 ${({ theme }) => alpha(theme.colors.gray[430], 0.5)},
            0 2px 12px 0 ${({ theme }) => alpha(theme.colors.gray[550], 0.5)} !important;
    }
`;
