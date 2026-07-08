import { styled } from 'styled-components';

export const SupervisorAssistWrapper = styled.div`
    border-left: 1px solid ${({ theme }) => theme.colors.gray[200]};
    display: flex;
    flex-direction: column;
    height: 100%;
`;

export const SupervisorAssistHeader = styled.h3`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 500;
    height: 64px;
    line-height: 24px;
    letter-spacing: 0.17px;
    padding: 0 16px;
    margin: 0;
`;
