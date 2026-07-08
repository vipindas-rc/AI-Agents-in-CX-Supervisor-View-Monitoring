import type { FC, SVGProps } from 'react';

export interface IChevronRightIcon extends SVGProps<SVGSVGElement> {
    className?: string;
}

export const ChevronRight: FC<IChevronRightIcon> = ({
    className = '',
    style,
    ...restProps
}) => (
    <svg
        width='13'
        height='13'
        viewBox='0 0 13 13'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
        style={style}
        {...restProps}
    >
        <path
            d='M8.52799 6.21694C8.75164 6.45482 8.7404 6.84401 8.50345 7.06679L4.9847 10.4385C4.75764 10.652 4.41086 10.6294 4.21004 10.388C4.00922 10.1466 4.03056 9.77773 4.25752 9.56415L7.26425 6.64183L4.22055 3.48082C4.00624 3.25294 4.00624 2.88342 4.22055 2.65543C4.43486 2.42744 4.78236 2.42755 4.99667 2.65543L8.52796 6.21697L8.52799 6.21694Z'
            fill='currentColor'
        />
    </svg>
);

export default ChevronRight;
