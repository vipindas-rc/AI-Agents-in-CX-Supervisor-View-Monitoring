import { createContext } from 'react';

import type { toastContextValue } from './types';

const ToastContext = createContext<toastContextValue>([[], () => []]);

export default ToastContext;
