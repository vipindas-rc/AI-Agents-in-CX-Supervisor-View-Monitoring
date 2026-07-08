import styled from 'styled-components';

import { device } from '../../../constants/breakpoints';

export const CustomerInformationStyled = styled.div`
    height: calc(100% - 14px);
    min-height: 525px;
    margin-top: 14px;
    overflow-y: auto;
    @media ${device.crm} {
        margin-top: 0;
    }
`;
