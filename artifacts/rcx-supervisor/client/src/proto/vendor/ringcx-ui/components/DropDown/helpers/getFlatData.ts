import type {
    IFlatMenuItem,
    IDropDownData,
    IMenuGroup,
    IMenuItem,
} from '../types';

const defaultSort = (a: IMenuGroup | IMenuItem, b: IMenuGroup | IMenuItem) =>
    new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
    }).compare(a.displayName, b.displayName);

export const getFlatData = (
    { groups = [], items = [] }: IDropDownData,
    useDefaultSort: boolean
): IFlatMenuItem[] => {
    if (groups.length === 0) {
        const sortedItems = useDefaultSort ? items.sort(defaultSort) : items;
        return sortedItems.map((item) => ({
            id: item.id,
            itemType: 'item',
            displayName: item.displayName,
            variant: item.variant,
            ...(item.icon && { icon: item.icon }),
        }));
    } else {
        return (useDefaultSort ? [...groups].sort(defaultSort) : groups).reduce<
            IFlatMenuItem[]
        >((memo, group) => {
            const groupId = group.id;

            const groupItems: IFlatMenuItem[] = (
                useDefaultSort
                    ? [
                          ...items.filter(
                              (item: IMenuItem) => item.groupId === groupId
                          ),
                      ].sort(defaultSort)
                    : items.filter(
                          (item: IMenuItem) => item.groupId === groupId
                      )
            ).map((item) => ({
                id: item.id,
                itemType: 'item',
                displayName: item.displayName,
                variant: item.variant,
                ...(item.icon && { icon: item.icon }),
            }));

            if (groupItems.length > 0) {
                if (!group.hidden) {
                    memo.push({
                        id: group.id,
                        itemType: 'group',
                        displayName: group.displayName,
                    });
                }

                memo.push(...groupItems);
            }

            return memo;
        }, []);
    }
};
