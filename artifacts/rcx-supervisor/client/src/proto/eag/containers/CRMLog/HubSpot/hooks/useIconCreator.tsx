import { Avatar } from '@material-ui/core';
import { Business, Description, MonetizationOn } from '@material-ui/icons';

import type { MatchItem } from '../../../../components/CRM/types';
import { HusSpotRecordType } from '../constants';
import { ReactComponent as CustomIcon } from '../icons/custom.svg';

export function useIconCreator() {
    return (item: MatchItem) => {
        let Icon: any = CustomIcon;
        switch (item.type) {
            case HusSpotRecordType.Company:
                Icon = Business;
                break;
            case HusSpotRecordType.Deal:
                Icon = MonetizationOn;
                break;
            case HusSpotRecordType.Ticket:
                Icon = Description;
                break;
            case HusSpotRecordType.Contact:
                Icon = Avatar;
                break;
        }
        return <Icon className='tag-icon icon-with-theme' />;
    };
}
