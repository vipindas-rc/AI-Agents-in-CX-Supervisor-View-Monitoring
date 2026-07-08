import { Fragment, memo } from 'react';

import { Controller } from 'react-hook-form';

import type { VariableRow } from './types';
import { ButtonsWrapper } from '../..';
import type {
    RHFControllerRenderWithContent,
    RHFControllerRender,
} from '../../../../types';
import IconButton from '../../../IconButton';
import Tooltip from '../../../Tooltip';

function Row({
    columns,
    index,
    buttons,
    id,
    name,
    control,
    labelTextDictionary,
}: VariableRow) {
    const createRenderFunction = (
        columnId: string,
        render: RHFControllerRenderWithContent
    ): RHFControllerRender => {
        return ({ field, fieldState, formState }) => {
            const ariaLabel = labelTextDictionary?.[columnId];

            return render({
                field: {
                    ...field,
                    ...(ariaLabel && {
                        inputProps: {
                            'aria-label': ariaLabel,
                        },
                    }),
                },
                fieldState,
                formState,
            });
        };
    };

    return (
        <Fragment>
            {columns.map(({ id: columnId, render }) => (
                <Controller
                    key={columnId}
                    name={`${name}.${index}.${columnId}`}
                    render={createRenderFunction(columnId, render)}
                    {...(control && { control })}
                />
            ))}
            <ButtonsWrapper>
                {buttons.map(({ onClick, icon, tooltip }, buttonIndex) => (
                    <Tooltip title={tooltip ?? ''} key={`${id}.${buttonIndex}`}>
                        <IconButton onClick={() => onClick(index)}>
                            {icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </ButtonsWrapper>
        </Fragment>
    );
}

export default memo(Row);
