import { TextEclipse } from '@ringcx/ui';
import styled from 'styled-components';

export const TableContainer = styled.div`
    width: 100%;
    background: var(--sui-colors-neutral-base);
    display: flex;
    position: relative;
`;

export const TableSection = styled.div<{
    $isHeader?: boolean;
    $isFooter?: boolean;
}>`
    width: 100%;
    background: var(--sui-colors-neutral-base);
    overflow-x: auto;
    position: sticky;
    font-weight: 500;
    ${(props) => (props.$isHeader ? 'top: 0px;' : '')}
    ${(props) => (props.$isFooter ? 'bottom: 0;' : '')}
    z-index: 2;
    /* Hide scrollbar for Webkit browsers */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for Firefox */
    scrollbar-width: none;

    /* Hide scrollbar for IE and Edge */
    -ms-overflow-style: none;
`;

export const TableRow = styled.div<{ $width?: number }>`
    display: flex;
    height: 36px;
    width: ${(props) => (props.$width ? `${props.$width}px` : 'auto')};
`;

export const TableFixedColumn = styled.div<{
    $isHeader?: boolean;
    $isFooter?: boolean;
    $isData?: boolean;
}>`
    width: 130px;
    height: 36px;
    background: ${(props) =>
        props.$isData
            ? 'var(--sui-colors-neutral-base)'
            : 'var(--sui-colors-juno-migration)'};
    position: sticky;
    left: 0;
    z-index: ${(props) => (props.$isData ? '1' : '3')};
    display: flex;
    align-items: center;
    box-shadow: 140px 0 100px 0 rgb(0 0 0 / 7%);
    padding: ${(props) =>
        props.$isHeader
            ? '10px 10px'
            : props.$isFooter
              ? '0 8px'
              : props.$isData
                ? '10px 10px'
                : '0 8px'};

    font-weight: ${(props) => (props.$isData ? '400' : '500')};
    font-size: ${(props) => (props.$isHeader ? '11px' : '12px')};
    color: var(--primary-text-color);
    justify-content: ${(props) =>
        props.$isHeader ? 'center' : props.$isData ? 'flex-end' : 'flex-start'};
    text-align: center;
    box-sizing: border-box;
    ${(props) => props.$isFooter && 'padding-left: 4px;'}
    border-right: 1px solid var(--text-input-border);
    border-bottom: 1px solid var(--text-input-border);
    ${(props) =>
        props.$isHeader && 'border-top: 1px solid var(--text-input-border)'};
    ${(props) => props.$isHeader && 'cursor: pointer;'};
`;

export const TableScrollableColumns = styled.div`
    display: flex;
`;

export const TableCell = styled.div<{
    $isHeader?: boolean;
    $isData?: boolean;
    $columnWidth?: number;
}>`
    display: flex;
    align-items: center;
    justify-content: ${(props) => (props.$isHeader ? 'center' : 'flex-end')};
    height: 36px;
    background: ${(props) =>
        props.$isData
            ? 'var(--sui-colors-neutral-base)'
            : 'var(--sui-colors-juno-migration)'};
    font-weight: ${(props) => (props.$isData ? '400' : '500')};
    font-size: ${(props) => (props.$isHeader ? '11px' : '12px')};
    color: var(--primary-text-color);
    width: ${(props) =>
        props.$isHeader
            ? 'auto'
            : props.$columnWidth
              ? `${props.$columnWidth}px`
              : '80px'};
    ${(props) => props.$isHeader && 'min-width: 60px; max-width: 80px;'}
    text-align: center;
    box-sizing: border-box;
    padding: ${(props) => (props.$isHeader ? '0 0 0 8px' : '0 8px')};
    border-right: 1px solid var(--text-input-border);
    border-bottom: 1px solid var(--text-input-border);
    ${(props) =>
        props.$isHeader && 'border-top: 1px solid var(--text-input-border)'};
    ${(props) => props.$isHeader && 'cursor: pointer;'};
`;

export const TableScrollableContainer = styled.div<{ $isMainBody?: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => (props.$isMainBody ? 'flex: 1;' : '')}
    ${(props) => (props.$isMainBody ? 'overflow-x: auto;' : '')}
    ${(props) =>
        props.$isMainBody &&
        `
    /* Hide scrollbar for Webkit browsers */
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Hide scrollbar for Firefox */
    scrollbar-width: none;
    
    /* Hide scrollbar for IE and Edge */
    -ms-overflow-style: none;
  `}
`;

export const CellText = styled.span`
    white-space: nowrap;
    max-width: 100%;
    display: block;
    text-align: left;
`;

export const EclipseCellText = styled(TextEclipse)`
    text-align: left;
`;

export const SortIconButton = styled.button`
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    cursor: pointer;
`;
