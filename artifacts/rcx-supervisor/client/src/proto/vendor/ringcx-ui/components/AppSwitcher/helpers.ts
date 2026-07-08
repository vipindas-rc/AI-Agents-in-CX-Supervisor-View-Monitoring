import type { ListItemType } from './components/ListItem';
import type { ListItemsWithPermissionType } from './types';

export const getPermittedItems = (
    items: ListItemsWithPermissionType[]
): ListItemType[] =>
    items.reduce(
        (
            acc: ListItemType[],
            {
                name,
                path,
                icon,
                hasPermission,
                openInNewTab,
                onClick,
                isLoading,
            }
        ) => {
            if (hasPermission) {
                acc.push({
                    name,
                    path,
                    icon,
                    openInNewTab,
                    onClick,
                    isLoading,
                });
            }
            return acc;
        },
        []
    );
