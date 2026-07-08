import type { FC } from 'react';
import { useMemo } from 'react';

import { LinkButton, Play } from '@ringcx/ui';

import {
    DataPairsStyled,
    LabelStyled,
    ValueStyled,
    StyledAudioPlayerPopover,
} from './DataPairs.styled';
import type { IDataPairs } from './types/DataPairs';
import translate, { userLocale } from '../../helpers/translate';

export const DataPairs: FC<IDataPairs> = ({ label, value = '' }) => {
    const voicemailLabelValue = translate('CURRENT_CALL.VOICEMAIL_URL');
    const isValidValue = typeof value === 'string' || value instanceof String;

    const isVruV1 = (input: string) =>
        input.indexOf('bucket') > -1 &&
        input.indexOf('region') > -1 &&
        input.indexOf('v1') > -1;

    const isVruV2 = (input: string) =>
        input.indexOf('/assets/') > -1 &&
        input.indexOf('/dialogs/') > -1 &&
        input.indexOf('/segments/') > -1 &&
        input.indexOf('/type') > -1;

    const getDecodedFileUrl = (input: string) => {
        const match = input.match(/[?&]fileUrl=([^&]+)/);
        if (!match) {
            return null;
        }
        try {
            return decodeURIComponent(match[1]);
        } catch (error) {
            return match[1];
        }
    };

    const isRecording = () => {
        if (!isValidValue) {
            return false;
        }
        const stringValue = value + '';
        if (isVruV1(stringValue) || isVruV2(stringValue)) {
            return true;
        }
        const decodedFileUrl = getDecodedFileUrl(stringValue);
        return (
            !!decodedFileUrl &&
            (isVruV1(decodedFileUrl) || isVruV2(decodedFileUrl))
        );
    };

    const isVoicemail = () => {
        return label === voicemailLabelValue;
    };

    const playAudioBtn = (
        <LinkButton
            title={translate('GENERICS.LABELS.PLAY_RECORDING')}
            icon={<Play />}
        />
    );

    const dataPairsValue = useMemo(
        () =>
            isRecording() || isVoicemail() ? (
                <StyledAudioPlayerPopover
                    audioSrc={value}
                    toggleComponent={playAudioBtn}
                />
            ) : (
                <ValueStyled data-aid={`${label}-value`}>
                    {value !== undefined && value !== null && value + ''}
                </ValueStyled>
            ),
        [label, value, isRecording, isVoicemail, playAudioBtn]
    );

    return (
        <DataPairsStyled>
            <LabelStyled data-aid={`${label}-label`} lang={userLocale}>
                {label}
            </LabelStyled>
            {dataPairsValue}
        </DataPairsStyled>
    );
};
