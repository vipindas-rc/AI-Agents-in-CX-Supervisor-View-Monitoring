export enum TagColor {
    Blue = 'BLUE',
    Green = 'GREEN',
    Turquoise = 'TURQUOISE',
    Purple = 'PURPLE',
    Orange = 'ORANGE',
    Red = 'RED',
    Grey = 'GREY',
}

export interface ITagProps {
    text: string;
    color: TagColor;
    bordered?: boolean;
    disabled?: boolean;
    eclipsable?: boolean;
    onClick?: () => void;
    onClose?: () => void;
    shouldShowAlertIcon?: boolean;
    stopPropagation?: boolean;
    tabIndex?: number;
}
