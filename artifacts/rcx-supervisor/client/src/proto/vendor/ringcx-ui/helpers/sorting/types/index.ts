export enum SortDirection {
    NONE,
    ASC,
    DESC,
}

export enum SortType {
    STRING = 1,
    NUMBER = 2,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValueNormalizer = (value: unknown) => any;
