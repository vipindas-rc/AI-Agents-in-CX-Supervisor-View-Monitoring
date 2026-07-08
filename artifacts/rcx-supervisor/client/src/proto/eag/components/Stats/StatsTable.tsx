import { useState, useRef, type FC, useLayoutEffect, useMemo } from 'react';
import * as React from 'react';

import { DateTime } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import { StatsTableColumnType } from './constant';
import { useStatsTable } from './hooks/useStatsTable';
import { useSyncScroll } from './hooks/useSyncScroll';
import { SortIcon } from './SortIcon';
import {
    TableContainer,
    TableScrollableContainer,
    TableFixedColumn,
    TableSection,
    TableRow,
    TableCell,
    CellText,
    TableScrollableColumns,
    EclipseCellText,
    SortIconButton,
} from './StatsTable.styled';
import type {
    TableData,
    StatsTableProps,
    StatsTableColumn,
} from './types/Stats';

const FIXED_COLUMN_WIDTH = 130;

const secondsToDuration = (seconds: number) => {
    const duration = DateTime.Duration.fromMillis(seconds * 1000);
    return duration.toFormat(DateTime.DURATION_FORMAT.TIME_WITH_SECONDS);
};

export const StatsTable: FC<StatsTableProps> = ({ metric }) => {
    const { t } = useTranslation();
    const tableHeaderRef = useSyncScroll();
    const scrollableTableRef = useSyncScroll();
    const tableFooterRef = useSyncScroll();
    const {
        tableData,
        fixedColumn,
        scrollColumns,
        handleSort,
        sortOption,
        totals,
    } = useStatsTable(metric);
    const headerColumnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        {}
    );
    const [rowWidth, setRowWidth] = useState<number>(0);
    const fixedRowWidth = useMemo(() => {
        return rowWidth + (fixedColumn ? FIXED_COLUMN_WIDTH : 0);
    }, [fixedColumn, rowWidth]);
    useLayoutEffect(() => {
        const newWidths: Record<string, number> = {};
        let newRowWidth = 0;
        headerColumnRefs.current.forEach((node, field) => {
            if (node) {
                newWidths[field] = node.offsetWidth;
                newRowWidth += node.offsetWidth;
            }
        });
        setColumnWidths(newWidths);
        setRowWidth(newRowWidth);
    }, [headerColumnRefs.current.size]);
    const isHeaderMeasured = React.useMemo(() => {
        return Object.keys(columnWidths).length === scrollColumns.length;
    }, [columnWidths, scrollColumns]);

    const renderCellValue = (row: TableData, column: StatsTableColumn) => {
        if (column.calCellValue) {
            return column.calCellValue(row);
        }
        return calResult(row[column.field], column.type);
    };
    const calResult = (result: string | number, type: StatsTableColumnType) => {
        if (result === undefined) {
            return '';
        }
        if (typeof result === 'string') {
            result = Number(result);
        }
        switch (type) {
            case StatsTableColumnType.DURATION:
                return secondsToDuration(result);
            case StatsTableColumnType.PERCENT:
                return `${result}%`;
            default:
                return result;
        }
    };
    const headerRef = (field: string) => (node: HTMLDivElement) => {
        if (node) {
            headerColumnRefs.current.set(field, node);
        } else {
            headerColumnRefs.current.delete(field);
        }
    };

    return (
        (fixedColumn !== null || scrollColumns.length > 0) && (
            <React.Fragment>
                <TableSection $isHeader ref={tableHeaderRef}>
                    <TableRow $width={fixedRowWidth}>
                        {fixedColumn && (
                            <TableFixedColumn $isHeader>
                                <EclipseCellText
                                    tooltipMsg={t(fixedColumn.displayName)}
                                >
                                    {t(fixedColumn.displayName)}
                                </EclipseCellText>
                            </TableFixedColumn>
                        )}
                        <TableScrollableColumns>
                            {scrollColumns.map((column) => {
                                return (
                                    <TableCell
                                        key={column.field}
                                        $isHeader
                                        ref={headerRef(column.field)}
                                    >
                                        <EclipseCellText
                                            tooltipMsg={t(column.displayName)}
                                        >
                                            {t(column.displayName)}
                                        </EclipseCellText>
                                        <SortIconButton
                                            onClick={() =>
                                                handleSort(column.field)
                                            }
                                            aria-label={t(column.displayName)}
                                        >
                                            <SortIcon
                                                direction={
                                                    sortOption?.field ===
                                                    column.field
                                                        ? sortOption.direction
                                                        : null
                                                }
                                            />
                                        </SortIconButton>
                                    </TableCell>
                                );
                            })}
                        </TableScrollableColumns>
                    </TableRow>
                </TableSection>

                {isHeaderMeasured && (
                    <TableContainer>
                        {fixedColumn && (
                            <TableScrollableContainer>
                                {tableData.map((row: any, index: number) => (
                                    <TableFixedColumn key={index} $isData>
                                        <EclipseCellText
                                            tooltipMsg={
                                                fixedColumn.calCellValue
                                                    ? fixedColumn.calCellValue(
                                                          row
                                                      )
                                                    : row[fixedColumn.field]
                                            }
                                        >
                                            {renderCellValue(row, fixedColumn)}
                                        </EclipseCellText>
                                    </TableFixedColumn>
                                ))}
                            </TableScrollableContainer>
                        )}

                        <TableScrollableContainer
                            $isMainBody
                            ref={scrollableTableRef}
                        >
                            {tableData.map((row, index) => (
                                <TableRow key={index} $width={rowWidth}>
                                    {scrollColumns.map((column) => {
                                        return (
                                            <TableCell
                                                key={column.field}
                                                $isData
                                                $columnWidth={
                                                    columnWidths[column.field]
                                                }
                                            >
                                                <CellText>
                                                    {renderCellValue(
                                                        row,
                                                        column
                                                    )}
                                                </CellText>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableScrollableContainer>
                    </TableContainer>
                )}

                {isHeaderMeasured && tableData.length > 0 && (
                    <TableSection $isFooter ref={tableFooterRef}>
                        <TableRow $width={fixedRowWidth}>
                            {fixedColumn && (
                                <TableFixedColumn $isFooter>
                                    <EclipseCellText
                                        tooltipMsg={t(
                                            'REALTIME_REPORTING.TOTALS'
                                        )}
                                    >
                                        {t('REALTIME_REPORTING.TOTALS')}
                                    </EclipseCellText>
                                </TableFixedColumn>
                            )}

                            <TableScrollableColumns>
                                {scrollColumns.map((column) => {
                                    return (
                                        <TableCell
                                            key={column.field}
                                            $columnWidth={
                                                columnWidths[column.field]
                                            }
                                        >
                                            <CellText>
                                                {calResult(
                                                    totals[column.field],
                                                    column.type
                                                )}
                                            </CellText>
                                        </TableCell>
                                    );
                                })}
                            </TableScrollableColumns>
                        </TableRow>
                    </TableSection>
                )}
            </React.Fragment>
        )
    );
};
