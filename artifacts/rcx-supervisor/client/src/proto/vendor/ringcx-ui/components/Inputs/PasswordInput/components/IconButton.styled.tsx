import type { ButtonProps } from '@material-ui/core/Button';
import styled from 'styled-components';

import IconButton from '../../../IconButton';

export const StyledIconButton = styled(IconButton)<{
    size?: ButtonProps['size'];
}>`
    && {
        padding: ${({ size }) => (size === 'small' ? 4 : 8)}px;
        margin-right: ${({ size }) => (size === 'small' ? 4 : 0)}px;

        &:hover {
            #strokedEye,
            #eyeOpened,
            #eyeClosed {
                fill: ${({ theme }) => theme.colors.gray[900]};
            }
        }
    }
`;
