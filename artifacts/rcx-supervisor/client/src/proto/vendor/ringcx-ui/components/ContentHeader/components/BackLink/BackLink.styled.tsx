import Link from '@material-ui/core/Link';
import styled from 'styled-components';

export const StyledLink = styled(({ ...props }) => <Link {...props} />)`
    && {
        display: flex;
        align-items: center;
        font-size: 16px !important;
        font-weight: normal;
        color: ${({ theme }) => theme.colors.primary};
        letter-spacing: 0.17px;
        line-height: 24px;
        white-space: nowrap;
        &:hover,
        &:active,
        &:focus {
            cursor: pointer;
            text-decoration: none;
            color: ${({ theme }) => theme.colors.primary};
        }

        &:disabled {
            color: ${({ theme }) => theme.colors.gray[400]};
            cursor: default;
            text-decoration: none;
            outline: none;
        }

        svg {
            margin-right: ${({ title }) => (title.length > 0 ? 12 : 0)}px;
        }
    }
`;
