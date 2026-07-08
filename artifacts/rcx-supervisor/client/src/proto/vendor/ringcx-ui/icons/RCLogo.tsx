import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const RCLogo: FC<SvgIconProps> = ({
    height = 20,
    width = 20,
    ...props
}) => {
    const defId = 'eui-RCLogo-' + Date.now() + Math.random();

    return (
        <svg width={width} height={height} {...props} viewBox='0 0 20 20'>
            <defs>
                <linearGradient
                    x1='29.3628881%'
                    y1='7.46907981%'
                    x2='81.8854201%'
                    y2='90.0336333%'
                    id={`${defId}-b`}
                >
                    <stop stopColor='#FFA135' offset='0%' />
                    <stop stopColor='#F80' offset='75.533413%' />
                    <stop stopColor='#F80' offset='100%' />
                </linearGradient>
                <rect id={`${defId}-a`} width='20' height='20' rx='5' />
                <radialGradient
                    cx='23.779811%'
                    cy='11.4525082%'
                    fx='23.779811%'
                    fy='11.4525082%'
                    r='119.522272%'
                    gradientTransform='matrix(.6377 .74085 -.77028 .61334 .17436876 -.13188913)'
                    id={`${defId}-с`}
                >
                    <stop stopOpacity='.32' offset='0%' />
                    <stop stopOpacity='.2' offset='23.1510348%' />
                    <stop stopOpacity='.08' offset='64.3401548%' />
                    <stop stopOpacity='0' offset='100%' />
                </radialGradient>
            </defs>
            <g fill='none' fillRule='evenodd'>
                <mask id={`${defId}-d`} fill='#fff'>
                    <use xlinkHref={`#${defId}-a`} />
                </mask>
                <use fill={`url(#${defId}-b)`} xlinkHref={`#${defId}-a`} />
                <path
                    d='M15.4572011 4.76902174L23 14.1450939V23l-10.1605445 1.3460746-8.66842968-8.8549061.03610851-.0157913c.58276185-.2548019 8.04672107-3.5161926 9.76774757-4.162164 2.2597439-.848174 1.4823192-6.54419146 1.4823192-6.54419146z'
                    fill={`url(#${defId}-c)`}
                    mask={`url(#${defId}-d)`}
                />
                <path
                    d='M7.1884058 3.47826087h5.3333333c2.209139 0 4 1.790861 4 4v8.83333333c0 .2761424-.2238576.5-.5.5H7.1884058c-2.209139 0-4-1.790861-4-4V7.47826087c0-2.209139 1.790861-4 4-4z'
                    fill='#FFF'
                    mask={`url(#${defId}-d)`}
                />
                <path
                    d='M7.85507246 5.99677939h3.91701784c1.1045695 0 2 .8954305 2 2v2.17848741c0 .9166755-.5391486 1.4907723-1.1703209 1.676392.4929181.7722428 1.0094512 1.5860485 1.5495994 2.4414169h-2.3913509l-1.3432655-2.3503033c-.2010496 0-.3640326-.1629829-.3640326-.3640325v-1.5503113h1.5532909V8.14648001H8.02782099v3.79629239c0 .7787369.62234609 1.9509959 1.0578311 2.3503033H6.72559656c-.50339802-.4769555-.8705241-1.7593292-.8705241-2.3503033V7.99677939c0-1.1045695.8954305-2 2-2z'
                    fill='#0684BD'
                    mask={`url(#${defId}-d)`}
                />
            </g>
        </svg>
    );
};
