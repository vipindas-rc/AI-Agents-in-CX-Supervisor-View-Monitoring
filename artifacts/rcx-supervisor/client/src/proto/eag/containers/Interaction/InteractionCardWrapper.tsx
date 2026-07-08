import type { PropsWithChildren } from 'react';

import clsx from 'clsx';
import { noop } from 'lodash';

import { ACTIVE_LEFT_BORDER } from '../../constants/testIds';

type InteractionCardWrapperProps = {
    active?: boolean;
    onClick?: () => void;
    className?: string;
    [key: `data-${string}`]: string | number | boolean | undefined;
};

export const InteractionCardWrapper = ({
    active = false,
    children,
    onClick = noop,
    className,
    ...dataProps
}: PropsWithChildren<InteractionCardWrapperProps>) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' || event.target !== event.currentTarget) {
            return;
        }

        onClick();
    };

    return (
        <div
            onClick={onClick}
            onKeyDown={handleKeyDown}
            // prevent card being focused when clicked
            onMouseDown={(e) => e.preventDefault()}
            className={clsx(
                'border-1 border-neutral-b0-t20 bg-neutral-base focus-visible:focus-ring-normal relative z-0 !flex flex-col rounded-[6px] border-solid',
                active && 'border-primary-f',
                !active && 'dark:border-neutral-b0',
                className
            )}
            tabIndex={0}
            {...dataProps}
        >
            {active && (
                <div
                    className='bg-primary-f absolute left-0 top-0 h-full w-1 rounded-l-[6px]'
                    data-aid={ACTIVE_LEFT_BORDER}
                />
            )}
            <div className='p-3'>{children}</div>
        </div>
    );
};
