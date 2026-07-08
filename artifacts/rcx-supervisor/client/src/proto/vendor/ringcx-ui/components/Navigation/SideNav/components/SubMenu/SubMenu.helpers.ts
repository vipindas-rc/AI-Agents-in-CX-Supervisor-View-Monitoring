import type {
    INavChild,
    INavGroup,
    INavSubGroup,
    INavSubMenu,
} from '../../types/NavOptions';

export const isSubMenu = (child: INavChild): child is INavSubMenu => {
    const { children, route } = child as INavSubMenu;
    return children !== undefined && route !== undefined;
};

export const isMenuItem = (child: INavChild): child is INavSubMenu => {
    const { children, route } = child as INavSubMenu;
    return children === undefined && route !== undefined;
};

export const isSubGroup = (child: INavChild): child is INavSubGroup => {
    const { children, route } = child as INavSubMenu;
    return children !== undefined && route === undefined;
};

export const renameFn = (
    items: Array<INavGroup | INavChild>,
    key: string,
    route: string[],
    currentDeep = 0
): Array<INavGroup | INavChild> => {
    return items.reduce(
        (acc: Array<INavGroup | INavChild>, item: INavGroup | INavChild) => {
            if (item.label === route[currentDeep]) {
                currentDeep += 1;

                if (currentDeep === route.length) {
                    return [...acc, { ...item, label: key }];
                }
                if (item.children) {
                    return [
                        ...acc,
                        {
                            ...item,
                            children: renameFn(
                                item.children,
                                key,
                                route,
                                currentDeep
                            ),
                        },
                    ];
                }

                return [...acc, item];
            } else {
                if (item.children) {
                    return [
                        ...acc,
                        {
                            ...item,
                            children: renameFn(item.children, key, route),
                        },
                    ];
                }

                return [...acc, item];
            }
        },
        []
    );
};
