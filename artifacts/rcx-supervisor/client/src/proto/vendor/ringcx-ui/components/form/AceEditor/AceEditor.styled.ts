import styled, { css } from 'styled-components';

import Editor from './AceEditor';

export const StyledEditor = styled(Editor)`
    &&& {
        ${({ theme, error }) => {
            if (error) {
                return css`
                    border: 1px solid ${theme.colors.accent.firetruck};
                `;
            }
        }}
    }
`;
