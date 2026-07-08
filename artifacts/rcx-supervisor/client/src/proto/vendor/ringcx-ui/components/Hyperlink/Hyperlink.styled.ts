import { OpenInNew } from '@material-ui/icons';
import styled from 'styled-components';

import { TextEclipse } from '../TextEclipse';

export const HyperlinkListItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

export const HyperlinkTextEclipse = styled(TextEclipse)`
    max-width: 210px;
`;

export const HyperlinkIconStyled = styled(OpenInNew)`
    color: ${({ theme }) => theme.colors.gray[800]};
    cursor: pointer;
    font-size: 14px;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;
