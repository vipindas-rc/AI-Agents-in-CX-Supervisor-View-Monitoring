import type { FC, MouseEvent } from 'react';
import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
    forwardRef,
} from 'react';

import { IconButton, Restart, Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import {
    CRMSearchDetailWrapper,
    CRMSearchDetailHeader,
    CRMSearchDetailHeaderLeft,
    CRMSearchDetailHeaderRight,
    CRMSearchDetailBackIcon,
    CRMSearchDetailBody,
    CRMSearchDetailMenu,
    CRMSearchDetailMenuBtn,
    CRMSearchDetailMenuItem,
    CRMSearchResultEmpty,
    CRMSearchResultBothEmpty,
    StyledTooltip,
    CRMSearchDetailMenuItemWrapper,
} from './CRMSearchDetail.styled';
import { ParamsType } from '../../../../constants/crm';
import {
    CRM_TOGGLE_MATCHED_RECORD,
    CRM_TOGGLE_SEARCHED_RECORD,
    CRM_MATCHED_RECORD_RESULT,
    CRM_SEARCHED_RECORD_RESULT,
    CRM_CREATE_MENU_ITEM,
    CRM_CREATE_ICON,
    CRM_SELECTED_TAG,
    CRM_CLOSE_SEARCH_DETAIL_PAGE,
    CRM_SEARCH_DETAIL_WRAPPER,
} from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import { StyledTag } from '../../../StyledTag';
import {
    CAMEL_CASE_SPLIT_REGEX,
    DataTrackingEventNames,
} from '../../constants';
import CRMSearchBar from '../../CRMMatchResult/CRMSearchBar/CRMSearchBar';
import type {
    ICreateFieldsProps,
    ICRMSearchDetailProps,
    MatchItem,
    MenuItemWithTooltipProps,
} from '../../types';
import CRMSearchResult from '../CRMSearchResult/CRMSearchResult';
import {
    CRMSearchDetailHeaderLeftExtra,
    StyledTagBox,
    CRMSearchResultListItemTypedIcon,
} from '../styled';

const MenuItemWithTooltip = forwardRef<HTMLLIElement, MenuItemWithTooltipProps>(
    ({ field, onClick, dataAid, disabled, ...restProps }, ref) => {
        const { t } = useTranslation();
        const menuItemContent = t('CRM.COMMON.NEW_FIELD', {
            field: field.label
                .split(CAMEL_CASE_SPLIT_REGEX)
                .join(' ')
                .toLowerCase(),
        });

        const isDisabled = field.disabled || disabled;

        const menuItem = (
            <CRMSearchDetailMenuItem
                data-aid={dataAid}
                ref={ref}
                onClick={onClick}
                disabled={isDisabled}
                {...restProps}
            >
                {menuItemContent}
            </CRMSearchDetailMenuItem>
        );

        if (!field.tooltipText) {
            return menuItem;
        }

        return (
            <StyledTooltip title={field.tooltipText}>
                <CRMSearchDetailMenuItemWrapper>
                    {menuItem}
                </CRMSearchDetailMenuItemWrapper>
            </StyledTooltip>
        );
    }
);

export const CRMSearchDetail: FC<ICRMSearchDetailProps> = ({
    CrmSvc,
    show,
    createFields,
    matchedItem,
    matchedList,
    handleMultiSelect,
    selectedItems,
    CRMPlatform,
    handleClose,
    handleCreate,
    iconCreator,
    platFormTranslateKey,
    type,
    searchValidation,
    engageType,
    formDataKey,
    uii,
    reloadMatchedList,
}) => {
    const growl = injector('growl');
    const AnalyticsSvc = injector('AnalyticsSvc');
    const [searchedList, setSearchedList] = useState([]);
    const lastSearchTime = useRef(0);
    const [isMatchedListExpanded, setIsMatchedListExpanded] =
        useState<boolean>(false);

    const [isSearchedListExpanded, setIsSearchedListExpanded] =
        useState<boolean>(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { t } = useTranslation();

    const matchTypeExtra = useMemo(() => {
        return `(${t('CRM.COMMON.SELECTED_TEXT', {
            count: selectedItems.length,
        })})`;
    }, [selectedItems]);
    const searchPlaceHolder = useMemo(() => {
        const translated_fields = createFields.map(
            (field: ICreateFieldsProps) => {
                return t(
                    field.label ||
                        field.labelTranslateKey ||
                        `CRM.${platFormTranslateKey}.FIELD.${field.type.toUpperCase()}`
                ).toLowerCase();
            }
        );

        return `${t('GENERICS.ACTIONS.SEARCH_P')} ${translated_fields.join(
            '/'
        )}`;
    }, []);
    const matchedListTitle = useMemo(() => {
        return `${t('CRM.COMMON.MATCHED')} (${matchedList.length})`;
    }, [matchedList]);

    const searchedListTitle = useMemo(() => {
        return `${t('CRM.COMMON.FOUND_IN', {
            platform: `${CRMPlatform} (${searchedList.length})`,
        })}`;
    }, [CRMPlatform, searchedList]);

    const createFieldsInMenu = useMemo(() => {
        return createFields.filter((field) => !field.excludeFromCreateMenu);
    }, [createFields]);

    useEffect(() => {
        !!matchedList.length && setIsMatchedListExpanded(true);
    }, [matchedList]);

    useEffect(() => {
        if (engageType && formDataKey) {
            const event =
                engageType.toLowerCase() === ParamsType.DIGITAL.toLowerCase()
                    ? DataTrackingEventNames.ViewedRCXDigitalMatchItemMatchPage
                    : DataTrackingEventNames.ViewedRCXVoiceMatchItemMatchPage;
            AnalyticsSvc.track(event, {
                itemName: formDataKey,
            });
        }
    }, [engageType, formDataKey]);

    const handleClickMenu = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        []
    );

    const handleReloadMatchedList = useCallback(() => {
        if (reloadMatchedList) {
            reloadMatchedList();
        }
    }, [reloadMatchedList]);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const searchWordValid = (word?: string) => {
        if (searchValidation) {
            return searchValidation(word);
        }

        if (word && word.length <= 1) {
            growl.warning('CRM.COMMON.SEARCH_WARNING');
            return false;
        }
        return true;
    };
    const handleSearch = async (keyword?: string) => {
        const cleanedKeyword = keyword?.trim();

        if (!searchWordValid(cleanedKeyword)) {
            return;
        }

        if (cleanedKeyword) {
            // https://developers.hubspot.com/docs/api/usage-details
            // The Search API endpoints are rate limited to four requests per second per authentication token.
            if (Date.now() - lastSearchTime.current <= 1000) {
                return;
            }

            lastSearchTime.current = Date.now();

            const searchParams: {
                value: string;
                type?: string;
                engageType?: string;
                uii?: string;
            } = {
                value: cleanedKeyword,
                engageType,
                uii,
            };

            if (typeof type === 'string') {
                searchParams['type'] = type;
            }

            const result = await CrmSvc.searchContacts(searchParams);
            result.records = result.records.map((item: MatchItem) => ({
                ...item,
                isSearchedResult: true,
            }));
            setSearchedList(result.records);
            setIsSearchedListExpanded(true);
            setIsMatchedListExpanded(false);
        } else {
            setSearchedList([]);
            getFilterSelectItems();
        }
    };

    const getFilterSelectItems = () => {
        !searchedList.length &&
            handleMultiSelect(
                selectedItems.filter(
                    (item) =>
                        matchedList.findIndex((t) => t.id === item.id) > -1
                )
            );
    };
    const handleCloseTag = (item: MatchItem) => {
        selectedItems.splice(
            selectedItems.findIndex((t) => t.id === item.id),
            1
        );
        handleMultiSelect([...selectedItems]);
    };

    useEffect(() => {
        // add matched item to selected items
        if (matchedItem) {
            const isExist = selectedItems.some(
                (item) => item.id === matchedItem.id
            );
            if (
                !isExist &&
                matchedItem.id !== '' &&
                typeof matchedItem.id !== 'undefined'
            ) {
                handleMultiSelect([...selectedItems, matchedItem]);
            }
        }
    }, []);

    return (
        <CRMSearchDetailWrapper
            $show={show}
            className='crm-search-detail-wrapper'
            data-aid={CRM_SEARCH_DETAIL_WRAPPER}
            role='dialog'
        >
            <CRMSearchDetailHeader>
                <CRMSearchDetailHeaderLeft
                    data-aid={CRM_CLOSE_SEARCH_DETAIL_PAGE}
                    onClick={handleClose}
                >
                    <CRMSearchDetailBackIcon />
                    {t(
                        `CRM.${platFormTranslateKey}.${
                            type === 'name' ? 'NAME' : 'RELATED_TO'
                        }`
                    )}
                    <CRMSearchDetailHeaderLeftExtra>
                        {matchTypeExtra}
                    </CRMSearchDetailHeaderLeftExtra>
                </CRMSearchDetailHeaderLeft>
                <CRMSearchDetailHeaderRight>
                    {reloadMatchedList && (
                        <Tooltip title={t('CRM.COMMON.RELOAD')}>
                            <IconButton
                                onClick={handleReloadMatchedList}
                                disableRipple={true}
                                size='small'
                            >
                                <Restart />
                            </IconButton>
                        </Tooltip>
                    )}
                    {createFieldsInMenu.length > 0 && (
                        <CRMSearchDetailMenuBtn
                            onClick={handleClickMenu}
                            data-aid={CRM_CREATE_ICON}
                            aria-label={t(
                                'CONTACT_MANAGEMENT.CONTACT_PROFILE.CREATE_NEW'
                            )}
                        >
                            +
                        </CRMSearchDetailMenuBtn>
                    )}
                    <CRMSearchDetailMenu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleCloseMenu}
                    >
                        {createFieldsInMenu.map((field: ICreateFieldsProps) => (
                            <MenuItemWithTooltip
                                key={field.label}
                                field={field}
                                dataAid={CRM_CREATE_MENU_ITEM}
                                disabled={field.disabled}
                                onClick={() => {
                                    handleCloseMenu();
                                    handleCreate(field.type);
                                }}
                            />
                        ))}
                    </CRMSearchDetailMenu>
                </CRMSearchDetailHeaderRight>
            </CRMSearchDetailHeader>
            <CRMSearchDetailBody>
                <CRMSearchBar
                    placeholder={searchPlaceHolder}
                    handleSearch={handleSearch}
                ></CRMSearchBar>
                <StyledTagBox>
                    {selectedItems?.map((t) => (
                        <StyledTag
                            className='style-tag'
                            outline
                            key={t.id}
                            onClose={() => handleCloseTag(t)}
                            data-aid={CRM_SELECTED_TAG}
                        >
                            {t.type && iconCreator && (
                                <CRMSearchResultListItemTypedIcon>
                                    {iconCreator(t)}
                                </CRMSearchResultListItemTypedIcon>
                            )}
                            <span className='tag-name'>{t.name}</span>
                        </StyledTag>
                    ))}
                </StyledTagBox>

                <CRMSearchResult
                    CrmSvc={CrmSvc}
                    isExpanded={isMatchedListExpanded}
                    title={matchedListTitle}
                    itemList={matchedList}
                    selectedItems={selectedItems}
                    handleMultiSelect={handleMultiSelect}
                    handleExpanded={setIsMatchedListExpanded}
                    iconCreator={iconCreator}
                    toggleDataAid={CRM_TOGGLE_MATCHED_RECORD}
                    resultDataAid={CRM_MATCHED_RECORD_RESULT}
                    platFormTranslateKey={platFormTranslateKey}
                ></CRMSearchResult>

                <CRMSearchResult
                    CrmSvc={CrmSvc}
                    isExpanded={isSearchedListExpanded}
                    title={searchedListTitle}
                    itemList={searchedList}
                    selectedItems={selectedItems}
                    handleMultiSelect={handleMultiSelect}
                    handleExpanded={setIsSearchedListExpanded}
                    iconCreator={iconCreator}
                    toggleDataAid={CRM_TOGGLE_SEARCHED_RECORD}
                    resultDataAid={CRM_SEARCHED_RECORD_RESULT}
                    platFormTranslateKey={platFormTranslateKey}
                ></CRMSearchResult>

                {isSearchedListExpanded && !searchedList.length && (
                    <CRMSearchResultEmpty>
                        {t('CRM.COMMON.NO_SEARCH_RESULT', {
                            platform: CRMPlatform,
                        })}
                    </CRMSearchResultEmpty>
                )}

                {!isSearchedListExpanded &&
                !matchedList.length &&
                !searchedList.length ? (
                    <CRMSearchResultBothEmpty>
                        {t('CRM.COMMON.NO_RESULT')}
                    </CRMSearchResultBothEmpty>
                ) : null}
            </CRMSearchDetailBody>
        </CRMSearchDetailWrapper>
    );
};
