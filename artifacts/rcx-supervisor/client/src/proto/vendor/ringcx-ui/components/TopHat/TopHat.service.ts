import type { Dispatch, SetStateAction } from 'react';
import { useRef } from 'react';

import { topHatHelpers } from './helpers';
import type { ITopHatService, ITopHatState } from './types';
import { EMPTY_CALLBACK } from '../../helpers/usage';
import { FlatRef } from '../../types/FlatRef';

export const TopHatService: ITopHatService = {
    push: EMPTY_CALLBACK,
    pop: EMPTY_CALLBACK,

    error: EMPTY_CALLBACK,
    info: EMPTY_CALLBACK,
    success: EMPTY_CALLBACK,
    warning: EMPTY_CALLBACK,

    get: () =>
        new FlatRef({
            queue: {},
            current: null,
        }).deref,
};

export const useTopHatEventService = (
    topHat: FlatRef<ITopHatState>,
    setTopHat: Dispatch<SetStateAction<FlatRef<ITopHatState>>>
) => {
    const t = useRef<number | null>(null);
    const { push, pop, info, error, warning, success, state } = topHatHelpers(
        topHat,
        setTopHat,
        t
    );

    TopHatService.push = push;
    TopHatService.pop = pop;
    TopHatService.info = info;
    TopHatService.error = error;
    TopHatService.warning = warning;
    TopHatService.success = success;
    TopHatService.get = () => state.deref;
};
