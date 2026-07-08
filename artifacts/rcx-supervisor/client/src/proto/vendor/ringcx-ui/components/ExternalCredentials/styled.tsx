import styled, { css } from 'styled-components';

import { UNUSED } from '../../helpers';
import type { IStyledDialogProps } from '../Dialog';
import { Dialog } from '../Dialog';

export type PaperSize = {
    maxPaperWidth?: number;
    minPaperHeight?: number;
};

export const StyledDialog = styled(
    ({
        // maxPaperWidth = 400,
        // minPaperHeight = 200,
        // Does not work, no idea why
        maxPaperWidth,
        minPaperHeight,
        ...rest
    }: IStyledDialogProps & PaperSize) => {
        UNUSED(maxPaperWidth, minPaperHeight);
        return <Dialog {...rest} />;
    }
)`
    .MuiDialogContentText-root {
        margin-bottom: 0;
    }

    && {
        [class*='MuiPaper-root'] {
            width: 100%;
            overflow: visible;
            max-width: ${({ maxPaperWidth }) => `${maxPaperWidth || 400}px`};
            min-height: ${({ minPaperHeight }) => `${minPaperHeight || 200}px`};
        }

        [class*='MuiDialogContent-root'] {
            ${({ scrollable }) =>
                !scrollable &&
                css`
                    overflow: visible;
                `}
        }

        [class*='MuiButton-root'] {
            font-size: 14px;
        }
    }
`;

export const StyledSectionTitle = styled.p`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 18px;
    font-weight: normal;
    letter-spacing: 0;
    line-height: 22px;
    margin-bottom: 24px;
`;
