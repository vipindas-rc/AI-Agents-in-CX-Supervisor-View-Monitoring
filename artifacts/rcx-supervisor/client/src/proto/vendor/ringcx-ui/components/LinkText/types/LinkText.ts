import type { PropsWithChildren, HTMLAttributes } from 'react';

export type LinkTextProps = PropsWithChildren<{ to: string }> &
    HTMLAttributes<HTMLAnchorElement>;
