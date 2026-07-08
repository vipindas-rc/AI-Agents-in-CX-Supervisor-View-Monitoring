import styled from 'styled-components';

export const CRMCallInfoWrapper = styled.div`
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
    padding: 12px 14px;
    font-size: 12px;
    position: relative;
`;

export const StyledScriptButton = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
`;
export const StyledPhoneTitle = styled.button<{ $clickable: boolean }>`
    font-size: 14px;
    line-height: 24px;
    padding: 0;
    border: none;
    background-color: transparent;
    color: ${({ theme, $clickable }) =>
        $clickable ? theme.colors.primary : theme.colors.accent.black};
    text-decoration: ${({ $clickable }) => ($clickable ? 'underline' : 'none')};
    cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
    display: flex;
    align-items: center;
    vertical-align: middle;
`;

export const StyledPhoneTitleText = styled.p`
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
`;

export const ArrowRight = styled.span`
    display: inline-block;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-left: 5px solid ${({ theme }) => theme.colors.primary};
    margin-left: 5px;
`;

export const StyledExternalLink = styled.i`
    color: ${({ theme }) => theme.colors.gray[800]};
    margin-left: 5px;
    cursor: pointer;
    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

export const StyledDestination = styled.div`
    color: ${({ theme }) => theme.colors.accent.black};
    margin: 8px 0 4px 0;
`;

export const StyledQueueName = styled.div`
    color: ${({ theme }) => theme.colors.accent.black};
    display: flex;
    gap: 2px;
`;

export const StyledQueueNameText = styled.p`
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
`;
export const StyledQueueNameIcon = styled.div`
    color: ${({ theme }) => theme.colors.gray[800]};
`;
