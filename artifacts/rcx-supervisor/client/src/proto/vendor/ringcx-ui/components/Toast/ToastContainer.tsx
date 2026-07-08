import { useContext, useMemo } from 'react';

import { createPortal } from 'react-dom';

import Toast from './Toast';
import { ToastContainerFixed } from './Toast.styled';
import ToastContext from './ToastContext';
import type { IToastProps } from './types';

// TODO: deal with any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToastContainer: any = () => {
    const [toasts] = useContext(ToastContext);
    const toastList = (
        <ToastContainerFixed>
            {toasts.map(
                ({
                    id,
                    type,
                    timeout,
                    fadeInDuration,
                    fadeOutDuration,
                    text,
                    hasCloseButton,
                    actions,
                    removeToast,
                    stayOpen,
                    uniqId,
                    showAnimation,
                    disableFocus,
                }: IToastProps) => {
                    return (
                        <Toast
                            key={id}
                            {...{
                                id,
                                type,
                                timeout,
                                fadeInDuration,
                                fadeOutDuration,
                                text,
                                actions,
                                hasCloseButton,
                                removeToast,
                                stayOpen,
                                uniqId,
                                showAnimation,
                                disableFocus,
                            }}
                        />
                    );
                }
            )}
        </ToastContainerFixed>
    );
    const container = useMemo(() => createRootElement('ToastContainer'), []);

    return createPortal(toastList, container);
};

const createRootElement = (id: string) => {
    const existingElem = document.querySelector(`#${id}`);

    if (existingElem === null) {
        const rootContainer = document.createElement('div');
        rootContainer.setAttribute('id', id);
        if (document.body.firstChild) {
            document.body.insertBefore(rootContainer, document.body.firstChild);
        }

        return rootContainer;
    }
    return existingElem;
};

export default ToastContainer;
