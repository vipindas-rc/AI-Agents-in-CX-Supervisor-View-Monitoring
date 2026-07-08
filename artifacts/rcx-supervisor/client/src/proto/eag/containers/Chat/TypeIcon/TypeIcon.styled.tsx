import { focusVisibleStyles } from '@ringcx/ui';
import styled from 'styled-components';

interface ITypeIcon {
    inColor: string | undefined;
}
export const StyledTypeIcon = styled.div<ITypeIcon>`
    color: ${({ inColor, theme }) =>
        inColor ? inColor : theme.colors.gray[700]};
    ${focusVisibleStyles}
`;
