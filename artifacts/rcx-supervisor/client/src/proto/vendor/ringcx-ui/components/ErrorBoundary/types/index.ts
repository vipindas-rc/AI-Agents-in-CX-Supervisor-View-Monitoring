import type { ErrorInfo, ReactNode } from 'react';

export type Props = {
    children: ReactNode;
    logError?(error: Error, errorInfo: ErrorInfo): void;
};

export type State = {
    hasError: boolean;
};
