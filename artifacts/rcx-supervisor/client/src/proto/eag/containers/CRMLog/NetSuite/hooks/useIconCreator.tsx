import { Avatar } from '@material-ui/core';

import type { MatchItem } from '../../../../components/CRM/types';
import { RecordType } from '../constants';
import { ReactComponent as CustomerIcon } from '../icons/ns-customer.svg';
import { ReactComponent as EmployeeIcon } from '../icons/ns-employee.svg';
import { ReactComponent as LeadIcon } from '../icons/ns-lead.svg';
import { ReactComponent as OtherNameIcon } from '../icons/ns-otherName.svg';
import { ReactComponent as PartnerIcon } from '../icons/ns-partner.svg';
import { ReactComponent as ProspectIcon } from '../icons/ns-prospect.svg';
import { ReactComponent as VendorIcon } from '../icons/ns-vendor.svg';

const ICON_MAP: Record<string, React.FunctionComponent> = {
    [RecordType.LEAD]: LeadIcon,
    [RecordType.PROSPECT]: ProspectIcon,
    [RecordType.CUSTOMER]: CustomerIcon,
    [RecordType.EMPLOYEE]: EmployeeIcon,
    [RecordType.VENDOR]: VendorIcon,
    [RecordType.PARTNER]: PartnerIcon,
    [RecordType.OTHERNAME]: OtherNameIcon,
};

export function useIconCreator() {
    return (item: MatchItem) => {
        let Icon: any = Avatar;
        if (item.type && ICON_MAP[item.type]) {
            Icon = ICON_MAP[item.type];
        }
        return <Icon className='tag-icon icon-with-theme' />;
    };
}
