import type { MouseEvent } from 'react';

export interface IInfoBarActionButtonProps {
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}
