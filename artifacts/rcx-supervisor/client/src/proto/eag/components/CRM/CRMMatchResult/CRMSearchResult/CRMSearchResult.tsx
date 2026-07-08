import type { FC } from 'react';
import { useCallback } from 'react';

import { CheckCircle } from '@material-ui/icons';
import { Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';
import { styled } from 'styled-components';

import {
    CRMSearchResultToggleExpand,
    CRMSearchResultWrapper,
    ArrowTop,
    CRMSearchResultList,
    CRMSearchResultListInner,
    CRMSearchResultListItem,
    CRMSearchResultListItemText,
    CRMSearchResultListItemButton,
} from './CRMSearchResult.styled';
import HyperlinkIcon from '../../../HyperlinkIcon';
import type { MatchItem, CRMSearchResultProps } from '../../types';
import { CRMSearchResultListItemTypedIcon } from '../styled';

const CheckCircleStyled = styled(CheckCircle)`
    color: ${({ theme }) => theme.colors.accent.emerald};
    position: absolute;
    bottom: -4px;
    right: -4px;
    font-size: 14px;
    background-color: white;
    border-radius: 50%;
`;

const CRMSearchResultListIconContainer = styled.span`
    height: 22px;
    position: relative;
    margin-right: 8px;
`;

const CRMSearchResultListIcon: FC<any> = ({ children, selected, ...props }) => {
    return (
        <CRMSearchResultListIconContainer {...props}>
            {children}
            {selected && <CheckCircleStyled />}
        </CRMSearchResultListIconContainer>
    );
};

const CRMSearchResult: FC<
    Omit<CRMSearchResultProps, 'selectedItem' | 'handleSelect'> & {
        selectedItems: MatchItem[];
        handleMultiSelect: (selectedItems: MatchItem[]) => void;
        platFormTranslateKey?: string;
    }
> = ({
    CrmSvc,
    title,
    itemList,
    selectedItems,
    isExpanded,
    toggleDataAid,
    resultDataAid,
    handleMultiSelect,
    handleExpanded,
    iconCreator,
    platFormTranslateKey,
}) => {
    const onHandleSelect = useCallback(
        (item: MatchItem) => {
            const index = selectedItems.findIndex((t) => t.id === item.id);
            if (index > -1) {
                selectedItems.splice(index, 1);
                handleMultiSelect([...selectedItems]);
            } else {
                handleMultiSelect([item].concat(selectedItems));
            }
        },
        [handleMultiSelect, selectedItems]
    );

    const renderIcon = (item: MatchItem) => {
        if (iconCreator) {
            return (
                <CRMSearchResultListItemTypedIcon>
                    {iconCreator?.(item)}
                </CRMSearchResultListItemTypedIcon>
            );
        }
    };

    const { t } = useTranslation();

    return (
        <CRMSearchResultWrapper>
            <CRMSearchResultToggleExpand
                onClick={() => handleExpanded(!isExpanded)}
                data-aid={toggleDataAid}
            >
                {title}
                <ArrowTop $expanded={isExpanded} />
            </CRMSearchResultToggleExpand>
            <CRMSearchResultList $expanded={isExpanded}>
                <CRMSearchResultListInner
                    data-aid={resultDataAid}
                    aria-live='polite'
                    aria-atomic='true'
                    aria-label={title}
                >
                    {itemList.map((item, index) => (
                        <CRMSearchResultListItem key={item.id}>
                            <CRMSearchResultListItemButton
                                onClick={() => {
                                    onHandleSelect(item);
                                }}
                            >
                                <CRMSearchResultListIcon
                                    aria-hidden='true'
                                    selected={
                                        selectedItems.findIndex(
                                            (t) => t.id === item.id
                                        ) > -1
                                    }
                                    data-aid={`${resultDataAid}_${
                                        index + 1
                                    }_icon`}
                                >
                                    {renderIcon(item)}
                                </CRMSearchResultListIcon>
                                <CRMSearchResultListItemText
                                    data-aid={`${resultDataAid}_${index + 1}`}
                                >
                                    <Tooltip title={item.name}>
                                        <span>{item.name}</span>
                                    </Tooltip>
                                </CRMSearchResultListItemText>
                            </CRMSearchResultListItemButton>
                            <HyperlinkIcon
                                CrmSvc={CrmSvc}
                                title={t(
                                    `CRM.${platFormTranslateKey}.VIEW_RECORD` ||
                                        'open_in_crm'
                                )}
                                dataAid={`${resultDataAid}_${
                                    index + 1
                                }_view_in_crm`}
                                item={item}
                            />
                        </CRMSearchResultListItem>
                    ))}
                </CRMSearchResultListInner>
            </CRMSearchResultList>
        </CRMSearchResultWrapper>
    );
};

export default CRMSearchResult;
