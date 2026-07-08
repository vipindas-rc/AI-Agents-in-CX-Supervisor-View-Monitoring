import { logoutAndRedirectToLogin } from '@ringcx/shared';

export const formatStateLabel = (stateObj: any) => {
    return stateObj && (stateObj.stateLabel || stateObj.baseState);
};

export const onClickLogout = () => {
    logoutAndRedirectToLogin();
};
