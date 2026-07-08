import styled from 'styled-components';

import SingleSelect from '../../../DropDown/SingleSelect';
import { BREAKPOINT_WIDTH } from '../../constant';

export const GroupNavigationStyled = styled(SingleSelect)<{
    widthHeader?: number;
}>`
    height: 40px;
    width: auto;
    min-width: 70px;
    max-width: 400px;
    position: ${({ widthHeader }) =>
        widthHeader && widthHeader <= 680 ? 'inherit' : 'relative'};
    background: none;
    margin-left: -1px;

    .eui-dropdown {
        border-color: transparent;

        &:hover,
        &:focus {
            border-color: ${({ theme }) => theme.colors.gray[300]};
        }

        &.is-open {
            width: ${({ widthHeader }) =>
                widthHeader && widthHeader <= 680 ? '100%' : '400px'};
            background-color: ${({ theme }) => theme.colors.gray[0]};
        }

        .eui-dropdown-toggle {
            padding-left: 16px;
            background-color: ${({ disabled, theme }) =>
                disabled
                    ? theme.colors.gray[50]
                    : theme.colors.contentBackground};

            input {
                background-color: ${({ theme }) =>
                    theme.colors.contentBackground};
            }
        }

        svg {
            margin-left: 8px;
        }
    }
`;

export const GroupDelimiterStyled = styled.div<{
    width?: number;
    disabled?: boolean;
}>`
    background: ${({ theme, disabled }) =>
        theme.colors.gray[disabled ? 200 : 300]};
    height: 24px;
    width: 1px;
    margin-left: ${({ width }) =>
        width && width <= BREAKPOINT_WIDTH ? 4 : 16}px;
`;
