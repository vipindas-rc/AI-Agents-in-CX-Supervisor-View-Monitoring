import { Text } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { CALL_PREVIEW_HEADER } from '../../../constants/testIds';
import {
    CallPreviewActions,
    type CallPreviewActionsProps,
} from '../CallPreviewCard/CallPreviewActions';

type CallPreviewHeaderProps = Omit<CallPreviewActionsProps, 'size'>;

export const CallPreviewHeader = (props: CallPreviewHeaderProps) => {
    const { t } = useTranslation();
    return (
        <div
            className='flex h-full items-center justify-between px-4'
            data-aid={CALL_PREVIEW_HEADER}
        >
            <Text component='p' className='typography-subtitle'>
                {t('SCRIPT.PREVIEW')}
            </Text>
            <div className='inline-flex items-center gap-2'>
                <CallPreviewActions {...props} size='large' />
            </div>
        </div>
    );
};
