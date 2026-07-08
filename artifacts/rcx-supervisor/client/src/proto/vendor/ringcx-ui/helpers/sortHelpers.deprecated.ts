//TODO: Deprecated and needs to be removed,
// also creates import collisions with helpers/sorting
/**
 * @deprecated
 */
export enum Order {
    ASC = 'asc',
    DESC = 'desc',
    NONE = 'none',
}

/**
 * @deprecated
 */
export function stableSort<T>(array: T[], cmp: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);

    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    return stabilizedThis.map((el) => el[0]);
}

/**
 * @deprecated
 */
export function desc<T>(
    a: T,
    b: T,
    orderBy: keyof T,
    valueNormalizer?: ValueNormalizer<T>
) {
    const valueA = valueNormalizer ? valueNormalizer(a[orderBy]) : a[orderBy];
    const valueB = valueNormalizer ? valueNormalizer(b[orderBy]) : b[orderBy];

    if (valueB < valueA) return -1;
    if (valueB > valueA) return 1;
    return 0;
}

/**
 * @deprecated
 */
export function getSorter<T>(
    order: Order,
    orderBy: keyof T,
    valueNormalizer?: ValueNormalizer<T>
): (a: T, b: T) => number {
    return order === 'desc'
        ? (a, b) => desc<T>(a, b, orderBy, valueNormalizer)
        : (a, b) => -desc<T>(a, b, orderBy, valueNormalizer);
}

/**
 * @deprecated
 */
export type ValueNormalizer<T> = (value: T[keyof T]) => T[keyof T];
