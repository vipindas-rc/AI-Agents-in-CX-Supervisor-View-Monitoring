import { OpenInNew } from '@material-ui/icons';
import styled from 'styled-components';

export const OpenInNewStyled = styled(OpenInNew)`
    color: ${({ theme }) => theme.colors.gray[800]};
    cursor: pointer;
    font-size: 14px;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

export const HyperlinkIconButton = styled.button`
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
`;
