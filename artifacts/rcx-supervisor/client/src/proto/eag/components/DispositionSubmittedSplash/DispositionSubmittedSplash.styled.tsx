import styled from 'styled-components';

export const MessageText = styled.div`
    font-size: 20px;
    font-weight: 500;
    height: 22px;
    letter-spacing: 0px;
    line-height: 22px;
    text-align: center;
    margin-top: 30px;
`;

export const MessageSubText = styled.div`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-weight: normal;
    height: 22px;
    letter-spacing: 0.25px;
    line-height: 20px;
    text-align: center;
    margin-top: 12px;
    width: 430px;
`;
