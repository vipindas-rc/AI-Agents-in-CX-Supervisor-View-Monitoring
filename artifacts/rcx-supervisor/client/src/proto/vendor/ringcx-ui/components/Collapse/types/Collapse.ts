import type { CollapseProps } from '@material-ui/core/Collapse';

export interface ICollapseProps extends CollapseProps {
    caption: React.ReactNode;
    subtitle?: string;
    expanded?: boolean | null;
    setExpanded?(expanded: boolean): void;
}
