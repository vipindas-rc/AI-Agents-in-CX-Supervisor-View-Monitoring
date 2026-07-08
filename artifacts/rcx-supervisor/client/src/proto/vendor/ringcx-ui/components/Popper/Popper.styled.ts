import Popper from '@material-ui/core/Popper';
import { alpha } from '@material-ui/core/styles';
import styled from 'styled-components';

export const ToggleWrapper = styled.div<{ disabled?: boolean }>`
    display: inline-block;
    position: relative;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`;

export const StyledPopper = styled(Popper)`
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        max-height: 60vh;
    }

    box-shadow: 0 2px 12px 0
        ${({ theme }) =>
            `var(--box-shadow-2, ${alpha(theme.colors.gray[550], 0.5)})`};
    margin: 4px 0;
    padding: 8px 0;
    cursor: default;
    max-height: 70vh;
    max-width: 270px;
    background-color: ${({ theme }) =>
        `var(--menu-background, ${theme.colors.gray[0]})`};
    border-radius: 3px;
    overflow-y: auto;
`;

export const MenuContainer = styled.div`
    outline: none;
`;
