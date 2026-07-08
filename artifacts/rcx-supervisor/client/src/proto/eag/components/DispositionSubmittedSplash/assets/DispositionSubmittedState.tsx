import type { FC } from 'react';

// to create a React component from SVG can use https://react-svgr.com/playground/
export const DispositionSubmittedState: FC = (props) => {
    return (
        <svg
            width={187}
            height={186}
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
            {...props}
        >
            <title>{'Group 2'}</title>
            <defs>
                <filter
                    x='-20.1%'
                    y='-14.3%'
                    width='140.2%'
                    height='132.7%'
                    filterUnits='objectBoundingBox'
                    id='a'
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
                    x='-18.6%'
                    y='-13.2%'
                    width='137.2%'
                    height='130.2%'
                    filterUnits='objectBoundingBox'
                    id='d'
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
                <path id='b' d='M0 0h57.32l22.19 22.189V98H0z' />
                <path id='e' d='M0 0h62l24 24v82H0z' />
                <linearGradient
                    x1='8.984%'
                    y1='-1.763%'
                    x2='68.445%'
                    y2='66.14%'
                    id='c'
                >
                    <stop stopColor='#F6F2F2' offset='0%' />
                    <stop stopColor='#D9D4D4' offset='100%' />
                </linearGradient>
            </defs>
            <g fill='none' fillRule='evenodd'>
                <path
                    d='M93.5 186c-51.363 0-93-41.638-93-93 0-51.363 41.637-93 93-93s93 41.637 93 93c0 51.362-41.637 93-93 93Z'
                    fill='#F2F9FF'
                />
                <g transform='rotate(-9 360.955 -170.712)'>
                    <use fill='#000' filter='url(#a)' xlinkHref='#b' />
                    <use fill='url(#c)' xlinkHref='#b' />
                </g>
                <g transform='rotate(15 -66.272 308.868)'>
                    <use fill='#000' filter='url(#d)' xlinkHref='#e' />
                    <use fill='#FFF' xlinkHref='#e' />
                </g>
                <path
                    d='M99.03 114.148a1 1 0 0 1 .707 1.225l-1.036 3.864a1 1 0 0 1-1.224.707l-23.182-6.212a1 1 0 0 1-.708-1.224l1.036-3.864a1 1 0 0 1 1.224-.707l23.183 6.211Zm27.84-11.175a1 1 0 0 1 .708 1.225l-1.036 3.864a1 1 0 0 1-1.224.707L78.953 96.346a1 1 0 0 1-.707-1.225l1.035-3.864a1 1 0 0 1 1.225-.707l46.365 12.423Zm4.66-17.386a1 1 0 0 1 .706 1.224l-1.035 3.864a1 1 0 0 1-1.225.707L83.612 78.96a1 1 0 0 1-.707-1.225l1.035-3.863a1 1 0 0 1 1.225-.708l46.364 12.424Zm6.04-41.863 16.97 29.394-23.129-6.198 6.16-23.196Z'
                    fill='#E7E7E7'
                    fillRule='nonzero'
                />
                <g transform='translate(105 123)'>
                    <circle
                        stroke='#25A73C'
                        strokeWidth={3}
                        fill='#25A73C'
                        cx={20}
                        cy={20}
                        r={18.5}
                    />
                    <path d='M4.01 4.073h32v32h-32z' />
                    <path
                        fill='#FFF'
                        d='M12.167 19.885 10.01 21.97l6.58 6.802 13.998-14.625-2.167-2.075-11.842 12.373z'
                    />
                </g>
            </g>
        </svg>
    );
};
