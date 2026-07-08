import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const Chat: FC<SvgIconProps> = ({
    height = 25,
    width = 25,
    ...props
}) => (
    <svg
        viewBox={`0 -3 ${height} ${width}`}
        {...props}
        style={{ height: '1em' }}
    >
        <title>{'Chat'}</title>
        <g fill='none' fillRule='evenodd'>
            <g
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.4}
            >
                <path d='M4.012 7.58h8.055M4.012 9.987H8.04M7.55 15.539l7.884-.041a.836.836 0 0 0 .836-.839V5.781a.923.923 0 0 0-.919-.924H2.333a.916.916 0 0 0-.913.918v8.806c0 .506.408.917.91.917h2.224l.028 2.397c.002.27.318.41.52.234l2.449-2.59z' />
                <path d='M11.929 2.33v-.517c0-.448.348-.813.777-.813h11.02c.427 0 .774.362.774.808v7.744c0 .445-.346.805-.772.805h-1.88l-.024 2.108c-.003.237-.271.36-.44.205l-2.074-2.277' />
            </g>
            <path d='M-8-11h40v40H-8z' />
        </g>
    </svg>
);
