import styled from 'styled-components';

import type { IChatCard } from './types/ChatCard';
import { Card } from '../../../../../components/Card';
import { RESPONSIVE_BREAKPOINT } from '../../../../../constants/app';

type IStyledCard = Pick<IChatCard, 'waitingForUser' | 'selected'>;

export const StyledCard = styled(Card)<IStyledCard>`
    border-color: ${({ waitingForUser, selected, theme }) =>
        waitingForUser && !selected ? theme.colors.accent.orange : null};

    &&& {
        @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
            border-right: ${({ selected, theme }) =>
                selected ? `4px solid ${theme.colors.primary}` : null};

            &:hover {
                background-color: ${({ theme }) =>
                    theme.colors.accent.lightGreen};
            }
        }
    }
`;

export const Body = styled.div`
    font-size: 14px;
    cursor: pointer;
`;
export const Row = styled.div`
    display: flex;
    min-height: 22px;

    &:nth-child(1) {
        align-items: flex-start;
    }

    &:nth-child(2) {
        align-items: center;
        margin-bottom: 4px;
    }

    &:nth-child(3) {
        align-items: flex-end;
    }
`;

const RowItemOverflow = styled.div`
    flex-wrap: nowrap;

    & > span {
        vertical-align: top;
    }
`;

// top row
export const Title = styled(RowItemOverflow)`
    display: flex;
    gap: 7px;
    margin-right: 10px;
    align-items: center;
    flex: 1;
    font-weight: 500;
    overflow: auto;
    letter-spacing: 0.15px;
`;

export const Timer = styled.div`
    flex: 0 0 auto;
    font-size: 12px;
    text-align: right;
    color: ${({ theme }) => theme.colors.gray[700]};
    letter-spacing: 0.4px;
`;

// middle row
export const Message = styled(RowItemOverflow)`
    flex: 1;
    letter-spacing: 0.25px;
    max-width: 100%;
`;
export const Notification = styled.div`
    flex: 0;
    text-align: right;
`;

// bottom row
const BottomRowPosition = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 10px;
`;

export const TypeIconStyled = styled(BottomRowPosition)`
    flex: 0;
    height: 14px;
    color: ${({ theme }) => theme.colors.accent.tiffany};
`;

export const Actions = styled(BottomRowPosition)`
    flex: 1;
    justify-content: flex-end;
`;

export const Icons = styled.div`
    display: flex;
    align-items: flex-end;
`;
