import { useContext } from 'react';

import ToastContext from './ToastContext';
import type {
    IParticularToastBuildData,
    IToastBuildData,
    IToastProps,
} from './types';
import { NotificationTypes } from '../constants/Notifications';

const CRITICAL_ERROR = 'criticalError';

const getUniqToasts = (toasts: IToastProps[]): IToastProps[] => {
    // reverse to use the last toast
    const uniqToasts = toasts.reverse().reduce((acc, current) => {
        const uniqId = (current && current.uniqId) || current.id;

        return { ...acc, [uniqId]: current };
    }, {});
    const uniqToastArray: IToastProps[] = Object.values(uniqToasts);

    // return to initial state
    return uniqToastArray.reverse();
};

/** deprecated
 * use: const { enqueueSnackbar } = useSnackbar(); */
const useToast = () => {
    const [, setToasts] = useContext(ToastContext);

    const removeToast = (tid: IToastProps['id']) => {
        setToasts((toasts: IToastProps[]) => {
            return toasts.filter(({ id }: IToastProps) => id !== tid);
        });
    };

    const createToast = ({
        type,
        text,
        actions,
        hasCloseButton,
        timeout,
        fadeInDuration,
        fadeOutDuration,
        origin,
        stayOpen = false,
        uniqId,
        disableFocus,
    }: IToastBuildData) => {
        setToasts((toasts: IToastProps[]) => {
            const toastsByType = {
                [CRITICAL_ERROR]: toasts.filter(
                    (item: IToastBuildData) =>
                        item.type === NotificationTypes.ERROR && item.stayOpen
                ),
                [NotificationTypes.ERROR]: toasts.filter(
                    (item: IToastBuildData) =>
                        item.type === NotificationTypes.ERROR && !item.stayOpen
                ),
                [NotificationTypes.SUCCESS]: toasts.filter(
                    (item: IToastBuildData) =>
                        item.type === NotificationTypes.SUCCESS
                ),
                [NotificationTypes.WARNING]: toasts.filter(
                    (item: IToastBuildData) =>
                        item.type === NotificationTypes.WARNING
                ),
                [NotificationTypes.INFO]: toasts.filter(
                    (item: IToastBuildData) =>
                        item.type === NotificationTypes.INFO
                ),
            };

            const uid = new Date().getTime();

            if (origin) {
                const index = toasts.findIndex((item: IToastBuildData) => {
                    return item.origin === origin;
                });

                if (index > -1) {
                    toasts[index].text = text;
                    return [...toasts];
                }
            }

            const item: IToastProps = {
                id: uid,
                type,
                timeout,
                fadeInDuration,
                fadeOutDuration,
                text,
                actions,
                hasCloseButton,
                removeToast,
                origin,
                stayOpen,
                uniqId,
                disableFocus,
                // disable animation if toast is duplicated
                showAnimation:
                    !uniqId || !toasts.find((toast) => toast.uniqId === uniqId),
            };

            if (type) {
                const toastType =
                    type === NotificationTypes.ERROR && stayOpen
                        ? CRITICAL_ERROR
                        : type;
                toastsByType[toastType].unshift(item);
            }

            return [
                ...getUniqToasts(toastsByType[CRITICAL_ERROR]),
                ...getUniqToasts(toastsByType[NotificationTypes.ERROR]),
                ...getUniqToasts(toastsByType[NotificationTypes.SUCCESS]),
                ...getUniqToasts(toastsByType[NotificationTypes.WARNING]),
                ...getUniqToasts(toastsByType[NotificationTypes.INFO]),
            ];
        });
    };

    return {
        success: ({
            text,
            timeout,
            fadeInDuration,
            fadeOutDuration,
            hasCloseButton,
            actions,
            origin,
            stayOpen,
            uniqId,
            disableFocus,
        }: IParticularToastBuildData) =>
            createToast({
                type: NotificationTypes.SUCCESS,
                text,
                timeout,
                fadeInDuration,
                fadeOutDuration,
                hasCloseButton,
                actions,
                origin,
                stayOpen,
                uniqId,
                disableFocus,
            }),
        error: ({
            text,
            timeout,
            fadeInDuration,
            fadeOutDuration,
            hasCloseButton,
            actions,
            origin,
            stayOpen,
            uniqId,
            disableFocus,
        }: IParticularToastBuildData) =>
            createToast({
                type: NotificationTypes.ERROR,
                text,
                timeout,
                fadeInDuration,
                fadeOutDuration,
                hasCloseButton,
                actions,
                origin,
                stayOpen,
                uniqId,
                disableFocus,
            }),
        warning: ({
            text,
            timeout,
            fadeInDuration,
            fadeOutDuration,
            hasCloseButton,
            actions,
            origin,
            stayOpen,
            uniqId,
            disableFocus,
        }: IParticularToastBuildData) =>
            createToast({
                type: NotificationTypes.WARNING,
                text,
                timeout,
                fadeInDuration,
                fadeOutDuration,
                hasCloseButton,
                actions,
                origin,
                stayOpen,
                uniqId,
                disableFocus,
            }),
        info: ({
            text,
            timeout,
            fadeInDuration,
            fadeOutDuration,
            hasCloseButton,
            actions,
            origin,
            stayOpen,
            uniqId,
            disableFocus,
        }: IParticularToastBuildData) =>
            createToast({
                type: NotificationTypes.INFO,
                text,
                timeout,
                fadeInDuration,
                fadeOutDuration,
                hasCloseButton,
                actions,
                origin,
                stayOpen,
                uniqId,
                disableFocus,
            }),
    };
};

export default useToast;
