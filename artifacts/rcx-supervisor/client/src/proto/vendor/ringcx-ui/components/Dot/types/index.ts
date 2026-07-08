export enum DotColor {
    Default = '#A1A1A1',
    Blue = '#4481EB',
    Green = '#25A73C',
    Turquoise = '#22C2D6',
    Purple = '#9C74FF',
    Yellow = '#F7B502',
    Orange = '#F6852E',
    Red = '#F0512A',
    Asphalt = '#212121',
    Grey = '#ABABAB',
}

export interface IDotProps {
    color: DotColor;
}

export type DotColorKeys = keyof typeof DotColor;

export const SWDotColorGray = 'Gray';

// RCX Backend for Service Web had changed naming for Grey -> Gray color specifically
export type SWDotColorKeys =
    | Exclude<DotColorKeys, DotColor.Grey>
    | typeof SWDotColorGray;

export type DotColorValues = (typeof DotColor)[DotColorKeys];
