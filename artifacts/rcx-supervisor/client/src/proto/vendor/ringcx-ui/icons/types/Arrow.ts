export enum ArrowDirection {
    DOWN = 'down',
    UP = 'up',
    RIGHT = 'right',
}

export interface IArrow {
    width?: number;
    height?: number;
    direction?: ArrowDirection;
    className?: string;
}
