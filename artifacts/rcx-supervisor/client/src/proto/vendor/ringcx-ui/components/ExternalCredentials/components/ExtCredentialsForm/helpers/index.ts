import type { TFunction } from 'i18next';

import type { IMenuItem } from '../../../../DropDown';

export function translateOptions(
    options: IMenuItem[],
    t: TFunction
): IMenuItem[] {
    return options.map((item) => ({
        ...item,
        displayName: t(`EXTERNAL_CREDENTIALS.${item.displayName}`),
    }));
}
