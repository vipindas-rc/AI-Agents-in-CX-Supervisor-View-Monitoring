import { AddNew } from '@ringcx/ui';
import styled from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../../constants/app';

export const AddIcon = styled(AddNew)`
    padding-right: 8px;
`;

export const LinkWrapper = styled.div`
    margin: 20px 0;

    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        margin: 10px 13px;
    }
`;
