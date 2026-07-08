import styled from 'styled-components';

import { multiAccountBaseGridStyle } from '../../MultiAccountPicker.styled';

export const StyledRowContainer = styled.div<{ disabled?: boolean }>`
    display: grid;
    ${multiAccountBaseGridStyle};
    cursor: pointer;
    color: ${({ theme, disabled }) =>
        disabled ? theme.colors.gray[600] : theme.font.color};
`;
