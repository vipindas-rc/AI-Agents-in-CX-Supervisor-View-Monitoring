import { Check } from '@material-ui/icons';
import styled from 'styled-components';

export const CRMSearchResultWrapper = styled.div`
    margin-top: 8px;
`;

export const CRMSearchResultToggleExpand = styled.button`
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.gray[50]};
    height: 20px;
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 12px;
    font-weight: 500;
    padding-left: 5px;
    position: relative;
    width: 100%;
    border: none;
    padding: 0;
`;

export const ArrowTop = styled.span<{ $expanded: boolean }>`
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top: 5px solid ${({ theme }) => theme.colors.gray[700]};
    position: absolute;
    right: 8px;
    top: 8px;
    transition: all 160ms cubic-bezier(0.32, 0, 0.67, 0) 0s;
    transform-origin: 50% 25%;
    transform: rotate(${(props) => (props.$expanded ? '180deg' : '0')});
    cursor: pointer;
`;

export const CRMSearchResultList = styled.div<{ $expanded: boolean }>`
    margin: 6px 0 10px 0;
    transition: all 160ms cubic-bezier(0.32, 0, 0.67, 0) 0s;
    display: grid;
    grid-template-rows: ${(props) => (props.$expanded ? '1fr' : '0fr')};
`;
export const CRMSearchResultListInner = styled.div`
    overflow: hidden;
`;

export const CRMSearchResultListItem = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 14px;
    height: 36px;
    padding: 0 5px;
    cursor: pointer;
`;
export const CRMSearchResultListItemButton = styled.button`
    width: calc(100% - 10px);
    height: 100%;
    border: none;
    background: transparent;
    text-align: left;
    display: flex;
    align-items: center;
    padding: 0;
`;
export const CRMSearchResultListItemText = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    flex-grow: 1;
    width: 220px;
`;

export const CRMSearchResultListItemIconContainer = styled.div`
    width: 20px;
    height: 20px;
    margin-right: 8px;

    svg,
    svg path {
        color: ${({ theme }) => theme.colors.primary};
        fill: currentColor;
    }
`;

export const CRMSearchResultListItemIcon = styled.img`
    height: 100%;
    border-radius: 3px;
`;

export const CRMSearchResultListItemSelected = styled(Check)`
    color: ${({ theme }) => theme.colors.accent.emerald};
    font-size: 20px;
    margin-left: 10px;
`;
