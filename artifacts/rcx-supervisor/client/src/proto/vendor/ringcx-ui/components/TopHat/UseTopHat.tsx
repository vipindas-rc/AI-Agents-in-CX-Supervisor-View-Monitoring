import { useContext, useRef } from 'react';

import { topHatHelpers } from './helpers';
import TopHatContext from './TopHatContext';

const useTopHat = () => {
    const [topHatState, setTopHatState] = useContext(TopHatContext);
    const t = useRef<number | null>(null);
    const helpers = topHatHelpers(topHatState, setTopHatState, t);

    return helpers;
};

export default useTopHat;
