import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const AppSwitcherMenu: FC<IAppIcon> = () => (
    <svg
        width='20px'
        height='20px'
        version='1.1'
        viewBox='0 0 20 20'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            fill='currentColor'
            fillRule='evenodd'
            d='m0 0v4h4v-4h-4zm8 0v4h4v-4h-4zm8 0v4h4v-4h-4zm-16 8v4h4v-4h-4zm8 0v4h4v-4h-4zm8 0v4h4v-4h-4zm-16 8v4h4v-4h-4zm8 0v4h4v-4h-4zm8 0v4h4v-4h-4z'
        />
    </svg>
);
