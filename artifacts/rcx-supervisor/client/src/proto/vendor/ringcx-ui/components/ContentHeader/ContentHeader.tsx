import type { FC } from 'react';
import { memo, useMemo, isValidElement, Fragment } from 'react';

import { useTranslation } from 'react-i18next';
import { useMeasure } from 'react-use';

import { BackLink, ActionsMenu, GroupNavigation } from './components';
import { HeaderButtons } from './components/HeaderButtons';
import { BREAKPOINT_WIDTH } from './constant';
import {
    HeaderWrapper,
    VerticalDivider,
    BulkContentWrapper,
    ActionsWrapper,
    TitleWrapper,
    ItemContentWrapper,
    SearchWrapper,
} from './ContentHeader.styled';
import type { ContentHeaderType } from './types';
import { ContentItemsStyleType } from './types';
import { numberWithCommas } from '../../helpers/string';
import { i18next } from '../../services/translate';
import BulkEditPopper from '../BulkEditPopper';
import { SearchInput } from '../Inputs/SearchInput';

const ContentHeader: FC<ContentHeaderType> = ({
    backTitle,
    backLink,
    backComponent,
    backOnClick,
    contentItems,
    contentItemsStyleType = ContentItemsStyleType.ITEM,
    currentContentItem,
    onContentItemsChange,
    actions,
    buttons,
    disabled = false,
    search,
    searchComponent,
    noResultsFoundText,
    accessibilityLabels,
}) => {
    const { t } = useTranslation(undefined, { i18n: i18next });
    const [ref, { width }] = useMeasure<HTMLDivElement>();

    const renderBackLink = useMemo(() => {
        if (backTitle && (backLink || backOnClick)) {
            return (
                <BackLink
                    href={backLink}
                    title={backTitle}
                    component={backComponent}
                    onClick={backOnClick}
                    showTitle={width > BREAKPOINT_WIDTH}
                />
            );
        }

        return null;
    }, [backTitle, backLink, backComponent, backOnClick, width]);

    const renderContentItems = useMemo(() => {
        if (typeof contentItems === 'string') {
            return (
                <Fragment>
                    <VerticalDivider width={width} />
                    <ItemContentWrapper type={contentItemsStyleType}>
                        {contentItems}
                    </ItemContentWrapper>
                </Fragment>
            );
        } else if (Array.isArray(contentItems)) {
            return (
                <Fragment>
                    <VerticalDivider width={width} />
                    <BulkContentWrapper>
                        <BulkEditPopper
                            names={contentItems}
                            renderLabel={(count: number) =>
                                numberWithCommas(count) +
                                ' ' +
                                t('GENERICS.LABELS.SELECTED')
                            }
                            disabled={disabled}
                        />
                    </BulkContentWrapper>
                </Fragment>
            );
        } else if (
            contentItems?.items?.length &&
            currentContentItem &&
            onContentItemsChange
        ) {
            return (
                <GroupNavigation
                    {...{
                        groupItems: contentItems,
                        currentEntityId: currentContentItem,
                        disabled,
                        width,
                        onChange: onContentItemsChange,
                        noResultsFoundText,
                    }}
                />
            );
        }

        return null;
    }, [
        contentItems,
        currentContentItem,
        onContentItemsChange,
        width,
        contentItemsStyleType,
        disabled,
        noResultsFoundText,
        t,
    ]);

    const renderSearch = useMemo(() => {
        if (isValidElement(searchComponent)) {
            return searchComponent;
        }

        if (search) {
            return (
                <SearchWrapper>
                    <SearchInput {...search} />
                </SearchWrapper>
            );
        }

        return null;
    }, [search, searchComponent]);

    const renderButtons = useMemo(() => {
        if (buttons?.length) {
            return <HeaderButtons {...{ items: buttons, disabled }} />;
        }

        return null;
    }, [buttons, disabled]);

    const renderActionsMenu = useMemo(() => {
        if (actions?.length) {
            return (
                <ActionsMenu
                    {...{
                        actions,
                        disabled,
                        accessibilityLabels: accessibilityLabels?.actionsMenu,
                    }}
                />
            );
        }

        return null;
    }, [actions, disabled]);

    return (
        <HeaderWrapper {...{ ref, width }}>
            <TitleWrapper>
                {renderBackLink}
                {renderContentItems}
            </TitleWrapper>
            {renderSearch}
            <ActionsWrapper>
                {renderButtons}
                {Boolean(buttons?.length) && Boolean(actions?.length) && (
                    <VerticalDivider width={width} />
                )}
                {renderActionsMenu}
            </ActionsWrapper>
        </HeaderWrapper>
    );
};

export default memo(ContentHeader);
