import { createContext } from 'react';

import type { topHatContextValue } from './types';
import { EMPTY_CALLBACK } from '../../helpers/usage';
import { FlatRef } from '../../types/FlatRef';

const TopHatContext = createContext([
    new FlatRef({
        queue: {},
        current: null,
    }),
    EMPTY_CALLBACK,
] as topHatContextValue);

export default TopHatContext;
