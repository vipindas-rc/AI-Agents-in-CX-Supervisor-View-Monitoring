import type { IBulkEditPopper } from '../../BulkEditPopper/types/BulkEditPopper';
import type { ISingleSelectProps } from '../../DropDown';
import type { ISearchInput } from '../../Inputs/SearchInput';
import type {
    ActionType,
    BackLinkType,
    GroupNavigationType,
} from '../components';
import type { HeaderButtonsItem } from '../components/HeaderButtons';

export enum ContentItemsStyleType {
    ITEM = 'item-title',
    LIST = 'list-title',
}

export type ContentHeaderType = {
    backTitle?: BackLinkType['title'];
    backLink?: BackLinkType['href'];
    backComponent?: BackLinkType['component'];
    backOnClick?: BackLinkType['onClick'];
    noResultsFoundText?: string;

    currentContentItem?: GroupNavigationType['currentEntityId'];
    contentItems?:
        | IBulkEditPopper['names']
        | GroupNavigationType['groupItems']
        | string;
    contentItemsStyleType?: ContentItemsStyleType;
    onContentItemsChange?: ISingleSelectProps['onChange'];

    search?: ISearchInput;
    searchComponent?: JSX.Element;
    renderLabel?: IBulkEditPopper['renderLabel'];

    buttons?: HeaderButtonsItem[];
    actions?: ActionType[];

    disabled?: boolean;

    accessibilityLabels?: {
        actionsMenu: {
            open: string;
            close: string;
        };
    };
};
