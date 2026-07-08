import styled from 'styled-components';

export const MessageLogStyled = styled.button`
    height: 18px;
    margin-left: 14px;
    position: relative;
    border: none;
    background-color: transparent;
    padding: 0;
`;

export const MessageLogRedDotStyled = styled.div`
    position: absolute;
    width: 4px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.error};
    border-radius: 50%;
    top: -1px;
    right: 2px;
`;
