import type { FC } from 'react';

import { ReactComponent as EmptyImage } from './assets/EmptyImage.svg';
import type { IEmptyPage } from './types';
import { InfoPage } from '../InfoPage';

const EmptyPage: FC<IEmptyPage> = ({
    title = 'Nothing created yet',
    subtitle = 'No entities have been created yet.',
    buttonText,
    onClick,
}) => (
    <InfoPage
        {...{
            icon: <EmptyImage />,
            title,
            subtitle,
            buttonText,
            onClick,
        }}
    />
);

export default EmptyPage;
