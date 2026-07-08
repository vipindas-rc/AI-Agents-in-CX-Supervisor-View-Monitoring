import type { ButtonProps } from '@material-ui/core/Button';
import styled from 'styled-components';

import { CloseSvg, SearchAlt } from '../../../icons';
import IconButton from '../../IconButton/IconButton';
import { StyledLeftIcon, StyledTextInput } from '../TextInput/TextInput.styled';

export const StyledIconButton = styled(IconButton)<{
    size?: ButtonProps['size'];
}>`
    && {
        color: ${({ theme }) => theme.colors.gray[700]};

        &:hover {
            background-color: ${({ theme }) => theme.colors.gray[100]};
            color: ${({ theme }) => theme.colors.gray[900]};
        }
    }
`;

export const StyledClearIcon = styled(CloseSvg)`
    && {
        font-size: 10px;
        color: inherit;
    }
`;

export const StyledSearchIcon = styled(SearchAlt)`
    font-size: 20px;
    vertical-align: text-top;
    color: ${({ theme }) => theme.colors.gray[400]};
`;

export const StyledSearch = styled.div`
    position: relative;
    width: 100%;

    ${StyledTextInput}:focus + ${StyledLeftIcon} ${StyledSearchIcon} {
        color: ${({ theme }) => theme.colors.gray[700]};
    }
`;
