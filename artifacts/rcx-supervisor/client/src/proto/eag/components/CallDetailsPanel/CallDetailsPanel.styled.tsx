import { LinkButton } from '@ringcx/ui';
import styled from 'styled-components';

import { device } from '../../constants/breakpoints';

export const PanelTitle = styled.div`
    font-size: 16px;
    font-weight: 500;
    height: 24px;
    letter-spacing: 0.17px;
    line-height: 24px;
`;

export const PanelHeader = styled.div`
    padding-left: 18px;
    padding-right: 18px;
    padding-top: 18px;
    padding-bottom: 6px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    @media ${device.crm} {
        padding: 15px 15px 0 15px;
    }
`;

export const HeaderContent = styled.div`
    padding-bottom: 14px;
`;

export const PanelBody = styled.div`
    padding-left: 18px;
    padding-right: 18px;
    padding-bottom: 18px;
    max-width: 1000px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    @media ${device.crm} {
        padding: 0 15px 15px 15px;
    }
`;

export const CallDetailsPanelStyled = styled.div`
    border-radius: 3px;
    border: 1px solid var(--line-background);
    margin-top: 20px;
    margin-left: 18px;
    margin-right: 18px;
    margin-bottom: 18px;
`;

export const EmptyHistoryContentStyle = styled.span`
    color: ${({ theme }) => theme.colors.gray[800]};
`;

export const EmptyHistoryStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 25px;
`;

export const HistoryRecordSeparator = styled.div`
    padding-left: 18px;
    padding-right: 18px;
    padding-bottom: 18px;
    max-width: 1000px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    ::after {
        content: '';
        display: block;
        width: 100%;
        border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    }
`;
export const CallIDSeparator = styled.div`
    border-left: 1px solid ${({ theme }) => theme.colors.gray[300]};
    height: 20px;
    margin-top: 3px;
`;
export const PanelTitleContent = styled.div`
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;

    .more-btn {
        margin: -8px;

        .material-icons {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .icon-more {
            cursor: pointer;
            vertical-align: middle;
            font-size: 18px;
            color: ${({ theme }) => theme.colors.gray[750]};
        }

        &:focus .icon-more,
        &:hover .icon-more {
            color: ${({ theme }) => theme.colors.gray[900]};
        }
    }
`;

export const OptionStyled = styled.div`
    * {
        margin: 0;
    }

    a {
        padding: 12px 10px 12px 12px;
        color: ${({ theme }) => theme.colors.gray[900]};
        font-weight: 500;
        text-decoration: none;
        text-align: left;
        line-height: 1;
        display: block;
        min-width: 205px;
        cursor: pointer;

        &:hover,
        &:focus {
            background-color: ${({ theme }) => theme.colors.gray[300]};
            color: ${({ theme }) => theme.colors.gray[900]};
            text-decoration: none;

            * {
                text-decoration: none !important;
            }
        }
    }
`;

export const StyledLinkButton = styled(LinkButton)`
    && {
        justify-content: flex-start;
        color: ${({ theme }) =>
            `var(--primary-text-color, ${theme.colors.primary}) !important`};
    }

    &:hover {
        background-color: ${({ theme }) =>
            `var(--menu-item-hover, ${theme.colors.gray[200]}) !important`};
    }
`;
