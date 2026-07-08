import styled from 'styled-components';

export const TableHeader = styled.div`
    min-height: 42px;
`;

export const HeaderText = styled.div``;

export const TableRow = styled.div`
    min-height: 70px;

    & > div > label {
        margin: 0;
    }
`;

export const ButtonsWrapper = styled.div``;

export const StyledKeyValueVariablesList = styled.div<{
    hideActions?: boolean;
}>`
    width: 100%;
    ${TableHeader}, ${TableRow} {
        display: grid;
        padding: 18px 8px 0;
        grid-template-columns: ${({ hideActions }) =>
            hideActions ? '1fr 2fr' : '2fr 3fr 72px'};
        column-gap: 20px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    }

    ${TableHeader} {
        min-height: 22px;
        padding: 0 8px;
    }

    ${TableHeader} {
        font-weight: ${({ theme }) => theme.font.gridListHead.fontWeight};
        font-size: ${({ theme }) => theme.font.gridListHead.fontSize};
        color: ${({ theme }) => theme.colors.gray[800]};
        letter-spacing: 0.4px;
        line-height: 16px;
    }

    p.MuiFormHelperText-root {
        margin: 8px 0;
    }

    ${ButtonsWrapper} {
        display: flex;
        width: 72px;
        height: fit-content;
        justify-content: space-between;
    }
`;
