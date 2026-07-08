import styled from 'styled-components';

export const DEFAULT_LOGO_MARGIN = 20;
export const LOGO_MARGIN_WITH_TOGGLE = 8;

export const StyledLogo = styled.div<{
    withToggle: boolean;
    onClick?(): void;
}>`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: ${({ withToggle }) =>
        withToggle ? LOGO_MARGIN_WITH_TOGGLE : DEFAULT_LOGO_MARGIN}px;
    margin-right: 24px;
    max-width: 166px;
    height: 38px;
    img {
        max-height: 100%;
        max-width: 100%;
    }
    &:hover {
        cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
    }
`;
