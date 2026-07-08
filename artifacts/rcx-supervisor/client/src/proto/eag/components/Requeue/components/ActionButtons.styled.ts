import { IconButton } from '@ringcentral/spring-ui';
import styled from 'styled-components';

export const ButtonsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--sui-spacing-1);
    padding: var(--sui-spacing-4) var(--sui-spacing-6);
`;

export const ActionButtonWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sui-spacing-2);
    min-width: 74px;
`;

export const StyledIconButton = styled(IconButton)`
    cursor: pointer;
    &[data-sui-theme-scope].sui-icon-button-contained,
    [data-sui-theme-scope] &.sui-icon-button-contained {
        background-color: #f3f3f3;
    }
`;

export const ActionButtonLabel = styled.span<{ disabled?: boolean }>`
    line-height: var(--sui-line-height-sm);
    color: ${({ disabled }) =>
        disabled
            ? 'var(--sui-colors-neutral-b3)'
            : 'var(--sui-colors-neutral-b1)'};
    max-width: 74px;
`;
