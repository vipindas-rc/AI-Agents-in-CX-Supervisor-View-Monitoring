import * as React from 'react';
import { Fragment } from 'react';

import { useTranslation } from 'react-i18next';

import { Instruction } from './Instruction';
import { InstructionList } from './InstructionList';
import { MicrophoneAccessInstructionsContainer } from './MicrophoneAccessInstructions.styled';
import { SystemInstruction } from './SystemInstruction';

export const MicrophoneAccessInstructions = () => {
    const { t } = useTranslation();

    const instructions = [
        {
            title: 'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.TITLE',
            content: (
                <Fragment>
                    <InstructionList
                        instructions={[
                            'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.INSTRUCTIONS.STEP_1',
                            'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.INSTRUCTIONS.STEP_2',
                            'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.INSTRUCTIONS.STEP_3',
                        ]}
                        isNumeric={true}
                    />
                    {t(
                        'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.INSTRUCTIONS.ALTERNATE'
                    )}
                    <InstructionList
                        instructions={[
                            'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.INSTRUCTIONS.ALT_STEP_1',
                            'MICROPHONE_ACCESS_INSTRUCTIONS.BROWSER_PERMISSIONS.INSTRUCTIONS.ALT_STEP_2',
                        ]}
                        isNumeric={true}
                    />
                </Fragment>
            ),
        },
        {
            title: 'MICROPHONE_ACCESS_INSTRUCTIONS.SYSTEM_SETTINGS.TITLE',
            content: (
                <Fragment>
                    <SystemInstruction
                        content={[
                            'MICROPHONE_ACCESS_INSTRUCTIONS.SYSTEM_SETTINGS.INSTRUCTIONS.WINDOWS',
                            'MICROPHONE_ACCESS_INSTRUCTIONS.SYSTEM_SETTINGS.INSTRUCTIONS.WINDOWS_STEPS',
                        ]}
                    />
                    <SystemInstruction
                        content={[
                            'MICROPHONE_ACCESS_INSTRUCTIONS.SYSTEM_SETTINGS.INSTRUCTIONS.MAC',
                            'MICROPHONE_ACCESS_INSTRUCTIONS.SYSTEM_SETTINGS.INSTRUCTIONS.MAC_STEPS',
                        ]}
                    />
                </Fragment>
            ),
        },
        {
            title: 'MICROPHONE_ACCESS_INSTRUCTIONS.OTHER_SETTINGS.TITLE',
            content: (
                <InstructionList
                    instructions={[
                        'MICROPHONE_ACCESS_INSTRUCTIONS.OTHER_SETTINGS.INSTRUCTIONS.TIP_1',
                        'MICROPHONE_ACCESS_INSTRUCTIONS.OTHER_SETTINGS.INSTRUCTIONS.TIP_2',
                        'MICROPHONE_ACCESS_INSTRUCTIONS.OTHER_SETTINGS.INSTRUCTIONS.TIP_3',
                    ]}
                    isNumeric={false}
                />
            ),
        },
    ];

    return (
        <MicrophoneAccessInstructionsContainer>
            {instructions.map(({ title, content }) => (
                <Instruction key={title} title={title} content={content} />
            ))}
        </MicrophoneAccessInstructionsContainer>
    );
};

export default MicrophoneAccessInstructions;
