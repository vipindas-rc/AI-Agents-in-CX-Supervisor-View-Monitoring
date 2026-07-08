import type { MouseEvent } from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import {
    ToastActions,
    ToastBody,
    ToastMessage,
    ToastRoot,
    StyledLink,
    StyledIconButton,
} from './Toast.styled';
import type { IToastProps } from './types';
import { TEST_AID } from '../../constants';
import { Close } from '../../icons';
import { i18next } from '../../services/translate';

const Toast = ({
    id,
    type,
    timeout = 5000,
    fadeInDuration = 500,
    fadeOutDuration = 2000,
    text,
    hasCloseButton = false,
    actions = [],
    removeToast,
    stayOpen,
    showAnimation = true,
    disableFocus = false,
}: IToastProps) => {
    const ASYNC_ANIMATION_DELTA = 10;

    const [timeoutValue, setTimeoutValue] = useState(
        stayOpen ? -1 : timeout + fadeOutDuration - ASYNC_ANIMATION_DELTA
    );

    const [delay, setDelay] = useState(timeout);
    const [hovered, setHovered] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const { t } = useTranslation(undefined, { i18n: i18next });

    const hideTimeoutRef = useRef(window.setTimeout(() => true, 1));
    const toastRootRef = useRef<HTMLDivElement>(null);

    const escFunction = useCallback(
        (event: KeyboardEvent) => {
            if (event.keyCode === 27) {
                removeToast(id);
            }
        },
        [id, removeToast]
    );

    useEffect(() => {
        if (!toastRootRef || !toastRootRef.current) {
            return;
        }

        const currentToast = toastRootRef.current;

        if (!disableFocus) {
            currentToast.focus();
        }
        currentToast.addEventListener('keydown', escFunction);

        return () => {
            currentToast.removeEventListener('keydown', escFunction);
        };
    }, [escFunction, disableFocus]);

    useEffect(() => {
        window.clearTimeout(hideTimeoutRef.current);
        if (timeoutValue > -1) {
            hideTimeoutRef.current = window.setTimeout(
                () => removeToast(id),
                timeoutValue
            );
            setTimer(Date.now());
        }
    }, [id, removeToast, timeoutValue]);

    const onMouseEnter = useCallback(
        (action: (state: boolean) => void) => {
            const toastOverTimestamp = Date.now();
            const passedTime = toastOverTimestamp - timer;

            const delta = delay - passedTime;

            setTimer(delta > 0 ? delta : 0);
            window.clearTimeout(hideTimeoutRef.current);
            setTimeoutValue(-1);
            action(true);
        },
        [delay, timer]
    );

    /**
     * state - the state we are looking at depending on the events
     * called onMouseLeave = is Focused, onblur = hovered
     *
     * action - what needs to be called depending on events called
     * onMouseLeave = is Focused, onblur = hovered
     */
    const onMouseLeave = useCallback(
        (state: boolean, action: (state: boolean) => void) => {
            !state && setDelay(timer);
            !state &&
                setTimeoutValue(
                    timer + fadeOutDuration - ASYNC_ANIMATION_DELTA
                );
            action(false);
            !state && setTimer(Date.now());
        },
        [timer, fadeOutDuration]
    );

    const toastActions = actions.length
        ? actions.map((action, actionId) => {
              return (
                  <StyledLink
                      key={actionId}
                      component='button'
                      onClick={(event?: MouseEvent<HTMLElement>) => {
                          action.callback(event);

                          if (action.closeAfter) {
                              removeToast(id);
                          }
                      }}
                      tabIndex={0}
                  >
                      {action.label}
                  </StyledLink>
              );
          })
        : [];

    if (hasCloseButton) {
        toastActions.push(
            <StyledIconButton
                aria-label={t('ARIA_LABELS.CLOSE')}
                key='close'
                color='inherit'
                onClick={() => {
                    removeToast(id);
                }}
                tabIndex={0}
                data-aid={TEST_AID.TOAST_CLOSE_BUTTON}
            >
                <Close />
            </StyledIconButton>
        );
    }

    return (
        <ToastRoot ref={toastRootRef} tabIndex={0}>
            <ToastBody
                {...{
                    onMouseEnter: () => onMouseEnter(setHovered),
                    onMouseLeave: () => {
                        if (!stayOpen) {
                            onMouseLeave(isFocused, setHovered);
                        }
                    },
                    fadeInDuration,
                    delay,
                    fadeOutDuration,
                    type,
                    hovered: hovered || isFocused,
                    stayOpen,
                    showAnimation,
                }}
            >
                <ToastMessage>{text}</ToastMessage>
                <ToastActions
                    onFocus={() => onMouseEnter(setIsFocused)}
                    onBlur={() => {
                        if (!stayOpen) {
                            onMouseLeave(hovered, setIsFocused);
                        }
                    }}
                >
                    {toastActions}
                </ToastActions>
            </ToastBody>
        </ToastRoot>
    );
};

export default Toast;
