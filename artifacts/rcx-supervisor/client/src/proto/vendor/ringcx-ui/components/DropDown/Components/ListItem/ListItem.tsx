import { memo, useMemo, createElement } from 'react';

import {
    ButtonTextEclipse,
    DisabledOptionVariant,
    DisabledText,
    ListItemDotVariant,
    ListItemIconWrapper,
    StyledDigitalFontIcon,
    StyledListItem,
    Divider,
    MultiLineItemWrapper,
    MultiLineTitle,
    MultiLineSubtitle,
    TooltipItemWrapper,
    TooltipItemIcon,
    TooltipItemText,
} from './ListItem.styled';
import type { IListItem } from './types';
import { Information } from '../../../../icons/Information';
import { Dot } from '../../../Dot';
import {
    HyperlinkListItemWrapper,
    HyperlinkTextEclipse,
    HyperlinkIconStyled,
} from '../../../Hyperlink';
import { TagComponent } from '../../../Tag';
import { TextEclipse } from '../../../TextEclipse';
import Tooltip from '../../../Tooltip/Tooltip';
import {
    isDotVariantGuard,
    isTagVariantGuard,
    isHyperlinkVariantGuard,
    isDisabledOptionVariantGuard,
    isButtonVariantGuard,
    isDividerVariantGuard,
    isMultiLineVariantGuard,
    isTooltipVariantGuard,
} from '../../types';

const ListItem = ({
    item,
    index,
    handleMenuItemSelect,
    keyboardPositionIndex,
    isSelected,
    ...restProps
}: IListItem) => {
    const listItemClass: string =
        keyboardPositionIndex === index ? 'selected-item' : '';
    const startWithSelected = isSelected && keyboardPositionIndex === null;
    const highlightKeyboardPosition =
        isSelected && index === keyboardPositionIndex;
    const selected =
        startWithSelected || highlightKeyboardPosition ? 'selected-item' : '';

    const { displayName, variant, icon } = item;

    const renderListItemVariant = useMemo(() => {
        if (isTagVariantGuard(variant)) {
            return (
                <TagComponent
                    text={displayName}
                    color={variant.color}
                    onClick={() => handleMenuItemSelect(item, index)}
                    tabIndex={-1}
                />
            );
        }

        if (isDotVariantGuard(variant)) {
            return (
                <ListItemDotVariant>
                    <Dot color={variant.color} />
                    <TextEclipse tooltipMsg={displayName}>
                        {displayName}
                    </TextEclipse>
                </ListItemDotVariant>
            );
        }

        if (isHyperlinkVariantGuard(variant)) {
            return (
                <HyperlinkListItemWrapper>
                    <HyperlinkTextEclipse tooltipMsg={displayName}>
                        {displayName}
                    </HyperlinkTextEclipse>
                    <Tooltip title={variant.tooltipMsg}>
                        <div
                            className='icon-wrapper'
                            data-aid={`${variant.dataAid}_${index + 1}`}
                            onClick={(e) => {
                                variant.onClick();
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        >
                            <HyperlinkIconStyled />
                        </div>
                    </Tooltip>
                </HyperlinkListItemWrapper>
            );
        }

        if (isDisabledOptionVariantGuard(variant)) {
            return (
                <DisabledOptionVariant>
                    <TextEclipse tooltipMsg={displayName}>
                        {displayName}
                    </TextEclipse>
                    <DisabledText>{variant.disabledText}</DisabledText>
                </DisabledOptionVariant>
            );
        }

        if (isButtonVariantGuard(variant)) {
            return (
                <ButtonTextEclipse
                    tooltipMsg={displayName}
                    selected={index === keyboardPositionIndex}
                >
                    {displayName}
                </ButtonTextEclipse>
            );
        }

        if (isMultiLineVariantGuard(variant)) {
            return (
                <MultiLineItemWrapper>
                    <MultiLineTitle>{displayName}</MultiLineTitle>
                    {variant.subtitle && (
                        <MultiLineSubtitle>
                            {variant.subtitle}
                        </MultiLineSubtitle>
                    )}
                </MultiLineItemWrapper>
            );
        }

        if (isTooltipVariantGuard(variant)) {
            const tooltipMessage = variant.tooltipMessage
                .split('\n')
                .map((line, key) => createElement('div', { key }, line));

            return (
                <TooltipItemWrapper>
                    <TooltipItemText>{displayName}</TooltipItemText>
                    <Tooltip title={tooltipMessage} placement='top-end'>
                        <span>
                            <TooltipItemIcon />
                        </span>
                    </Tooltip>
                </TooltipItemWrapper>
            );
        }

        if (icon) {
            return (
                <ListItemIconWrapper>
                    <StyledDigitalFontIcon code={icon} />
                    <TextEclipse tooltipMsg={displayName}>
                        {displayName}
                    </TextEclipse>
                </ListItemIconWrapper>
            );
        }

        return (
            <TextEclipse tooltipMsg={displayName}>{displayName}</TextEclipse>
        );
    }, [
        displayName,
        handleMenuItemSelect,
        icon,
        index,
        item,
        variant,
        keyboardPositionIndex,
    ]);

    if (isDividerVariantGuard(variant)) {
        return <Divider />;
    }

    return (
        <StyledListItem
            onClick={() => handleMenuItemSelect(item, index)}
            disableRipple={true}
            className={`eui-dropdown-list-item ${listItemClass}`}
            selected={isSelected}
            classes={{ selected }}
            disabled={isDisabledOptionVariantGuard(variant)}
            isMultiLine={isMultiLineVariantGuard(variant)}
            {...restProps}
        >
            {renderListItemVariant}
        </StyledListItem>
    );
};

export default memo(ListItem);
