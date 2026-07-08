import type { FC } from 'react';

import { EMPTY_STATE_SVG } from '../../../constants/testIds';

export const EmptyState: FC = (props) => {
    return (
        <svg
            id='empty-state-svg'
            data-aid={EMPTY_STATE_SVG}
            width={186}
            height={186}
            viewBox='0 0 186 186'
            {...props}
        >
            <defs>
                <filter
                    x='-13.7%'
                    y='-10.3%'
                    width='127.4%'
                    height='124.3%'
                    filterUnits='objectBoundingBox'
                    id='prefix__c'
                >
                    <feOffset
                        dy={2}
                        in='SourceAlpha'
                        result='shadowOffsetOuter1'
                    />
                    <feGaussianBlur
                        stdDeviation={4}
                        in='shadowOffsetOuter1'
                        result='shadowBlurOuter1'
                    />
                    <feColorMatrix
                        values='0 0 0 0 0.00784313725 0 0 0 0 0.568627451 0 0 0 0 1 0 0 0 0.15 0'
                        in='shadowBlurOuter1'
                    />
                </filter>
                <filter
                    x='-15.4%'
                    y='-11.2%'
                    width='130.8%'
                    height='125.6%'
                    filterUnits='objectBoundingBox'
                    id='prefix__f'
                >
                    <feOffset
                        dy={2}
                        in='SourceAlpha'
                        result='shadowOffsetOuter1'
                    />
                    <feGaussianBlur
                        stdDeviation={5}
                        in='shadowOffsetOuter1'
                        result='shadowBlurOuter1'
                    />
                    <feColorMatrix
                        values='0 0 0 0 0.00784313725 0 0 0 0 0.568627451 0 0 0 0 1 0 0 0 0.19 0'
                        in='shadowBlurOuter1'
                    />
                </filter>
                <filter
                    x='-57.8%'
                    y='-50%'
                    width='215.5%'
                    height='200%'
                    filterUnits='objectBoundingBox'
                    id='prefix__i'
                >
                    <feOffset
                        dy={2}
                        in='SourceAlpha'
                        result='shadowOffsetOuter1'
                    />
                    <feGaussianBlur
                        stdDeviation={7.5}
                        in='shadowOffsetOuter1'
                        result='shadowBlurOuter1'
                    />
                    <feColorMatrix
                        values='0 0 0 0 0.00784313725 0 0 0 0 0.568627451 0 0 0 0 1 0 0 0 0.15 0'
                        in='shadowBlurOuter1'
                        result='shadowMatrixOuter1'
                    />
                    <feMerge>
                        <feMergeNode in='shadowMatrixOuter1' />
                        <feMergeNode in='SourceGraphic' />
                    </feMerge>
                </filter>
                <path id='prefix__a' d='M0 0h186v186H0z' />
                <path
                    id='prefix__d'
                    d='M117.306 61.721L130 137.938 51.214 151 35 53.656 93.246 44z'
                />
                <path
                    id='prefix__g'
                    d='M159 71.31L137.822 152 55 130.055 82.049 27l61.227 16.223z'
                />
                <linearGradient
                    x1='-15.654%'
                    y1='66.14%'
                    x2='78.022%'
                    y2='66.14%'
                    id='prefix__e'
                >
                    <stop stopColor='#F6F2F2' offset='0%' />
                    <stop stopColor='#D9D4D4' offset='100%' />
                </linearGradient>
                <linearGradient
                    x1='73.66%'
                    y1='113.478%'
                    x2='45.138%'
                    y2='33.144%'
                    id='prefix__h'
                >
                    <stop stopColor='#F7F7F8' offset='0%' />
                    <stop stopColor='#FFF' offset='100%' />
                </linearGradient>
            </defs>
            <g fill='none' fillRule='evenodd'>
                <g>
                    <mask id='prefix__b' fill='#fff'>
                        <use xlinkHref='#prefix__a' />
                    </mask>
                    <path
                        d='M186 93c0 51.362-41.637 93-93 93S0 144.362 0 93C0 41.637 41.637 0 93 0s93 41.637 93 93'
                        fillOpacity={0.05}
                        fill='#0091FF'
                        mask='url(#prefix__b)'
                    />
                </g>
                <g>
                    <use
                        fill='#000'
                        filter='url(#prefix__c)'
                        xlinkHref='#prefix__d'
                    />
                    <use fill='url(#prefix__e)' xlinkHref='#prefix__d' />
                </g>
                <g>
                    <use
                        fill='#000'
                        filter='url(#prefix__f)'
                        xlinkHref='#prefix__g'
                    />
                    <use fill='url(#prefix__h)' xlinkHref='#prefix__g' />
                </g>
                <path
                    fill='#E7E7E7'
                    d='M144.884 44L139 66.432 160 72zM134.269 85L87 72.554 88.731 66 136 78.446zM129.269 102L82 89.555 83.731 83 131 95.447zM113.277 116l-23.112-6.157L78 106.601 79.721 100 115 109.4z'
                />
                <g filter='url(#prefix__i)' transform='translate(107 92)'>
                    <path
                        d='M8.37 57.723l.376.096c1.325 1.165 1.6 2.862 1.141 3.863l46.666-54.52a3.25 3.25 0 00-.317-4.541l-1.223-1.076a3.147 3.147 0 00-4.481.32L4.323 55.91c-1.149 1.344 2.722.648 4.047 1.813'
                        fill='#0291FF'
                    />
                    <path
                        fill='#BABABA'
                        d='M54.564 11.145l-7.467-7.3-2.058 2.163 7.467 7.3z'
                    />
                    <path
                        fill='#BABABA'
                        d='M53.797 12.326L32.27 37.15l-2.227-1.982L51.57 10.342zM11.51 59.846L5.512 54.49l-1.575 1.824 5.916 5.44z'
                    />
                    <path
                        fill='#D7D7D7'
                        d='M3.935 56.316L.45 65.577l.627.573 8.774-4.396z'
                    />
                    <path
                        fill='#0291FF'
                        d='M1.17 63.606l-.717 1.976.624.536 1.851-.922z'
                    />
                </g>
            </g>
        </svg>
    );
};
