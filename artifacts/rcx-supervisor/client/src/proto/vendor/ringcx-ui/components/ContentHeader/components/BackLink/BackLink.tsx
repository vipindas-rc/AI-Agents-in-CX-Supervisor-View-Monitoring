import type { FC } from 'react';

import { ArrowBack } from '@material-ui/icons/';

import { StyledLink } from './BackLink.styled';
import type { BackLinkType } from './types';
import { capitalizeWord } from '../../../../helpers/string';
import { TextEclipse } from '../../../TextEclipse';

const BackLink: FC<BackLinkType> = ({
    title,
    href,
    onClick,
    component = 'a',
    showTitle = true,
    ...rest
}) => (
    <StyledLink
        {...{
            href,
            onClick,
            component,
            title,
            ...rest,
        }}
    >
        <ArrowBack />
        {showTitle && (
            <TextEclipse tooltipMsg={capitalizeWord(title, true)}>
                {capitalizeWord(title, true)}
            </TextEclipse>
        )}
    </StyledLink>
);

export default BackLink;
