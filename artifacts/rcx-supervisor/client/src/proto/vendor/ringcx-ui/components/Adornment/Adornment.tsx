import type { FC, KeyboardEvent } from 'react';
import { useCallback, useMemo } from 'react';

import deepmerge from 'deepmerge';
import { useTranslation } from 'react-i18next';

import { StyledIconWrapper } from './Adornment.styled';
import type { IAdornment } from './types';
import { extractTextFromReactNode } from '../../helpers';
import { Information } from '../../icons';
import { i18next } from '../../services/translate';
import Tooltip from '../Tooltip';

const Adornment: FC<IAdornment> = ({
    tooltipMessage = '',
    icon = null,
    size = 'small',
    placement = 'bottom',
    legacyMode = false,
    offset,
    inline = false,
    tooltipPopperProps,
    tooltipWidth,
}) => {
    const { t } = useTranslation(undefined, { i18n: i18next });

    const ariaLabel = useMemo(() => {
        const moreInfoText = t('ARIA_LABELS.MORE_INFO');

        if (!tooltipMessage) {
            return moreInfoText;
        }

        const tooltipText = extractTextFromReactNode(tooltipMessage).trim();

        if (tooltipText) {
            return `${moreInfoText}: ${tooltipText}`;
        }

        return moreInfoText;
    }, [tooltipMessage, t]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLSpanElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            (e.target as HTMLElement).blur();
        }
    }, []);
    const content = useMemo(() => {
        const renderIcon = icon || <Information />;
        return (
            <StyledIconWrapper
                legacyMode={legacyMode}
                size={size}
                tooltipWidth={tooltipWidth}
                inline={inline}
                tabIndex={tooltipMessage ? 0 : undefined}
                aria-label={ariaLabel}
                role={tooltipMessage ? 'button' : 'img'}
                onKeyDown={handleKeyDown}
            >
                {renderIcon}
            </StyledIconWrapper>
        );
    }, [
        icon,
        inline,
        legacyMode,
        size,
        tooltipMessage,
        tooltipWidth,
        ariaLabel,
    ]);

    const localOffset = useMemo(() => {
        switch (placement) {
            case 'bottom':
            case 'top': {
                return offset ? offset : inline ? '0, -8px' : '0, -12px';
            }
            default: {
                return '';
            }
        }
    }, [inline, offset, placement]);

    const popperProps = useMemo(() => {
        const offsetProps = {
            modifiers: {
                offset: {
                    offset: localOffset,
                },
            },
        };
        return deepmerge(tooltipPopperProps || {}, offsetProps);
    }, [localOffset, tooltipPopperProps]);

    if (tooltipMessage) {
        return (
            <Tooltip
                PopperProps={popperProps}
                placement={placement}
                title={tooltipMessage}
            >
                {content}
            </Tooltip>
        );
    }
    return content;
};

export default Adornment;
