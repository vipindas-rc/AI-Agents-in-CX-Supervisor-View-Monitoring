import type { FC } from 'react';
import { useCallback } from 'react';

import { Clipboard } from '@ringcx/ui';

import type { ICallId } from './types/CopyId';
import {
    CopyButton,
    CopyButtonLink,
    CopyButtonLinkWrapper,
} from './types/CopyId.styled';
import { COPY_BUTTON_ID } from '../../constants/testIds';
import translate from '../../helpers/translate';

export const CopyID: FC<ICallId> = ({ idToCopy, confirmationFunction }) => {
    const copyCallIdText = translate(
        'SOFTPHONE.CALL_CONTROL_HELP.COPY_CALL_ID'
    );
    const copyId = useCallback(
        async (copy: (text: string) => Promise<boolean>) => {
            const isCopySuccess = await copy(idToCopy);

            if (isCopySuccess) {
                confirmationFunction();
            }
        },
        []
    );
    return (
        <Clipboard>
            {(copy) => (
                <CopyButton
                    data-aid={COPY_BUTTON_ID}
                    onClick={() => copyId(copy)}
                >
                    <CopyButtonLinkWrapper>
                        <CopyButtonLink id='copyCallId'>
                            {copyCallIdText}
                        </CopyButtonLink>
                    </CopyButtonLinkWrapper>
                </CopyButton>
            )}
        </Clipboard>
    );
};
