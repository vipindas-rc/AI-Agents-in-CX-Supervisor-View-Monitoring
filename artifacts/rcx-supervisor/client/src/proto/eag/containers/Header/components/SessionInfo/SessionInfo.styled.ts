import styled from 'styled-components';
export const SessionContent = styled.div`
    padding: 0;
`;
export const SessionItem = styled.div`
    display: flex;
    flex-direction: column;
    margin: 16px 0;

    &:first-child {
        margin-top: 0;
    }
`;
export const SessionLabel = styled.label`
    display: block;
    margin-bottom: 7px;
    text-transform: none;
    color: ${({ theme }) => theme.colors.gray[850]};
`;
export const SessionLabelValue = styled.span`
    display: block;
    font-size: 14px;
    letter-spacing: 0.75px;
    line-height: 16px;
    word-wrap: break-word;
    color: ${({ theme }) => theme.colors.gray[900]};
`;
export const Divider = styled.hr`
    margin-top: 16px;
    width: 100%;
    margin-bottom: 0;
`;

export const UpdateSessionButton = styled.button`
    border: none;
    padding: 0 !important;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    && {
        margin-top: 16px;
        color: ${({ theme }) => theme.colors['primary']};
        background-color: transparent;
        &:hover,
        &:focus,
        &:focus-visible,
        &:active {
            background-color: ${({ theme }) => theme.colors.gray[0]};
        }
        &:disabled {
            color: ${({ theme }) => theme.colors.gray[500]};
        }
        &:disabled:hover {
            background-color: transparent;
        }
    }
`;
