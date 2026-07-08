import type { FC } from 'react';
import { memo } from 'react';

import { StyledIconButton } from './IconButton.styled';
import { EyeClosed, EyeOpened } from '../../../../icons';
import { TextInputType } from '../../TextInput/types';
import type { IPasswordEyeIcon } from '../types';

const PassEye: FC<IPasswordEyeIcon> = ({ onClick, type }) => (
    <StyledIconButton onClick={onClick}>
        {type === TextInputType.PASSWORD ? <EyeOpened /> : <EyeClosed />}
    </StyledIconButton>
);

export default memo(PassEye);
