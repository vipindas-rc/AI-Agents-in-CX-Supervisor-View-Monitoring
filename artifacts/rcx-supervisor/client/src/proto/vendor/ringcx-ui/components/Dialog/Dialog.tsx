import type { FC, UIEventHandler, SyntheticEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import {
    StyledCloseIcon,
    StyledDialog,
    StyledDialogActions,
    StyledDialogBottomText,
    StyledDialogContent,
    StyledDialogContentText,
    StyledDialogIconButton,
    StyledDialogTitle,
} from './Dialog.styled';
import type { IStyledDialogProps } from './types/Dialog';
import { TEST_AID } from '../../constants';
import { i18next } from '../../services/translate';

const Dialog: FC<IStyledDialogProps> = ({
    open,
    onClose,
    content = null,
    actions,
    dialogTitle,
    closeButtonText,
    bottomText,
    hideCloseWithX = false,
    disabledX = false,
    maxWidth = undefined,
    visible = false,
    scrollable = false,
    disableBackdropClick,
    onExited: deprecatedOnExited,
    i18n = i18next,
    ...props
}) => {
    const { t } = useTranslation(undefined, { i18n });
    const [isFit, setIsFitValue] = useState<boolean>(true);
    const [isScrolled, setIsScrolled] = useState(false);

    const resizeObserver = useMemo(
        () =>
            new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target.parentElement) {
                        const { clientHeight, scrollHeight } =
                            entry.target.parentElement;
                        setIsFitValue(clientHeight >= scrollHeight);
                    }
                }
            }),
        []
    );

    const dialogContentRef = useCallback(
        (element: HTMLDivElement) => {
            if (element) {
                for (const child of Array.from(element.children)) {
                    resizeObserver.observe(child);
                }
            } else {
                resizeObserver.disconnect();
            }
        },
        [resizeObserver]
    );

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        setIsScrolled(event.currentTarget.scrollTop > 0);
    };

    const dialogInfo =
        typeof content === 'string' ? (
            <StyledDialogContentText>{content}</StyledDialogContentText>
        ) : (
            content
        );

    const handleOnClose = useCallback(
        (e: SyntheticEvent, reason?: string) => {
            if (reason !== 'backdropClick' || !disableBackdropClick) {
                onClose?.(e);
            }
        },
        [disableBackdropClick, onClose]
    );

    return (
        <StyledDialog
            {...{
                open,
                onClose: handleOnClose,
                maxWidth,
                $visible: visible,
                $scrollable: scrollable,
                TransitionProps: {
                    onExited: deprecatedOnExited,
                },
                'data-aid': TEST_AID.DIALOG_CONTAINER,
                ...props,
            }}
        >
            {!hideCloseWithX && (
                <StyledDialogIconButton
                    disabled={disabledX}
                    disableRipple
                    autoFocus
                    disableFocusRipple
                    size='small'
                    onClick={handleOnClose}
                    data-aid={TEST_AID.CLOSE_X_BUTTON}
                    tabIndex={0}
                    aria-label={closeButtonText || t('ARIA_LABELS.CLOSE')}
                    {...(closeButtonText && { title: closeButtonText })}
                >
                    <StyledCloseIcon width={14} height={14} />
                </StyledDialogIconButton>
            )}
            <StyledDialogTitle
                data-aid={TEST_AID.DIALOG_TITLE}
                withShadow={isScrolled}
            >
                {dialogTitle}
            </StyledDialogTitle>
            <StyledDialogContent
                ref={dialogContentRef}
                withBorder={!isFit}
                maxWidth={maxWidth}
                scrollable={scrollable}
                onScroll={handleScroll}
            >
                {dialogInfo}
            </StyledDialogContent>
            {actions && <StyledDialogActions>{actions}</StyledDialogActions>}
            {bottomText && (
                <StyledDialogBottomText>{bottomText}</StyledDialogBottomText>
            )}
        </StyledDialog>
    );
};

export default Dialog;
