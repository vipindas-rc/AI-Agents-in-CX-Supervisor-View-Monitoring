import type { FC } from 'react';

import type { IUserInfo } from './types/UserInfo';
import { StyledUserInfo, UserName, UserEmail } from './UserInfo.styled';
import { TEST_AID } from '../../../../../../constants';
import { TextEclipse } from '../../../../../TextEclipse';

const UserInfo: FC<IUserInfo> = ({ fullName, email }) => {
    return (
        <StyledUserInfo>
            {fullName && (
                <UserName data-aid={TEST_AID.USER_MENU_NAME}>
                    <TextEclipse tooltipMsg={fullName}>{fullName}</TextEclipse>
                </UserName>
            )}
            {email && (
                <UserEmail data-aid={TEST_AID.USER_MENU_EMAIL}>
                    <TextEclipse tooltipMsg={email}>{email}</TextEclipse>
                </UserEmail>
            )}
        </StyledUserInfo>
    );
};

export default UserInfo;
