import { GridList, theme } from '@ringcx/ui';
import styled from 'styled-components';

export const PREFIX = 'gl';

export const GL_CLASSES = {
    HEAD_WRAPPER: PREFIX + '-head-wrapper',
    HEAD: PREFIX + '-head',
    FOOTER: PREFIX + '-footer',
    HEAD_GROUPED: PREFIX + '-grouped-list',
    LIST: PREFIX + '-list',
    ROW_GROUP: PREFIX + '-row-group',
    ROW_GROUP_EMPTY: PREFIX + '-row-group-empty',
    ROW: PREFIX + '-row',
    ROW_OPEN: PREFIX + '-row-open',
    SUB_ROW: PREFIX + '-sub-row',
    EMPTY_ROW: PREFIX + '-empty-row',
};

export const GL_KEYS = {
    ROW: '_' + PREFIX + '-row',
    ROW_GROUP: '_' + PREFIX + '-row-group',
    SUB_ROW: '_' + PREFIX + '-sub-row',
    EMPTY_ROW: '_' + PREFIX + '-empty-row',
};
export const StyledInteractionRollupList = styled(GridList)`
    height: auto;

    .${GL_CLASSES.HEAD_WRAPPER} {
        width: 100%;
        min-width: auto;
    }

    .${GL_CLASSES.HEAD}, .${GL_CLASSES.ROW} {
        grid-template-columns: calc(50% - 13px) calc(50% - 13px);
        gap: 24px;
        padding-top: 10px;
        padding-left: 10px;
    }

    .${GL_CLASSES.HEAD} {
        width: 100%;
        > div {
            user-select: none;
            min-height: 44px;
            max-height: 72px;

            > span {
                max-width: calc(100% - 55px);
            }
        }
    }

    .${GL_CLASSES.ROW} {
        border-bottom: ${({ theme }) => `1px solid ${theme.colors.gray[300]}`};
        border-top: none;
    }
`;

export const StyledButtonWrapper = styled.div`
    display: flex;
    flex-flow: column;
    align-items: flex-end;
    padding-top: 50px;
`;
export const StyledNameWrapper = styled.div`
    display: flex;
    padding-bottom: 10px;
    word-break: break-all;
`;
export const StyledTotalWrapper = styled.div`
    display: grid;
    grid-template-columns: calc(50% - 13px) calc(50% - 13px);
    gap: 24px;
    padding-left: 10px;
    padding-top: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid ${theme.colors.gray[400]};
`;
export const StyledTotalText = styled.div`
    width: 200px;
    font-weight: 500;
    padding-left: 10px;
`;
export const StyledTotalCount = styled.div`
    font-weight: 500;
`;

export const StyledChannelWrapper = styled.div`
    display: flex;
    gap: 5px;
`;

export const StyledCountWrapper = styled.div``;
