import type { DefaultTheme } from '@mui/styled-engine';

import { NotificationTypes } from '../../components/constants/Notifications';
import type { INotificationType } from '../../components/constants/types';

export const matchTypeToColor = (
    theme: DefaultTheme,
    type: INotificationType['type']
) => {
    switch (type) {
        case NotificationTypes.ERROR:
            return theme.colors.error;
        case NotificationTypes.SUCCESS:
            return theme.colors.success;
        case NotificationTypes.WARNING:
            return theme.colors.warning;
        case NotificationTypes.INFO:
        default:
            return theme.colors.info;
    }
};
