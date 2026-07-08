import type { FC } from 'react';
import { useCallback, useMemo } from 'react';

import {
    clearPhoneNumberFromSymbols,
    searchFiltration,
    AGENT_ASSIST_AI_FEATURES_FLAG,
} from '@ringcx/shared';
import type { FiltrationCallback, RenderRowGroupData } from '@ringcx/ui';
import { uniqBy } from 'lodash';

import { DigitalInteractionTableRow } from './components/DigitalInteractionTableRow';
import {
    StyledDigitalInteractionTable,
    EmptyResult,
    EmptyWrapper,
} from './DigitalInteractionTable.styled';
import type {
    IDigitalInteractionTable,
    InteractionData,
    InteractionSearchRowsType,
} from './types/DigitalInteractionTable';
import {
    interactionAgentNameCol,
    interactionChannelNameCol,
    interactionCategoryCol,
    interactionSearchColIndexes,
} from './types/DigitalInteractionTable';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import injector from '../../helpers/injector';
import translate from '../../helpers/translate';

function getCategoryNamesFromIds(categoryIds: string): string {
    if (!categoryIds) return '';

    try {
        const CategoriesService = injector('CategoriesSvc');
        if (!CategoriesService) return '';

        const categoriesMap = CategoriesService.getCategoriesMap();
        const categoryIdsArray = categoryIds
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);

        const categoryNames = categoryIdsArray
            .map((categoryId) => {
                const category = categoriesMap[categoryId];
                return category?.name || '';
            })
            .filter(Boolean)
            .join(', ');

        return categoryNames;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Error getting category names:', error);
        return '';
    }
}

export const DigitalInteractionTable: FC<IDigitalInteractionTable> = ({
    columns,
    digitalTaskList,
    monitorAgentCallback,
    monitoredAgent,
    viewInsight,
    loggedInAgentId,
    selectedIds,
    selectedChannels,
    selectedCategories = [],
    searchValue,
    shouldShowViewInsightsButton,
    AgentSvc,
    FeatureFlagsSvc,
    aiNotesFeatures,
    highlightAgentId,
    highlightNonce,
    selectedEngagementId,
}) => {
    const { digitalAgentEnabled } = AgentSvc;
    const isAIFeaturesEnabled =
        FeatureFlagsSvc.featureFlags[AGENT_ASSIST_AI_FEATURES_FLAG];

    const dataWithCategoryNames = useMemo(() => {
        return digitalTaskList.map((row) => ({
            ...row,
            categoryNames: getCategoryNamesFromIds(row.categoryIds),
        }));
    }, [digitalTaskList]);

    const visibleColumns = useMemo(
        () => columns.filter((col) => !col.hiddenColumn),
        [columns]
    );

    const filtrationCallback = useCallback<FiltrationCallback<InteractionData>>(
        (data) => {
            let filteredRows = searchFiltration<
                RenderRowGroupData<InteractionData, InteractionSearchRowsType>
            >(data, interactionAgentNameCol, selectedIds);
            filteredRows = searchFiltration<
                RenderRowGroupData<InteractionData, InteractionSearchRowsType>
            >(filteredRows, interactionChannelNameCol, selectedChannels);

            const hasCategoriesColumn = columns.some(
                (col) => col.id === 'categories'
            );
            if (hasCategoriesColumn) {
                filteredRows = searchFiltration<
                    RenderRowGroupData<
                        InteractionData,
                        InteractionSearchRowsType
                    >
                >(filteredRows, interactionCategoryCol, selectedCategories);
            }

            if (searchValue) {
                const searchIndexes = hasCategoriesColumn
                    ? interactionSearchColIndexes
                    : interactionSearchColIndexes.filter(
                          (index) => index[0] !== 'categoryNames'
                      );

                const searchedRows = searchFiltration<
                    RenderRowGroupData<
                        InteractionData,
                        InteractionSearchRowsType
                    >
                >(filteredRows, searchIndexes, searchValue);

                const clearedSearchValue =
                    clearPhoneNumberFromSymbols(searchValue);
                clearedSearchValue &&
                    searchedRows.push(
                        ...searchFiltration(
                            filteredRows,
                            [['contactIdentityE164']],
                            clearedSearchValue
                        )
                    );

                return [uniqBy(searchedRows, 'engagementId')];
            }
            return [filteredRows];
        },
        [
            selectedIds,
            selectedChannels,
            selectedCategories,
            searchValue,
            columns,
        ]
    );
    const renderEmptyFilterResult = useCallback(() => {
        return (
            <EmptyWrapper>
                <EmptyResult>
                    {translate('DASHBOARD.AGENTS.GRID.NO_MATCH_FOUND')}
                </EmptyResult>
            </EmptyWrapper>
        );
    }, [translate]);
    const renderRow = useCallback(
        (data: any) => (
            <DigitalInteractionTableRow
                {...{
                    data,
                    agentId: data.agentId,
                    monitorAgentCallback,
                    monitoredAgent,
                    viewInsight,
                    loggedInAgentId,
                    columns,
                    digitalAgentEnabled,
                    shouldShowViewInsightsButton,
                    isAIFeaturesEnabled,
                    aiNotesFeatures,
                    highlightAgentId,
                    highlightNonce,
                    selectedEngagementId,
                }}
            />
        ),
        [
            monitorAgentCallback,
            monitoredAgent,
            viewInsight,
            loggedInAgentId,
            columns,
            digitalAgentEnabled,
            aiNotesFeatures,
            highlightAgentId,
            highlightNonce,
            selectedEngagementId,
        ]
    );

    return digitalTaskList && digitalTaskList.length > 0 ? (
        <StyledDigitalInteractionTable<InteractionData>
            {...{
                columns: visibleColumns,
                data: dataWithCategoryNames,
                renderRow,
                renderEmptyFilterResult,
                filtrationCallback,
                listAriaLabel: `${translate('MONITORING.LABELS.ACTIVE_INTERACTIONS')}`,
            }}
        />
    ) : (
        <EmptyWrapper>
            <EmptyResult>
                {translate('CHAT.NO_CHATS.NO_INTERACTION_DG')}
            </EmptyResult>
        </EmptyWrapper>
    );
};

export default CreateAngularModule(
    'digitalInteractionTable',
    DigitalInteractionTable,
    [
        'columns',
        'digitalTaskList',
        'monitorAgentCallback',
        'monitoredAgent',
        'viewInsight',
        'shouldShowViewInsightsButton',
        'loggedInAgentId',
        'selectedIds',
        'selectedChannels',
        'selectedCategories',
        'searchValue',
        'aiNotesFeatures',
    ],
    ['AgentSvc', 'FeatureFlagsSvc']
);
