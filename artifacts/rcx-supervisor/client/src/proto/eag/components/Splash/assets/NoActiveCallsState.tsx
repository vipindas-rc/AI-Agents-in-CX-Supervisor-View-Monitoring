import type { FC } from 'react';

import { NO_ACTIVE_CALLS_SVG } from '../../../constants/testIds';

export const NoActiveCallsState: FC = (props) => {
    return (
        <svg width='186' height='186' data-aid={NO_ACTIVE_CALLS_SVG} {...props}>
            <defs>
                <linearGradient
                    x1='11.957%'
                    y1='15.67%'
                    x2='108.948%'
                    y2='148.532%'
                    id='NoActiveCallsState_c'
                >
                    <stop stopColor='#2E86B9' offset='0%' />
                    <stop stopColor='#066FAC' offset='100%' />
                </linearGradient>
                <filter
                    x='-35.8%'
                    y='-30.6%'
                    width='171.6%'
                    height='166.2%'
                    filterUnits='objectBoundingBox'
                    id='NoActiveCallsState_a'
                >
                    <feOffset
                        dy='2'
                        in='SourceAlpha'
                        result='shadowOffsetOuter1'
                    />
                    <feGaussianBlur
                        stdDeviation='8.5'
                        in='shadowOffsetOuter1'
                        result='shadowBlurOuter1'
                    />
                    <feColorMatrix
                        values='0 0 0 0 0.0235294118 0 0 0 0 0.435294118 0 0 0 0 0.674509804 0 0 0 0.3 0'
                        in='shadowBlurOuter1'
                    />
                </filter>
                <path
                    d='M15 0h57a9 9 0 0 1 9 9v63a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8Z'
                    id='NoActiveCallsState_b'
                />
            </defs>
            <g fill='none' fillRule='evenodd'>
                <path
                    d='M93 186c-51.363 0-93-41.638-93-93C0 41.637 41.637 0 93 0s93 41.637 93 93c0 51.362-41.637 93-93 93Z'
                    fill='#EDF7FF'
                />
                <g transform='translate(47 54)'>
                    <use
                        fill='#000'
                        filter='url(#NoActiveCallsState_a)'
                        href='#NoActiveCallsState_b'
                    />
                    <use fill='#FFF' href='#NoActiveCallsState_b' />
                    <rect
                        fill='#E7E7E7'
                        x='22'
                        y='19'
                        width='45'
                        height='5'
                        rx='2'
                    />
                    <rect
                        fill='#E7E7E7'
                        x='22'
                        y='45'
                        width='45'
                        height='5'
                        rx='2'
                    />
                    <rect
                        fill='#E7E7E7'
                        x='22'
                        y='30'
                        width='21.724'
                        height='5'
                        rx='2'
                    />
                    <rect
                        fill='#E7E7E7'
                        x='22'
                        y='56'
                        width='21.724'
                        height='5'
                        rx='2'
                    />
                    <path
                        d='M3 37h8a3 3 0 0 1 0 6H3a3 3 0 0 1 0-6ZM3 19h8a3 3 0 0 1 0 6H3a3 3 0 0 1 0-6ZM3 55h8a3 3 0 0 1 0 6H3a3 3 0 0 1 0-6Z'
                        fill='#D1D1D1'
                    />
                </g>
                <path
                    d='M96.518 42.004 80.376 43.03c-1.26.08-2.355 1.236-2.366 2.498-.2 17.225 2.456 32.702 17.983 48.233 15.608 15.612 30.344 17.424 47.48 17.225 1.253-.023 2.393-1.115 2.471-2.366l1.052-16.122c.078-1.25-.917-2.475-2.156-2.656l-16.09-2.367a2.565 2.565 0 0 0-2.156.71c-3.66 3.66-6.31 6.313-7.308 7.311-1.8-.786-7.658-3.531-14.539-10.414-6.934-6.936-10.24-13.51-11.173-15.437l7.256-7.259c.547-.55.817-1.362.71-2.13L99.174 44.16c-.18-1.24-1.405-2.235-2.656-2.157Z'
                    fill='url(#NoActiveCallsState_c)'
                />
            </g>
        </svg>
    );
};
