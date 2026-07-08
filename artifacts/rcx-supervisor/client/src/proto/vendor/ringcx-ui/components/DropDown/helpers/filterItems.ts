import type { IFlatMenuItem } from '../types';

export const filterItems = (
    listItems: IFlatMenuItem[],
    filterValue: string,
    selectedItemsIds: IFlatMenuItem['id'][] = []
): IFlatMenuItem[] => {
    let result = [...listItems];
    const calc = result.reduce<{
        groups: {
            id: IFlatMenuItem['id'];
            count: number;
        }[];
        items: IFlatMenuItem[];
    }>(
        (memo, item: IFlatMenuItem) => {
            if (item.itemType === 'group') {
                memo.groups.push({ id: item.id, count: 0 });
                memo.items.push(item);
            } else {
                if (
                    item.displayName
                        .toUpperCase()
                        .includes(filterValue.toUpperCase()) &&
                    !selectedItemsIds.includes(item.id)
                ) {
                    memo.items.push(item);

                    const lastGroupIndex = memo.groups.length - 1;
                    const lastGroup = memo.groups[lastGroupIndex];

                    if (lastGroup) {
                        lastGroup.count++;
                    }
                }
            }

            return memo;
        },
        { groups: [], items: [] }
    );

    result = calc.items.filter((item: IFlatMenuItem) => {
        const group = calc.groups.find((g) => g.id === item.id);

        return (
            item.itemType === 'item' ||
            (item.itemType === 'group' && group && group.count > 0)
        );
    });

    return result;
};
