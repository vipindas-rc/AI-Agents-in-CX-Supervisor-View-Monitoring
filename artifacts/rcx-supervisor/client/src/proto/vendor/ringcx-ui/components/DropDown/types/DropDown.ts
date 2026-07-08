import type { RefObject } from 'react';

import type { RequestType } from '@ringcx/shared';
import type { i18n } from 'i18next';

import type { IAdornment } from '../../Adornment/types';
import type { IDotProps } from '../../Dot';
import type { IHyperlinkProps } from '../../Hyperlink';
import type { ITagProps } from '../../Tag';
import type { IToolTipProps } from '../../Tooltip/types/Tooltip';

export type DropDownSizes = 'small' | 'medium';
export type MenuItemTypes = 'item' | 'group';
export type OpenDirection = 'down' | 'up';

export enum DisplayVariantType {
    Tag = 'tag',
    Dot = 'dot',
    Hyperlink = 'hyperlink',
    DisabledOption = 'disabledOption',
    Button = 'button',
    Divider = 'divider',
    MultiLine = 'multiLine',
    Tooltip = 'tooltip',
}

export type TagDisplayVariant = Pick<ITagProps, 'color'> & {
    type: DisplayVariantType.Tag;
};

export type DotDisplayVariant = IDotProps & {
    type: DisplayVariantType.Dot;
};

export type HyperlinkDisplayVariant = IHyperlinkProps & {
    type: DisplayVariantType.Hyperlink;
};

export type DisabledOptionDisplayVariant = {
    type: DisplayVariantType.DisabledOption;
    disabledText: string;
};

export type ButtonDisplayVariant = {
    type: DisplayVariantType.Button;
};

export type DividerDisplayVariant = {
    type: DisplayVariantType.Divider;
};

export type MultiLineDisplayVariant = {
    type: DisplayVariantType.MultiLine;
    subtitle?: string;
};

export type TooltipDisplayVariant = {
    type: DisplayVariantType.Tooltip;
    tooltipMessage: string;
};

export type InteractiveDisplayVariant =
    | TagDisplayVariant
    | DotDisplayVariant
    | HyperlinkDisplayVariant;

export type StructuralDisplayVariant =
    | DisabledOptionDisplayVariant
    | ButtonDisplayVariant
    | DividerDisplayVariant
    | MultiLineDisplayVariant
    | TooltipDisplayVariant;

export interface IMenuItem {
    id: string;
    displayName: string;
    variant?: InteractiveDisplayVariant | StructuralDisplayVariant;
    groupId?: string;
    icon?: string;
}

export type IMenuGroup = Omit<IMenuItem, 'groupId'> & { hidden?: boolean };

export interface IDropDownData {
    groups?: IMenuGroup[];
    items: IMenuItem[];
}

export interface IFlatMenuItem extends Omit<IMenuItem, 'groupId'> {
    itemType: MenuItemTypes;
}

export interface IOnOpenProps {
    wrapperRef: RefObject<HTMLDivElement>;
    borderRef: RefObject<HTMLDivElement>;
}

export interface IDropDownProps {
    data: IDropDownData;
    placeholder?: string;
    disabled?: boolean;
    size?: DropDownSizes;
    width?: number;
    // TODO: rename to ~visibleListCount
    visibleItemsCount?: number;
    noResultsFoundText?: string;
    nothingAvailableText?: string;
    onOpen?(args: IOnOpenProps): void;
    onClose?(): void;
    onFocus?(): void;
    onBlur?(): void;
}

export interface ISingleSelectProps extends IDropDownProps {
    selectedItemId?: IFlatMenuItem['id'] | null;
    isSearchable?: boolean;
    useDefaultSort?: boolean;
    onChange(id: string): void;
    title: string;
    required?: boolean;
    error: boolean;
    message: string;
    formWidth?: string;
    loading?: boolean;
    enableClearButton?: boolean;
    loadingPlaceholder?: string;
    fixedOpeningDirection?: boolean;
    endAdornment?: Omit<IAdornment, 'legacyMode' | 'offset'>;
    fieldNameTooltip?: {
        message: string;
        placement?: IToolTipProps['placement'];
    };
    activePlaceholder?: boolean;
    dataAid?: string;
    hideDropdownToggleIfOpen?: boolean;
    openingDirection?: OpenDirection;
    tooltipPlacement?: IToolTipProps['placement'];
    ariaLabel?: string;
    ariaLabelledBy?: string;
    forceFocus?: boolean;
    i18n?: i18n;
}

export interface IAsyncSelectProps extends ISingleSelectProps {
    url: string;
    method?: RequestType;
    renderData?: (data: any) => IMenuItem[];
}

export type SelectedItemsIds = Array<IFlatMenuItem['id']>;

export interface IMultiSelectProps extends IDropDownProps {
    title: string;
    onChange(ids: SelectedItemsIds): void;
    error: boolean;
    message: string;
    loading?: boolean;
    loadingText?: string;
    selectAllText?: string; // Text for select all button
    deselectAllText?: string; // Text for deselect all button
    allSelectedText?: string; // If provide - will be show in dropdown, when selected all items
    selectedItemsIds?: SelectedItemsIds;
    required?: boolean;
    expandedPlaceholder?: string;
    enableActions?: boolean;
    activePlaceholder?: boolean;
    useDefaultSort?: boolean;
    fixedOpeningDirection?: boolean;
    enableClearButton?: boolean;
    dataAid?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    i18n?: i18n;
}

export interface IDisplayItem {
    showExistItem?: boolean;
}

// GUARDS

export function isTagVariantGuard(
    variant?: IMenuItem['variant']
): variant is TagDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.Tag;
}

export function isDotVariantGuard(
    variant?: IMenuItem['variant']
): variant is DotDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.Dot;
}

export function isHyperlinkVariantGuard(
    variant?: IMenuItem['variant']
): variant is HyperlinkDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.Hyperlink;
}

export function isDisabledOptionVariantGuard(
    variant?: IMenuItem['variant']
): variant is DisabledOptionDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.DisabledOption;
}

export function isButtonVariantGuard(
    variant?: IMenuItem['variant']
): variant is ButtonDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.Button;
}

export function isDividerVariantGuard(
    variant?: IMenuItem['variant']
): variant is DividerDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.Divider;
}

export function isMultiLineVariantGuard(
    variant?: IMenuItem['variant']
): variant is MultiLineDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.MultiLine;
}

export function isTooltipVariantGuard(
    variant?: IMenuItem['variant']
): variant is TooltipDisplayVariant {
    return !!variant && variant.type === DisplayVariantType.Tooltip;
}
