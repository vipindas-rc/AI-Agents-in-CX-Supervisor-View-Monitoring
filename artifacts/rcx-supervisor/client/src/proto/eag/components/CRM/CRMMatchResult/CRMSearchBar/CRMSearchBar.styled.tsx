import { Search } from '@ringcx/ui';
import styled from 'styled-components';

export const CRMSearchInputWrapper = styled.div`
    position: relative;
`;

export const CRMSearchInput = styled.input`
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    padding-left: 30px;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.25px;
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &[placeholder] {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const StyledSearchIcon = styled(Search)`
    color: ${({ theme }) => theme.colors.gray[800]};
    position: absolute;
    left: 9px;
    top: 9px;
`;
