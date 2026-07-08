import styled from 'styled-components';

import Checkbox from '../../Checkbox';

export const TableCheckbox = styled(Checkbox)`
    && {
        opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
        color: ${({ theme }) => theme.colors.primary};
        &:hover {
            background-color: inherit;
        }
    }
`;
