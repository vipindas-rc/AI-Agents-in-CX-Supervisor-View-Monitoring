export type BackLinkType = {
    title: string;
    href?: string;
    component?: string | JSX.Element;
    onClick?(): void;
    showTitle?: boolean;
};
