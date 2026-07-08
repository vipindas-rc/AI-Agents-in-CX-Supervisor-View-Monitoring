import styled from 'styled-components';

export const StyledParamsLabel = styled.span`
    max-width: 134px;
    word-break: break-all;
`;
export const StyledParamsLabelRequired = styled.span`
    color: ${({ theme }) => theme.colors.accent.orange};
    margin-left: 4px;
`;
