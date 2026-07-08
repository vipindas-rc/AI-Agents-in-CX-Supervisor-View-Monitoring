import { ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import styled, { css } from 'styled-components';

export const VerticalBar = styled.div`
    width: 4px;
    height: -webkit-fill-available;
    background: ${({ theme }) => theme.colors.primary};
`;

export const StyledListItem = styled(ListItem).withConfig({
    shouldForwardProp: (prop) => !['isChildSelected', 'isOpen'].includes(prop),
})<{
    isChildSelected?: boolean;
    isOpen?: boolean;
    selected?: boolean;
}>`
    &:hover {
        color: ${({ theme }) => theme.colors.main[300]};
        background: transparent;
        ${VerticalBar} {
            background: ${({ theme }) => theme.colors.main[300]};
        }
        svg {
            color: ${({ theme }) => theme.colors.main[300]};
            fill: ${({ theme }) => theme.colors.main[300]};
        }
    }

    ${({ isChildSelected }) =>
        isChildSelected &&
        css`
            color: ${({ theme }) => theme.colors.primary};
            svg {
                color: ${({ theme }) => theme.colors.primary};
                fill: ${({ theme }) => theme.colors.primary};
            }
        `}

    ${({ isOpen, isChildSelected }) =>
        !isOpen &&
        isChildSelected &&
        css`
            color: ${({ theme }) => theme.colors.primary};
            background: ${({ theme }) => theme.colors.gray[150]};
            &:hover {
                background: ${({ theme }) => theme.colors.gray[150]};
            }
        `}

    ${({ selected }) =>
        selected &&
        css`
            &.Mui-selected {
                color: ${({ theme }) => theme.colors.primary};
                background: ${({ theme }) => theme.colors.gray[150]};
                svg {
                    fill: ${({ theme }) => theme.colors.primary};
                    color: ${({ theme }) => theme.colors.primary};
                }

                &:hover {
                    color: ${({ theme }) => theme.colors.primary};
                    background: ${({ theme }) => theme.colors.gray[150]};
                    svg {
                        fill: ${({ theme }) => theme.colors.primary};
                        color: ${({ theme }) => theme.colors.primary};
                    }
                    ${VerticalBar} {
                        background: ${({ theme }) => theme.colors.primary};
                    }
                }
            }
        `}
`;

export const ContentWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

export const Content = styled.div.withConfig({
    shouldForwardProp: (prop) => !['selected', 'isOpen'].includes(prop),
})<{ selected?: boolean; isOpen?: boolean }>`
    display: flex;
    padding: 10px 5px 10px
        ${({ isOpen, selected }) => (!isOpen && selected ? '6px' : '10px')};
`;

export const StyledItemText = styled(ListItemText)`
    width: auto;
    margin: 0;
    font-size: ${({ theme }) => theme.font.size.base};
    line-height: 154%;
    word-break: break-word;
`;
export const StyledSubHeader = styled(ListSubheader)`
    position: relative;
    padding: 8px 0 0 36px;
    color: ${({ theme }) => theme.colors.gray[700]};
    font-size: ${({ theme }) => theme.font.size.subtitle1};
    font-weight: ${({ theme }) =>
        `var(--font-weight-bold, ${theme.font.weight.bold})`};
    height: 28px;
    line-height: 154%;
`;

export const ChildWrapper = styled.div``;

export const ToggleIcon = styled.div`
    padding-right: 10px;
    display: flex;
    align-items: center;
`;
