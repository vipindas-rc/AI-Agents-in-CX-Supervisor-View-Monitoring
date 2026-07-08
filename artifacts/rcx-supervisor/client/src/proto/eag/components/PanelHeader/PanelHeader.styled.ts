import { styled } from 'styled-components';

export const PanelHeaderWrapper = styled.h3<{ sticky: boolean }>`
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
    box-sizing: border-box;
    background-color: ${({ theme }) => theme.colors.gray[50]};
    display: flex;
    flex-shrink: 0;
    font-size: 21px;
    font-weight: normal;
    height: 68px;
    letter-spacing: 0.16px;
    margin: 0;
    padding: 0 16px;
    position: ${({ sticky }) => (sticky ? 'sticky' : 'static')};
    text-align: left;
    top: 0;
`;
