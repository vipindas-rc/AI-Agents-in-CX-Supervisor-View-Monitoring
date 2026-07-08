import type { ReactNode, ErrorInfo } from 'react';
import { Component } from 'react';

import type { Props, State } from './types';
import { TechnicalIssuePage } from '../TechnicalIssuePage';

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        if (this.props.logError) {
            this.props.logError(error, errorInfo);
        } else {
            window.console.log(error, errorInfo);
        }
    }

    public render(): ReactNode {
        if (this.state.hasError) {
            return <TechnicalIssuePage />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
