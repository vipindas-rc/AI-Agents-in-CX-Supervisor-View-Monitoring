import type { FC } from 'react';

import {
    AppSwitcherBlankWrapper,
    AppSwitcherGrid,
} from './AppSwitcherBlank.styled';
import { size } from './constants';
import Skeleton from '../../../Skeleton';

export const AppSwitcherBlank: FC = () => (
    <AppSwitcherBlankWrapper>
        <Skeleton border={false} width={size} height={size} />
        <AppSwitcherGrid />
    </AppSwitcherBlankWrapper>
);
