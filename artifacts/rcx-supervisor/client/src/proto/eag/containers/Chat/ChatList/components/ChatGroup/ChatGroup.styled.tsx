import styled from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../../../../constants/app';

export const GroupHeader = styled.h2`
    font-size: 16px;
    font-weight: 500;
    height: 20px;
    letter-spacing: 0.17px;
    line-height: 20px;
    margin: 27px 0 17px 0;
    max-width: 210px;

    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        font-size: 12px;
        padding: 6px 13px;
        height: auto;
        background: #fff;
        max-width: 100%;
        margin: 0;
        border-bottom: 1px ${({ theme }) => theme.colors.gray[200]} solid;
    }
`;
