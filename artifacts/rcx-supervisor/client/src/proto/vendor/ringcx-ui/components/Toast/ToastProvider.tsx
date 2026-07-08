import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';

import ToastContainer from './ToastContainer';
import ToastContext from './ToastContext';
import type { IToastProps } from './types';

const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
    const [toasts, setToasts] = useState<IToastProps[]>([]);

    return (
        <ToastContext.Provider value={[toasts, setToasts]}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

export { ToastProvider };
