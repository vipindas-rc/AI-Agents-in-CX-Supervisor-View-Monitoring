import type { FC, SVGProps } from 'react';

export interface IChevronDownIcon extends SVGProps<SVGSVGElement> {
    className?: string;
}

export const ChevronDown: FC<IChevronDownIcon> = ({
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
            d='M6.20679 8.86194C6.45328 9.09369 6.85655 9.08205 7.08741 8.83654L10.5812 5.19034C10.8025 4.95504 10.779 4.59572 10.5289 4.38761C10.2787 4.1795 9.89649 4.20163 9.67517 4.43682L6.64703 7.55246L3.37155 4.39853C3.13541 4.17644 2.7525 4.17644 2.51626 4.39853C2.28001 4.62061 2.28012 4.98068 2.51626 5.20277L6.20677 8.86191L6.20679 8.86194Z'
            fill='currentColor'
        />
    </svg>
);

export default ChevronDown;
