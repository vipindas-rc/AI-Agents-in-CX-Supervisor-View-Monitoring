import { css, styled, spacing, RcButton } from '@ringcentral/juno';

import type { ButtonType } from './types/BigActionButton';
import { BUTTON_TYPES } from '../../constants/BigActionButton';

export const StyledRcButton = styled(RcButton)<{
    buttonType?: ButtonType;
}>`
    &[class*='RcButton'] {
        margin-top: ${spacing(6)};
        padding: 0 ${spacing(4)};
    }

    .icon {
        font-size: 20px;
        margin-right: ${spacing(2)};
        margin-left: -${spacing(1)};
    }

    p {
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
    }

    &:hover {
        background-color: rgba(102, 102, 102, 0.14);
    }

    ${({ buttonType }: { buttonType?: string }) => {
        return (
            buttonType === BUTTON_TYPES.START_WORKING &&
            css`
                &[class*='RcButton'] {
                    margin-top: ${spacing(8)};
                    padding: 0 ${spacing(5)};
                }
                p {
                    font-size: 16px;
                }
            `
        );
    }}

    ${({ buttonType }: { buttonType: string }) => {
        return (
            buttonType === BUTTON_TYPES.FETCH_LEADS &&
            css`
                &[class*='RcButton'] {
                    margin-top: 0;
                }
            `
        );
    }}
`;

StyledRcButton.defaultProps = {};
