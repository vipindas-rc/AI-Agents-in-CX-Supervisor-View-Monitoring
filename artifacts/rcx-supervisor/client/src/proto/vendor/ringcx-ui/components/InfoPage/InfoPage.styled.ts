import styled from 'styled-components';

export const PageWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 154px;
`;

export const PageTitle = styled.div`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: ${({ theme }) => theme.font.size.heading2};
    font-weight: 500;
    letter-spacing: 0;
    line-height: 22px;
    margin-bottom: 12px;
    margin-top: 32px;
`;

export const PageSubtitle = styled.div`
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: ${({ theme }) => theme.font.size.base};
    font-weight: normal;
    letter-spacing: 0.25px;
    line-height: 20px;
    margin-bottom: 23px;
    white-space: pre-line;
    width: 455px;
    text-align: center;
    min-height: 36px;
`;
