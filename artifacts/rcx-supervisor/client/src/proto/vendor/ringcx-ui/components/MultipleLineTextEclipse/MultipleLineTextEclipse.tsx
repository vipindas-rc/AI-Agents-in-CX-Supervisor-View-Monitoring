import type { FC, PropsWithChildren, MouseEventHandler } from 'react';
import { useMemo, useState, useCallback } from 'react';

import Tooltip from '../Tooltip';
import MultipleLineTextOverflow from './MultipleLineTextOverflow';
import type { IMultipleLineTextEclipse } from './types/MultipleLineTextEclipse';

const MultipleLineTextEclipse: FC<
    PropsWithChildren<IMultipleLineTextEclipse>
> = ({
    children,
    className,
    tooltipMsg,
    popperProps,
    placement,
    lines = 2,
    ...props
}) => {
    const [isShowTooltip, setShowTooltip] = useState<boolean>(false);

    const onMouseEnter: MouseEventHandler<HTMLSpanElement> = useCallback(
        ({ target }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setShowTooltip(target.clientHeight < target.scrollHeight);
        },
        []
    );

    const renderText = useMemo(
        () => (
            <MultipleLineTextOverflow
                lines={lines}
                onMouseEnter={onMouseEnter}
                className={className}
                {...props}
            >
                {children}
            </MultipleLineTextOverflow>
        ),
        [children, className, onMouseEnter, lines, props]
    );

    return isShowTooltip ? (
        <Tooltip
            title={tooltipMsg}
            placement={placement}
            PopperProps={popperProps}
        >
            {renderText}
        </Tooltip>
    ) : (
        renderText
    );
};

export default MultipleLineTextEclipse;
