import { styled } from 'styled-components';

import {
    regularUserBaseGridStyle,
    superUserBaseGridStyle,
} from '../../AccountPicker.styled';

export const StyledTickContainer = styled.div`
    width: 16px;
`;
export const StyledRowDataContainer = styled.div``;
export const StyledRow = styled.div<{
    isChecked?: boolean;
    isSuperUser?: boolean;
}>`
    display: grid;
    ${({ isSuperUser }) =>
        isSuperUser ? superUserBaseGridStyle : regularUserBaseGridStyle}
    height: 100%;
    align-items: center;
`;
