import type { FC, PropsWithChildren, MouseEventHandler } from 'react';
import { useMemo, useState, useCallback } from 'react';

import TextOverflow from '../TextOverflow';
import Tooltip from '../Tooltip';
import type { ITextEclipse } from './types/TextEclipse';

const TextEclipse: FC<PropsWithChildren<ITextEclipse>> = ({
    children,
    className,
    tooltipMsg,
    popperProps,
    placement,
    maxHeight,
    role,
    ...props
}) => {
    const [isShowTooltip, setShowTooltip] = useState<boolean>(false);

    const onMouseEnter: MouseEventHandler<HTMLSpanElement> = useCallback(
        ({ target }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setShowTooltip(target.offsetWidth < target.scrollWidth);
        },
        []
    );

    const renderText = useMemo(
        () => (
            <TextOverflow
                {...{ ...props, className, onMouseEnter, maxHeight, role }}
            >
                {children}
            </TextOverflow>
        ),
        [children, className, onMouseEnter, maxHeight, props]
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

export default TextEclipse;
