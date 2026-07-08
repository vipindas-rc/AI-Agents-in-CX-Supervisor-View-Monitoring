import { Close } from '@ringcx/ui';
import styled from 'styled-components';

export const StyledTagInner = styled.span<{
    color?: string;
    outline?: boolean;
    onClose?: () => void;
}>`
    position: relative;
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: 0.4px;
    background: ${(props) =>
        props.outline
            ? props.theme.colors.gray[0]
            : props.color || props.theme.colors.primary};
    color: ${(props) =>
        props.outline
            ? props.color || props.theme.colors.primary
            : props.theme.colors.gray[0]};
    border: 1px solid
        ${(props) =>
            props.outline
                ? props.color || props.theme.colors.primary
                : props.theme.colors.gray[0]};
    border-radius: 4px;
    padding: 2px 6px;
    margin: 2px 4px 2px 0;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const StyledCloseIcon = styled(Close)<{
    color?: string;
    outline?: boolean;
}>`
    font-size: 8px;
    color: ${(props) =>
        props.outline
            ? props.color || props.theme.colors.primary
            : 'rgba(255, 255, 255, 0.50)'};
    cursor: pointer;
`;

export const StyledTagCloseButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    margin: 0;
`;
