import type { FC, SyntheticEvent, KeyboardEvent } from 'react';
import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import {
    TagBorder,
    TagCloseButton,
    TagText,
    AlertIconWrapper,
} from './Tag.styled';
import type { ITagProps } from './types';
import { TEST_AID } from '../../constants';
import { InformationFilled } from '../../icons';
import { i18next } from '../../services/translate';
import { TextEclipse } from '../TextEclipse';

const { TAG, TAG_CLOSE_BUTTON } = TEST_AID;

const Tag: FC<ITagProps> = ({
    color,
    text,
    onClick,
    onClose,
    disabled,
    bordered,
    eclipsable = true,
    shouldShowAlertIcon = false,
    stopPropagation = true,
    tabIndex,
}) => {
    const { t } = useTranslation(undefined, { i18n: i18next });
    const handleCloseClick = useCallback(
        (e: SyntheticEvent<HTMLElement | SVGSVGElement, MouseEvent>) => {
            e.stopPropagation();
            return !disabled && onClose && onClose();
        },
        [disabled, onClose]
    );

    const handleCloseKeyDown = useCallback(
        (e: KeyboardEvent<SVGSVGElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled && onClose) {
                    onClose();
                }
            }
        },
        [disabled, onClose]
    );

    const renderText = useMemo(() => {
        const handler = (e: SyntheticEvent<HTMLDivElement, MouseEvent>) => {
            stopPropagation && e.stopPropagation();
            return !disabled && onClick && onClick();
        };

        const keyDownHandler = (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled && onClick) {
                    onClick();
                }
            }
        };

        const textProps: {
            onClick: typeof handler;
            tabIndex?: number;
            onKeyDown?: typeof keyDownHandler;
            role?: 'button';
        } = { onClick: handler };

        if (tabIndex === -1) {
            textProps.tabIndex = -1;
        } else {
            const isInteractive = !disabled && !!onClick;
            if (isInteractive) {
                textProps.tabIndex = tabIndex !== undefined ? tabIndex : 0;
                textProps.onKeyDown = keyDownHandler;
                textProps.role = 'button';
            }
        }

        const textElement = <TagText {...textProps}>{text}</TagText>;

        if (eclipsable) {
            return <TextEclipse tooltipMsg={text}>{textElement}</TextEclipse>;
        }

        return textElement;
    }, [disabled, eclipsable, onClick, stopPropagation, tabIndex, text]);

    const renderCloseButton = useMemo(() => {
        if (!onClose) {
            return null;
        }

        return (
            <TagCloseButton
                data-aid={TAG_CLOSE_BUTTON}
                onClick={handleCloseClick}
                onKeyDown={handleCloseKeyDown}
                tabIndex={disabled ? -1 : 0}
                role='button'
                aria-label={t('ARIA_LABELS.CLOSE')}
            />
        );
    }, [disabled, onClose, handleCloseClick, handleCloseKeyDown, t]);

    const renderAlertIcon = useMemo(() => {
        if (!shouldShowAlertIcon) {
            return null;
        }
        return (
            <AlertIconWrapper>
                <InformationFilled />
            </AlertIconWrapper>
        );
    }, [shouldShowAlertIcon]);

    return (
        <TagBorder
            color={color}
            bordered={bordered}
            disabled={disabled}
            clickable={!!onClick}
            closable={!!onClose}
            eclipsable={eclipsable}
            data-aid={TAG}
        >
            {renderText}
            {renderCloseButton}
            {renderAlertIcon}
        </TagBorder>
    );
};

export default Tag;
