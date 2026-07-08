import { createContext, useContext } from 'react';

import type { CRMFormState } from '../types';

export const CRMLogFormContext = createContext<CRMFormState<any> | undefined>(
    undefined
);

export function useLogFormContext<D = any>(): CRMFormState<D> {
    const context = useContext(CRMLogFormContext);

    if (context === undefined) {
        throw new Error(
            'useLogFormContext must be within LogFormContextProvider'
        );
    }

    return context;
}
