import type { ISideNav } from '../../../types/SideNav';

export interface INavMoreButton extends Pick<ISideNav, 'expanded'> {
    showMore: boolean;
    moreLabel?: string;
    lessLabel?: string;
    setShowMore(state: boolean): void;
}
