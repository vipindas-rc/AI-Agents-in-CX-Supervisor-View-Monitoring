import type { FC, PropsWithChildren } from 'react';

import { StyledBlinkingCursor } from './BlinkingCursor.styled';
import type { IBlinkingCursor } from './types';

const BlinkingCursor: FC<PropsWithChildren<IBlinkingCursor>> = (props) => (
    <StyledBlinkingCursor {...props} />
);

export default BlinkingCursor;
