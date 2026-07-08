import type { FC } from 'react';

import { PageSubtitle, PageTitle, PageWrapper } from './InfoPage.styled';
import type { InfoPageProps } from './types';
import { Button } from '../Button';

const InfoPage: FC<InfoPageProps> = ({
    className,
    icon,
    title,
    subtitle,
    buttonText,
    onClick,
}) => {
    return (
        <PageWrapper {...{ className }}>
            {icon}

            <PageTitle>{title}</PageTitle>
            <PageSubtitle>{subtitle}</PageSubtitle>

            {buttonText && onClick ? (
                <Button onClick={onClick} variant='outlined'>
                    {buttonText}
                </Button>
            ) : null}
        </PageWrapper>
    );
};

export default InfoPage;
