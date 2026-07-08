import type { StyledComponent } from '@mui/styled-engine';
import AceEditor from 'react-ace';
import styled from 'styled-components';

export const StyledAceEditor: StyledComponent<typeof AceEditor> = styled(
    AceEditor
)`
    &&& {
        width: 100%;
        height: 100%;
        font-size: 12px;
        min-width: 590px;
        max-width: 860px;
        border: ${({ theme }) => `1px solid ${theme.colors.gray[300]}`};
    }
`;
