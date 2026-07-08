import { Popper } from '@ringcx/ui';
import styled from 'styled-components';

export const COUNTER_WIDTH = 50;
export const CATEGORIES_GAP = 5;

export const CategoriesListColumn = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;

    // prevent text eclipsing of the tag component
    & > div[color] {
        overflow: unset;
    }
`;

export const HiddenCategories = styled.div`
    display: flex;
    gap: 5px;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: ${({ theme }) => theme.colors.gray[800]};
`;

export const HiddenCategoriesCounter = styled.div`
    display: inline-flex;
    height: 20px;
    padding: 2px 4px;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.colors.gray[100]};
    border-radius: 2px;
    border: 1px solid transparent;

    &:hover {
        border: 1px solid ${({ theme }) => theme.colors.gray[400]};
    }
`;

export const CategoriesListHiddenItems = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding: 4px 16px;
`;

export const StyledPopper = styled(Popper)`
    max-width: 300px;
    max-height: 300px;
    z-index: 1;
`;
