import type { PropsWithChildren } from 'react';
import { Fragment, memo, useCallback, useMemo } from 'react';

import type { FieldValues } from 'react-hook-form';

import { Row, AddVariableButton } from './components';
import type { VariablesListProps } from './types';
import { HeaderText, TableHeader, TableRow } from './VariablesList.styled';
import { i18next } from '../../services/translate';

function VariablesList<T extends FieldValues>({
    columns,
    name,
    buttons,
    fieldsArray,
    dataAids,
    control,
    i18n = i18next,
    labelTextDictionary,
}: PropsWithChildren<VariablesListProps<T>>) {
    const { fields, append } = fieldsArray;

    const renderRow = useCallback(
        (props: { index: number; id: string }) => {
            return (
                <Row
                    {...props}
                    columns={columns}
                    buttons={buttons}
                    name={name}
                    labelTextDictionary={labelTextDictionary}
                    {...(control && { control })}
                />
            );
        },
        [buttons, columns, control, name, labelTextDictionary]
    );

    const handleAddVariable = useCallback(() => {
        const newVariable = columns.map(({ id }) => [id, '']);
        append(Object.fromEntries(newVariable));
    }, [append, columns]);

    const data = useMemo(
        () => fields.map((field, index) => ({ ...field, index })),
        [fields]
    );

    return (
        <Fragment>
            <TableHeader>
                {columns.map(({ id, content }) => (
                    <HeaderText key={id}>{content}</HeaderText>
                ))}
            </TableHeader>
            {data.map((row) => (
                <TableRow data-aid={dataAids?.row} key={row.id}>
                    {renderRow(row)}
                </TableRow>
            ))}
            <AddVariableButton
                dataAid={dataAids?.button}
                i18n={i18n}
                onClick={handleAddVariable}
            />
        </Fragment>
    );
}

export default memo(VariablesList);
