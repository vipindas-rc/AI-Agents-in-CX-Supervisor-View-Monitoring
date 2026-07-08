import type { FC } from 'react';

import type { IArrow } from './types/Arrow';
import { ArrowDirection } from './types/Arrow';

export const Arrow: FC<IArrow> = ({
    height = 16,
    width = 16,
    direction = ArrowDirection.DOWN,
    className,
}) => {
    let transform;
    switch (direction) {
        case ArrowDirection.RIGHT:
            transform = `rotate(-90deg)`;
            break;
        case ArrowDirection.UP:
            transform = `scaleY(-1)`;
            break;
        case ArrowDirection.DOWN:
        default:
            transform = `scaleY(1)`;
            break;
    }

    return (
        <svg
            width={`${width}px`}
            height={`${height}px`}
            viewBox={`0 0 ${width} ${height}`}
            style={{ transform }}
            className={className}
            data-aid='arrow'
        >
            <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                <rect x='0' y='0' width={width} height={height} />
                <path
                    d='M7.2407434,11.1142006 L3.41496403,6.65079137 C3.05554188,6.23146553 3.10410342,5.60016555 3.52342926,5.2407434 C3.70467237,5.08539216 3.93550936,5 4.17422064,5 L11.8257794,5 C12.3780641,5 12.8257794,5.44771525 12.8257794,6 C12.8257794,6.23871127 12.7403872,6.46954826 12.585036,6.65079137 L8.7592566,11.1142006 C8.39983445,11.5335265 7.76853447,11.582088 7.34920863,11.2226659 C7.31032982,11.1893412 7.27406809,11.1530794 7.2407434,11.1142006 Z'
                    fill='currentColor'
                />
            </g>
        </svg>
    );
};
