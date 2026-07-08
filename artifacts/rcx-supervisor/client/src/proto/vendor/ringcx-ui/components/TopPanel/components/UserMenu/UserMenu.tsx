import type { FC } from 'react';
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import UserInfo from './components/UserInfo/UserInfo';
import UserItems from './components/UserItems/UserItems';
import type { IUserMenu } from './types/UserMenu';
import {
    UserMenuDivider,
    StyledPopper,
    StyledAvatarTextUser,
    StyledUserToggleButton,
    StyledAvatarUserCircle,
    size,
} from './UserMenu.styled';
import { TEST_AID } from '../../../../constants';
import { i18next } from '../../../../services/translate';
import Skeleton from '../../../Skeleton';

const UserMenu: FC<IUserMenu> = ({
    items,
    userMenuContainer,
    userData,
    loading,
}) => {
    const { t } = useTranslation(undefined, { i18n: i18next });
    const renderToggle = useMemo(() => {
        let content = <StyledAvatarUserCircle />;

        if (userData && (userData.firstName || userData.lastName)) {
            let result = '';
            if (userData.firstName) {
                result = userData.firstName[0].toUpperCase();
            }

            if (userData.lastName) {
                result += userData.lastName[0].toUpperCase();
            }

            content = (
                <StyledAvatarTextUser data-aid={TEST_AID.USER_MENU_TOGGLE}>
                    {result}
                </StyledAvatarTextUser>
            );
        }

        return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <StyledUserToggleButton aria-label={t('ARIA_LABELS.MENU')}>
                {content}
            </StyledUserToggleButton>
        );
    }, [userData, t]);

    const renderUserInfo = useMemo(() => {
        if (userData) {
            const { fullName, email } = userData;
            return <UserInfo fullName={fullName} email={email} />;
        }
        return null;
    }, [userData]);

    return loading ? (
        <Skeleton variant='circle' width={size} height={size} />
    ) : (
        <StyledPopper
            data-aid={TEST_AID.USER_MENU}
            disabled={loading}
            container={userMenuContainer}
            toggleComponent={renderToggle}
            enableKeyboardNavigation={true}
        >
            {renderUserInfo}
            {userData && <UserMenuDivider />}
            <UserItems {...{ items }} />
        </StyledPopper>
    );
};

export default UserMenu;
