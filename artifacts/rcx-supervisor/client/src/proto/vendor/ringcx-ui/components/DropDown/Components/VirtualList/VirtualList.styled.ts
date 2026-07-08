import styled from 'styled-components';

import { DROPDOWN_H_PADDING } from '../../constants';

export const StyledListMessage = styled.div`
    padding: 11px ${DROPDOWN_H_PADDING}px;
    line-height: 16px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.15px;
    color: ${(p) => p.theme.colors.gray[400]};
`;
