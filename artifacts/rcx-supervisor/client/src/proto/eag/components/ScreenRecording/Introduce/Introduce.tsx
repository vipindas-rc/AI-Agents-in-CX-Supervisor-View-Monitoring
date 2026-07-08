import { Fragment, type FC } from 'react';

import { Badge, Text } from '@ringcentral/spring-ui';
import { Trans, useTranslation } from 'react-i18next';

import CreateAngularModule from '../../../helpers/CreateAngularModule';

export const Introduce: FC = () => {
    const { t } = useTranslation();
    const optionsString = 'SCREEN_RECORDING.HINT_FOR_SS.OPTIONS';
    const options = t(optionsString, { returnObjects: true });

    return (
        <Fragment>
            <div className='modal-backdrop opacity-50' />

            <div className='border-neutral-b0 bg-neutral-w0 fixed left-[8px] top-[8px] z-[5200] flex w-[400px] flex-col gap-4 border p-6'>
                <Text
                    component='h1'
                    className='flex items-center text-xl font-medium'
                >
                    {t('SCREEN_RECORDING.HINT_FOR_SS.TITLE')}
                </Text>
                <Text component='p'>
                    {t(`SCREEN_RECORDING.HINT_FOR_SS.DESCRIPTION`)}
                </Text>

                {Object.keys(options).map((key, index) => (
                    <div key={key}>
                        <Badge
                            count={index + 1}
                            size='medium'
                            className='mr-[8px]'
                        />
                        <Trans
                            i18nKey={`${optionsString}.${key}`}
                            shouldUnescape={true}
                        />
                    </div>
                ))}

                <Text>
                    {t(
                        `SCREEN_RECORDING.HINT_FOR_SS.MULTIPLE_SCREENS_DESCRIPTION`
                    )}
                </Text>
            </div>
        </Fragment>
    );
};

export default CreateAngularModule(
    'screenRecordingIntroduce',
    Introduce,
    [],
    [],
    true
);
