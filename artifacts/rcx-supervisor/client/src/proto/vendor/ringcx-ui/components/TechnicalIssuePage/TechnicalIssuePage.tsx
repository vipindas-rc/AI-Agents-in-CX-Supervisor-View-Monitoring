import type { FC } from 'react';

import { ReactComponent as TechnicalIssueImage } from './assets/TechnicalIssueImage.svg';
import type { ITechnicalIssuePage } from './types';
import { InfoPage } from '../InfoPage';

const onReload = () => {
    window.location.reload();
};

const TechnicalIssuePage: FC<ITechnicalIssuePage> = ({
    buttonText = 'Reload page now',
    title = 'We are experiencing technical difficulties loading this page',
    subtitle = 'We can’t get that information right now. Please try again later.',
}) => (
    <InfoPage
        {...{
            icon: <TechnicalIssueImage />,
            buttonText,
            title,
            subtitle,
            onClick: onReload,
        }}
    />
);

export default TechnicalIssuePage;
