import type { FC, SyntheticEvent } from 'react';

import {
    SpinnerWrapper,
    StyledListItem,
    StyledListItemLink,
    StyledListItemTitle,
} from './ListItem.styled';
import type { ListItemType } from './types';
import { TEST_AID } from '../../../../constants';
import Spinner from '../../../Spinner';
import { Icon } from '../Icon';

const ListItem: FC<ListItemType> = ({
    name,
    path,
    icon,
    openInNewTab = false,
    onTrackAnalytics,
    onClick,
    isLoading,
}) => {
    const onAppLinkClicked = (event: SyntheticEvent) => {
        onTrackAnalytics &&
            onTrackAnalytics('RCX_app_picker_selected', {
                section: icon,
            });
        onClick?.(event);
    };
    return (
        <StyledListItem data-aid={TEST_AID.APP_SWITCHER_LIST_ITEM}>
            {isLoading && (
                <SpinnerWrapper>
                    <Spinner />
                </SpinnerWrapper>
            )}
            <StyledListItemLink
                href={path}
                rel='noopener noreferrer'
                target={openInNewTab ? '_blank' : '_self'}
                onClick={onAppLinkClicked}
                aria-label={name}
            >
                <Icon icon={icon} />
            </StyledListItemLink>
            <StyledListItemTitle>{name}</StyledListItemTitle>
        </StyledListItem>
    );
};

export default ListItem;
