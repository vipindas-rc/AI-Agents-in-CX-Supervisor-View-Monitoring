import styled, { css } from 'styled-components';

import type { ITextOverflow } from './types/TextOverflow';

export const textOverflowStyles = css`
    & {
        display: inline-block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        vertical-align: middle;
        position: relative;
        max-width: 100%;

        > :first-child {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        & > * * {
            touch-action: none;
            pointer-events: none;
        }
    }
`;

export default styled('span')<ITextOverflow>`
    ${({ maxHeight }) =>
        maxHeight &&
        css`
            max-height: ${maxHeight};
        `}
    ${textOverflowStyles};
`;
