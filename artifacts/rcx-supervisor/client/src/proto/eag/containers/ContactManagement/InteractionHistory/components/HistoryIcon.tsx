import { Icon, Tooltip, type IconProps } from '@ringcentral/spring-ui';
import clsx from 'clsx';

import {
    CONTACT_MANAGEMENT_HISTORY_ICON,
    CONTACT_MANAGEMENT_HISTORY_ICON_LINE,
} from '../../../../constants/testIds';

type HistoryIconProps = Pick<IconProps, 'symbol'> & {
    tooltipTitle?: string;
    showVerticalLine?: boolean;
    className?: string;
};

export const HistoryIcon = ({
    tooltipTitle,
    showVerticalLine,
    symbol,
    className = '',
}: HistoryIconProps) => {
    const iconBlock = (
        <Icon symbol={symbol} size='small' className='text-neutral-b2' />
    );

    return (
        <div
            className={clsx(
                'flex w-4 flex-none flex-col items-center justify-start',
                className
            )}
            data-aid={CONTACT_MANAGEMENT_HISTORY_ICON}
        >
            {tooltipTitle ? (
                <Tooltip title={tooltipTitle}>{iconBlock}</Tooltip>
            ) : (
                iconBlock
            )}
            {showVerticalLine && (
                <div
                    className='bg-neutral-b3 min-h-1.25 mt-1 w-[1.35px] flex-1'
                    data-aid={CONTACT_MANAGEMENT_HISTORY_ICON_LINE}
                />
            )}
        </div>
    );
};
