import type { TabProps } from '@material-ui/core/Tab';

export interface ITabProps extends Omit<TabProps, 'label'> {
    label: string;
    size?: 'headline' | 'caption';
}
