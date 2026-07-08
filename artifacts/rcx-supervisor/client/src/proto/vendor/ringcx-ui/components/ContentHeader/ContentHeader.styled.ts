import styled, { css } from 'styled-components';

import { BREAKPOINT_WIDTH } from './constant';
import { ContentItemsStyleType } from './types';

export const HeaderWrapper = styled.div<{
    width?: number;
}>`
    display: flex;
    ${({ width }) =>
        width && width <= BREAKPOINT_WIDTH
            ? css`
                  grid-template-columns: min-content 4px minmax(70px, 1fr) 40px;
              `
            : css`
                  grid-template-columns:
                      minmax(50px, min-content) 16px minmax(min-content, 1fr)
                      40px;
              `}
    width: 100%;
    align-items: center;
    justify-content: space-between;
    position: relative;
    border-bottom: 2px solid ${({ theme }) => theme.colors.gray[100]};
    background-color: ${({ theme }) => theme.colors.gray[0]};

    ${({ theme }) =>
        theme.isSWIframe &&
        css`
            border: none;
            border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
            background-color: ${({ theme }) => theme.colors.gray[100]};
        `}

    padding: 0 24px;
    height: 64px;
`;

export const VerticalDivider = styled.div<{ width?: number }>`
    height: 24px;
    width: 1px;
    background-color: ${({ theme }) => theme.colors.gray[300]};
    margin: ${({ width }) => (width && width <= BREAKPOINT_WIDTH ? 4 : 16)}px;

    &:first-child {
        display: none;
    }
`;

export const ItemContentWrapper = styled.div<{
    type: ContentItemsStyleType;
}>`
    white-space: nowrap;
    max-width: 480px;
    overflow: hidden;
    text-overflow: ellipsis;

    ${({ type }) =>
        type === ContentItemsStyleType.LIST &&
        css`
            color: ${({ theme }) => theme.colors.gray[900]};
            font-size: ${({ theme }) => theme.font.size.subheading1};
            letter-spacing: ${({ theme }) => theme.font.letterSpacing.content};
            font-weight: ${({ theme }) => theme.font.sectionHeader.fontWeight};
            line-height: ${({ theme }) => theme.font.lineHeight.content};
        `}
`;

export const BulkContentWrapper = styled.div`
    button {
        white-space: nowrap;
    }
`;

export const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
`;

export const ActionsWrapper = styled.div`
    display: flex;
    align-items: center;
    white-space: nowrap;
`;

export const SearchWrapper = styled.div`
    max-width: 550px;
    min-width: 300px;
    width: 100%;
    margin: 0 32px;
`;
