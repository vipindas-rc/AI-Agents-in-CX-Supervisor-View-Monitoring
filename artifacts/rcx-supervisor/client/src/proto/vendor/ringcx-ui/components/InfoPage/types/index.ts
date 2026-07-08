import type { ReactNode } from 'react';

export type InfoPageProps = {
    className?: string;
    icon: ReactNode;
    title: string;
    subtitle: ReactNode;
    buttonText?: string;
    onClick?: () => void;
};
