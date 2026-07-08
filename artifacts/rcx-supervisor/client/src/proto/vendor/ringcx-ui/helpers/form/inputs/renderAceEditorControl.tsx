import type { RefObject } from 'react';

import type AceEditor from 'react-ace';
import { type ControllerRenderProps } from 'react-hook-form';

import type { IEditor } from '../../../components/form/AceEditor';
import { StyledEditor } from '../../../components/form/AceEditor';
import type { RHFControllerRender } from '../../../types';

interface IRenderAceEditor {
    onChange?: ControllerRenderProps['onChange'];
    dataAid?: string;
    mode: IEditor['mode'];
    name?: string;
    ref?: RefObject<AceEditor>;
}
export function renderAceEditorControl({
    onChange,
    dataAid,
    mode,
    ref,
}: IRenderAceEditor): RHFControllerRender {
    return ({ field, fieldState, ...props }) => {
        return (
            <StyledEditor
                {...props}
                {...field}
                mode={mode}
                onChange={onChange ? onChange : field.onChange}
                data-aid={dataAid}
                ref={ref}
                error={!!fieldState.error}
            />
        );
    };
}
