import { AddNew } from '@ringcx/ui';
import styled, { css } from 'styled-components';

export const CRMMatchResultWrapper = styled.div`
    padding: 10px 12px;
`;

export const CRMMatchResultLabel = styled.div<{ $spaceBetween?: boolean }>`
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: 0.4px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: ${({ $spaceBetween }) =>
        $spaceBetween ? 'space-between' : 'flex-start'};
`;
export const CRMMatchResultTip = styled.div<{ gray?: boolean }>`
    border-radius: 2px;
    background: ${({ gray, theme }) =>
        gray ? theme.colors.gray[50] : 'rgba(65, 155, 247, 0.1)'};
    color: ${({ gray, theme }) =>
        gray ? theme.colors.gray[750] : theme.colors.primary};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.25px;
    padding: 0 5px;
    height: 16px;
    line-height: 16px;
    display: inline-block;
    margin-left: 6px;
`;

export const CRMMatchResultFieldCommon = css<{ disabled?: boolean }>`
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    padding-left: 8px;
    color: ${({ disabled, theme }) =>
        disabled ? theme.colors.gray[700] : theme.colors.gray[900]};
    background-color: ${({ disabled, theme }) =>
        disabled ? theme.colors.gray[50] : theme.colors.background};
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.25px;
    width: 100%;
    height: 32px;
    margin-bottom: 10px;
    padding-right: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const CRMMatchResultField = styled.button<{ disabled?: boolean }>`
    ${CRMMatchResultFieldCommon}
    position: relative;
    cursor: pointer;
    text-align: left;
`;

export const ArrowRight = styled.span`
    border: 5px solid transparent;
    border-left: 5px solid ${({ theme }) => theme.colors.gray[800]};
    position: absolute;
    right: 10px;
    top: 10px;
`;

export const CRMMatchResultInput = styled.input<{ disabled?: boolean }>`
    ${CRMMatchResultFieldCommon}
`;

export const CRMMatchResultSelect = styled.div`
    margin-bottom: 10px;
`;

export const AddIcon = styled(AddNew)`
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
`;

export const ErrorMessage = styled.div`
    font-size: 10px;
    font-weight: 400;
    line-height: 16px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: ${({ theme }) => theme.colors.error};
    margin-top: -8px;
    margin-bottom: 10px;
`;

export const AddButton = styled.button`
    padding: 0;
    border: none;
    background-color: transparent;
`;
