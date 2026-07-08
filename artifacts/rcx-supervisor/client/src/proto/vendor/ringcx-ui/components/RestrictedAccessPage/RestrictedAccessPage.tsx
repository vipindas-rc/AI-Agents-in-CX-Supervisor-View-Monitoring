import type { FC } from 'react';

import { ReactComponent as RestrictedAccessImage } from './assets/RestrictedAccessImage.svg';
import type { IRestrictedAccessPage } from './types';
import { InfoPage } from '../InfoPage';

const RestrictedAccessPage: FC<IRestrictedAccessPage> = ({
    title = 'Restricted access',
    subtitle = 'Sorry, it looks like you don’t have access to this page',
}) => (
    <InfoPage
        {...{
            icon: <RestrictedAccessImage />,
            title,
            subtitle,
        }}
    />
);

export default RestrictedAccessPage;
