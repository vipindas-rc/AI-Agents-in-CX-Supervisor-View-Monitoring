import type { ReactPortal } from 'react';
import { useContext, useMemo, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { CtaButton, TopHatStyled, CloseButton } from './TopHat.styled';
import { VisuallyHiddenLabel } from '../../../components/form/VisuallyHiddenLabel/VisuallyHiddenLabel';
import {
    TEST_AID,
    FOCUS_DELAY_MS,
    KEYBOARD_KEYS,
    DISPOSITION_DIALOG_SELECTORS,
    DIALOG_SELECTORS,
} from '../../../constants';
import { CloseSvg } from '../../../icons';
import { TopHatContext } from '../TopHatProvider';
import type { IActionButton, ICloseActionButton } from '../types';

const TopHat = (): ReactPortal | null => {
    const [topHatState] = useContext(TopHatContext);
    const container = useMemo(() => createRootElement('topHatContainer'), []);
    const { options } = topHatState;
    const restoreFocusElement = useRef<string | null>(null);
    const [announcement, setAnnouncement] = useState('');

    useEffect(() => {
        if (!topHatState.open || !topHatState.message) {
            setAnnouncement('');
            return;
        }

        setAnnouncement('');
        const announceTimeoutId = setTimeout(() => {
            setAnnouncement(topHatState.message);
        }, 500);

        return () => {
            clearTimeout(announceTimeoutId);
        };
    }, [topHatState]);

    useEffect(() => {
        if (topHatState.open && restoreFocusElement.current != null) {
            const restoreFocus = () => {
                const restoreFocusButton = document.querySelector(
                    `span[data-aid="${restoreFocusElement.current ?? ''}"]`
                ) as HTMLElement;

                if (restoreFocusButton) {
                    restoreFocusButton.focus();
                    restoreFocusElement.current = null;
                }
            };

            const timeoutId = setTimeout(restoreFocus, FOCUS_DELAY_MS);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [topHatState.open]);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        const dialog = node.querySelector(
                            DIALOG_SELECTORS.COMBINED
                        );
                        if (dialog || node.matches(DIALOG_SELECTORS.COMBINED)) {
                            const dialogElement = (dialog ||
                                node) as HTMLElement;

                            requestAnimationFrame(() => {
                                setTimeout(() => {
                                    const notesTextarea =
                                        dialogElement.querySelector(
                                            DISPOSITION_DIALOG_SELECTORS.COMBINED_NOTES
                                        ) as HTMLElement;

                                    if (notesTextarea) {
                                        notesTextarea.focus();
                                    }
                                }, FOCUS_DELAY_MS);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const createKeyboardHandler = (testAid: string, action: () => void) => {
        return (event: React.KeyboardEvent<HTMLSpanElement>) => {
            if (
                event.key === KEYBOARD_KEYS.ENTER ||
                event.key === KEYBOARD_KEYS.SPACE
            ) {
                event.preventDefault();
                restoreFocusElement.current = testAid;
                action();
            }
        };
    };

    const buildCtaButton = (buttonType: IActionButton, testAid: string) => {
        const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
            restoreFocusElement.current = testAid;
            buttonType.action();
        };

        return (
            <CtaButton
                data-aid={testAid}
                onClick={handleClick}
                tabIndex={0}
                onKeyDown={createKeyboardHandler(testAid, buttonType.action)}
            >
                {buttonType.actionTitle}
                {buttonType.external && <i className='fa fa-external-link' />}
            </CtaButton>
        );
    };

    const topHat = (
        <TopHatStyled {...{ type: topHatState.type, open: topHatState.open }}>
            <div data-aid={TEST_AID.TOPHAT_OLD}>
                <span>{topHatState.message}</span>
                {options &&
                    options.primary &&
                    buildCtaButton(
                        options.primary,
                        TEST_AID.TOPHAT_ACTION_PRIMARY_OLD
                    )}
                {options &&
                    options.secondary &&
                    buildCtaButton(
                        options.secondary,
                        TEST_AID.TOPHAT_ACTION_SECONDARY_OLD
                    )}
                {options &&
                    options.closeWithX &&
                    buildCloseButton(options.closeWithX)}
            </div>
            <span role='status' aria-live='polite'>
                <VisuallyHiddenLabel
                    htmlFor={TEST_AID.TOPHAT_OLD}
                    aria-live='polite'
                >
                    {announcement}
                </VisuallyHiddenLabel>
            </span>
        </TopHatStyled>
    );

    //only append the children html to the container if it is active
    const topHatAppended = topHatState.open ? topHat : null;
    if (!topHatAppended) {
        return null;
    }
    return createPortal(topHatAppended, container) as any;
};

const buildCloseButton = (buttonType: ICloseActionButton) => {
    return (
        <CloseButton
            data-aid={TEST_AID.TOPHAT_CLOSE_BUTTON_OLD}
            onClick={buttonType.action}
        >
            <CloseSvg />
        </CloseButton>
    );
};

const createRootElement = (id: string) => {
    const existingElem = document.querySelector(`#${id}`);

    if (existingElem == null) {
        const rootContainer = document.createElement('div');
        rootContainer.setAttribute('id', id);
        if (document.body.firstChild) {
            document.body.insertBefore(rootContainer, document.body.firstChild);
        }

        return rootContainer;
    } else {
        return existingElem;
    }
};

export default TopHat;
