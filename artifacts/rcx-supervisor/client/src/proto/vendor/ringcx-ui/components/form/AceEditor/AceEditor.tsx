import { forwardRef } from 'react';

import type AceEditor from 'react-ace';
import { useTranslation } from 'react-i18next';

import { StyledAceEditor } from './AceEditorBase.styled';
import type { IEditor } from './type';
import { i18next } from '../../../services/translate';

const Editor = forwardRef<Nullable<AceEditor>, IEditor>(
    ({ onChange, mode, error, ...restProps }: IEditor, ref) => {
        const { t } = useTranslation(undefined, { i18n: i18next });

        return (
            <StyledAceEditor
                {...{
                    style: { height: '100%', width: '100%' },
                    mode: mode,
                    editorTheme: 'xcode',
                    onChange: onChange,
                    editorProps: {
                        $blockScrolling: true,
                    },
                    setOptions: {
                        enableLiveAutocompletion: true,
                    },
                    onLoad: (editor) => {
                        editor.container
                            .querySelector('.ace_text-input')
                            ?.setAttribute(
                                'aria-label',
                                t('ARIA_LABELS.JAVASCRIPT_EDITOR')
                            );
                    },
                    ...restProps,
                    ref,
                }}
            />
        );
    }
);

export default Editor;
