import styled from 'styled-components';

import { InputWrapper } from '../Input.styled';

export const StyledInputWrapper = styled(InputWrapper)`
    min-height: 32px;
    max-height: 40px;
    & > div {
        border-radius: 4px;
    }
`;
