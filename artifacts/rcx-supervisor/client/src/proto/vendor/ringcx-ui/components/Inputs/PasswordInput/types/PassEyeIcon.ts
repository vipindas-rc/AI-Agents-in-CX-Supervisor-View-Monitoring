import type { SyntheticEvent } from 'react';

import type TextInputType from '../../TextInput/types/TextInputType';

interface IPasswordEyeIcon {
    type: TextInputType;
    onClick(e: SyntheticEvent): void;
}

export default IPasswordEyeIcon;
