export type Widget = {
    name: string;
    title: string;
    visible?: boolean;
    render?: (...args: any[]) => React.ReactNode;
    children?: Widget[];
};

export const levelUpOrphanWidget = (widget: Widget): Widget => {
    if (widget.children?.length === 1) {
        return levelUpOrphanWidget(widget.children[0]);
    }
    return widget;
};

export const filterVisibleWidgets = (widgets: Widget[]): Widget[] =>
    widgets.filter((widget) => {
        const { visible = true, children } = widget;
        if (children) {
            widget.children = filterVisibleWidgets(children);
        }
        return visible && widget.children?.length !== 0;
    });

export const extractMainWidget = (widgets: Widget[]): Widget | undefined => {
    const mainWidget = widgets[0];
    if (!mainWidget?.children?.length) {
        return widgets.shift();
    }

    return extractMainWidget(mainWidget.children);
};
