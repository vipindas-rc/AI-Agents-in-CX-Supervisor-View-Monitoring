import type { PopperProps } from '@material-ui/core/Popper';

import type { IMenuItem } from '../components/UserItems/types/UserItems';

export interface IUserData {
    fullName: string;
    lastName: string;
    firstName: string;
    email: string;
}

export interface IUserMenu {
    userData?: IUserData;
    userMenuContainer?: PopperProps['container'];
    items: IMenuItem[];
    loading?: boolean;
}
