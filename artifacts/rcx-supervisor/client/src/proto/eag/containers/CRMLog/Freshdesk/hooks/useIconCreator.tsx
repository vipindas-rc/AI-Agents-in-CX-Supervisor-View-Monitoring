import { Avatar } from '@material-ui/core';

import type { MatchItem } from '../../../../components/CRM/types';
import UserIcon from '../icons/user.svg';

export function useIconCreator() {
    return ({ name }: MatchItem) => {
        return <Avatar alt={name} src={UserIcon} className='tag-icon' />;
    };
}
