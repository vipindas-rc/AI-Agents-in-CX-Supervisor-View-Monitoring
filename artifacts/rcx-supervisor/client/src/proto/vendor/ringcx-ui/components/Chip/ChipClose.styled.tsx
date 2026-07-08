import { alpha } from '@material-ui/core/styles';
import styled from 'styled-components';

import { ChipClose } from './ChipClose';
import type { IChipClose } from './types/ChipClose';

export const StyledChipClose = styled(ChipClose)<IChipClose>`
    height: ${(p) => (p.size === 'medium' ? '16px' : '12px')};
    width: ${(p) => (p.size === 'medium' ? '16px' : '12px')};
    fill: ${(p) =>
        p.disabled
            ? p.theme.colors.gray[400]
            : `var(--white-semi-transparent, ${alpha(
                  p.theme.colors.gray[0],
                  0.5
              )})`};
    vertical-align: middle;
`;
