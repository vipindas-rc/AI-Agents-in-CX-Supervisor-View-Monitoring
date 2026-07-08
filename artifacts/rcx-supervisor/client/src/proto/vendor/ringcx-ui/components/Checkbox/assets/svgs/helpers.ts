import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import { InputSize } from '../../../constants/InputSize';

enum Sizes {
    default = 16,
    large = 20,
}
export const checkboxScale = (fontSize: SvgIconProps['fontSize']) => {
    return (
        (fontSize === InputSize.LARGE ? Sizes.large : Sizes.default) /
        Sizes.default
    );
};
export const checkboxSize = (fontSize: SvgIconProps['fontSize']) => {
    return fontSize === InputSize.LARGE ? Sizes.large : Sizes.default;
};
