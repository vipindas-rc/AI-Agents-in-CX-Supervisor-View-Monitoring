import styled from 'styled-components';

export const StyledUserInfo = styled.div`
    padding: 10px 16px;
`;

export const UserText = styled.div`
    color: ${({ theme }) => theme.colors.gray[900]};
`;

export const UserName = styled(UserText)`
    font-weight: 500;
    margin-bottom: 10px;
`;

export const UserEmail = styled(UserText)`
    font-weight: 400;
`;
