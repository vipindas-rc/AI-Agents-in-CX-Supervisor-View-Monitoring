import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ExternalLinkIcon: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-external-link'} {...props} />
);
