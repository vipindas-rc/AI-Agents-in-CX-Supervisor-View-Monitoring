import { IconButton, focusVisibleStyles } from '@ringcx/ui';
import styled from 'styled-components';
export const StyledActionButton = styled(IconButton)`
    && {
        padding: 3px;

        &:hover {
            background: ${({ theme }) => theme.colors.gray[300]};
        }

        ${focusVisibleStyles}
    }
`;

export const CompleteActionButton = styled(StyledActionButton)`
    && {
        font-size: 12px;
        border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    }
`;
