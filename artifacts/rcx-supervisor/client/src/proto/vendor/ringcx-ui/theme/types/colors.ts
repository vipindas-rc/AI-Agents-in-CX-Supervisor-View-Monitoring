import type colors from '../colors';

export type ColorType = typeof colors;

export interface IColors extends ColorType {
    custom?: DeepPartial<unknown>;
}
