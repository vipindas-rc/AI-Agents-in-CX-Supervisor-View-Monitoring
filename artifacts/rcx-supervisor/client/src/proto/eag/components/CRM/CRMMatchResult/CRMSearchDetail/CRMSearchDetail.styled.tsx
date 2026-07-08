import { type ReactElement } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import type { TooltipProps } from '@material-ui/core/Tooltip';
import { IconButton, Tooltip } from '@ringcx/ui';
import styled from 'styled-components';

interface StyledTooltipProps extends Omit<TooltipProps, 'children'> {
    className?: string;
    children: ReactElement;
}

export const CRMSearchDetailWrapper = styled.div<{ $show: boolean }>`
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1500;
    background: ${({ theme }) => theme.colors.gray[0]};
    display: ${(props) => (props.$show ? 'block' : 'none')};
`;

export const CRMSearchDetailHeader = styled.div`
    background: ${({ theme }) => theme.colors.gray[0]};
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.15);
    width: 100%;
    height: 36px;
    line-height: 36px;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 12px;
    padding-right: 10px;
`;

export const CRMSearchDetailHeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const CRMSearchDetailHeaderLeft = styled.button`
    display: flex;
    align-items: center;
    cursor: pointer;
    border: none;
    background: transparent;
`;

export const CRMSearchDetailBackIcon = styled.span`
    width: 9px;
    height: 9px;
    border-left: 2px solid ${({ theme }) => theme.colors.gray[850]};
    border-bottom: 2px solid ${({ theme }) => theme.colors.gray[850]};
    transform: rotate(45deg);
    margin-right: 5px;
`;

export const CRMSearchDetailMenu = styled(Menu)`
    margin-top: 15px;
    z-index: 5000 !important;
`;
export const CRMSearchDetailMenuBtn = styled.button`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.gray[0]};
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const CRMSearchDetailMenuItem = styled(MenuItem)`
    min-height: 30px;
    font-size: 14px;
`;

export const CRMSearchDetailBody = styled.div`
    padding: 12px 12px 0 12px;
    overflow-y: auto;
    max-height: calc(100% - 36px);
    padding-bottom: 50px;
`;
export const CRMSearchResultEmpty = styled.div`
    text-align: center;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[800]};
    width: 110px;
    margin: 20px auto 0 auto;
    &.ServiceNow {
        width: 112px;
    }
`;

export const CRMSearchResultBothEmpty = styled.p`
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0.4px;
    word-wrap: break-word;
    text-align: center;
    margin-top: 170px;
`;

export const StyledTooltip = ({
    className,
    children,
    ...props
}: StyledTooltipProps) => <Tooltip {...props}>{children}</Tooltip>;

export const CRMSearchDetailMenuItemWrapper = styled.div`
    width: 100%;
    display: flex;
`;
