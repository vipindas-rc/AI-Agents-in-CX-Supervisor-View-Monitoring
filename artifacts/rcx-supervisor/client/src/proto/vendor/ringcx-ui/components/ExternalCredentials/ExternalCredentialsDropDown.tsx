import { forwardRef, useCallback, useState } from 'react';

import { saveExtCredential, type IAccountExtCredential } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import {
    ExtCredentialsWrapper,
    FlexRow,
    StyleButton,
} from './ExternalCredentialsDropDown.styled';
import { clearExtCredential } from './helpers';
import { useSaveExtCredentialModal } from './hooks/externalCredentials.modals';
import type { ExternalCredentialsDropDownProps } from './types';
import { TEST_AID } from '../../constants';
import { i18next } from '../../services/translate';
import { Autocomplete } from '../Autocomplete';

export const ExternalCredentialsDropDown = forwardRef<
    HTMLInputElement,
    ExternalCredentialsDropDownProps
>(
    (
        {
            accountId,
            loading,
            afterCreated,
            dataAid,
            showMessages,
            disabled,
            showCreateButton = true,
            i18n = i18next,
            ...props
        },
        ref
    ) => {
        const { t } = useTranslation(undefined, { i18n });
        const [refreshing, setRefreshing] = useState(false);

        const saveData = useCallback(
            async (credential: IAccountExtCredential) => {
                const extCredential = clearExtCredential(credential);
                if (!accountId) return;
                setRefreshing(true);

                try {
                    await saveExtCredential(accountId, extCredential);
                    showMessages?.success(
                        t('EXTERNAL_CREDENTIALS.MESSAGES.ADD_SUCCESS')
                    );
                    afterCreated && afterCreated(true);
                } catch (e) {
                    showMessages?.error(
                        t('EXTERNAL_CREDENTIALS.MESSAGES.ADD_ERROR')
                    );
                } finally {
                    setRefreshing(false);
                }
            },
            [accountId, afterCreated, showMessages, t]
        );

        const { renderSaveModal, showSaveModal } = useSaveExtCredentialModal({
            onSubmit: saveData,
        });

        return (
            <FlexRow>
                <ExtCredentialsWrapper>
                    <FlexRow>
                        <Autocomplete
                            {...props}
                            loading={loading || refreshing}
                            disabled={disabled}
                            disableClearable={false}
                            data-aid={dataAid}
                            ref={ref}
                        />
                    </FlexRow>
                    {showCreateButton && (
                        <StyleButton
                            disabled={disabled}
                            style={{ height: '32px', fontSize: '14px' }}
                            variant='outlined'
                            onClick={() => showSaveModal()}
                            data-aid={TEST_AID.EXTERNAL_CREDENTIALS_ADD_BUTTON}
                        >
                            {t('EXTERNAL_CREDENTIALS.NEW')}
                        </StyleButton>
                    )}
                </ExtCredentialsWrapper>
                {showCreateButton && renderSaveModal}
            </FlexRow>
        );
    }
);
