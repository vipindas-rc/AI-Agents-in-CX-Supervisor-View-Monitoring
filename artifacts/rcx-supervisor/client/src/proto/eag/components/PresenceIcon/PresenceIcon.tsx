import type { RcPresenceSize } from '@ringcentral/juno';
import { RcPresence } from '@ringcentral/juno';

import { getPresenceType } from './helpers';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { withBrandTheme } from '../../helpers/withBrandTheme';

const PresenceIconComponent = ({
    presenceValue,
    size = 'small',
    presenceId,
}: {
    presenceValue: string;
    size?: RcPresenceSize;
    presenceId?: string;
}) => {
    const presenceType = getPresenceType(presenceValue);

    return (
        <RcPresence
            key={presenceId ?? `${size}-${presenceType}`}
            size={size}
            type={presenceType}
        />
    );
};

export const PresenceIcon = withBrandTheme(PresenceIconComponent);

export default CreateAngularModule(
    'presenceIcon',
    PresenceIcon,
    ['size', 'presenceValue', 'presenceId'],
    []
);
