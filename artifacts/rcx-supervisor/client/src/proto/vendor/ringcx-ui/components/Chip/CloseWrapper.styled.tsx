import styled from 'styled-components';

import { focusVisibleStyles } from '../../helpers/accessibility';

export const StyledCloseWrapper = styled.span`
    margin-left: 8px;
    line-height: 1;

    ${focusVisibleStyles}
`;
