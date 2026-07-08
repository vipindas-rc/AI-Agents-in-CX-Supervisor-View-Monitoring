import styled from 'styled-components';

export const CRMCallPreviewActionsWrapper = styled.div`
    padding: 12px;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    button {
        width: 133px;
    }
`;

export const CRMCallPreviewActionsSpinner = styled.span`
    font-size: 15px;
    color: ${({ theme }) => theme.colors.gray[700]};
`;
