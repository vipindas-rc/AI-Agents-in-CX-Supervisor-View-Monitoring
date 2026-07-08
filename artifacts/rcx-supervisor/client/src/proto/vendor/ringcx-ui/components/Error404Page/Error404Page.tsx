import type { FC } from 'react';

import { ReactComponent as Error404Image } from './assets/404.svg';
import type { Error404PageProps } from './types';
import { InfoPage } from '../InfoPage';

const Error404Page: FC<Error404PageProps> = ({
    title,
    subtitle,
    buttonText,
    onClick,
}) => (
    <InfoPage
        {...{
            icon: <Error404Image />,
            title,
            subtitle,
            buttonText,
            onClick,
        }}
    />
);

export default Error404Page;
