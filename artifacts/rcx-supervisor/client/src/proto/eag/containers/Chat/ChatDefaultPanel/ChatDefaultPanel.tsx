import { Fragment, type FC } from 'react';

import { RcIcon, RcTypography } from '@ringcentral/juno';
import { Refresh } from '@ringcentral/juno-icon';
import { useTranslation } from 'react-i18next';

import type { IChatDefaultPanel } from './types/ChatDefaultPanel';
import { BigActionButton } from '../../../components/BigActionButton/BigActionButton';
import { Splash } from '../../../components/Splash/Splash';
import { SPLASH_TYPES } from '../../../constants/emptyStates';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export const ChatDefaultPanel: FC<IChatDefaultPanel> = ({
    $state,
    emptyAvailableQueuesSelected,
    messageText,
    messageSubText,
    iconName,
}) => {
    const { t } = useTranslation();

    const updateSessionBtn = (
        <BigActionButton
            title={t('CHAT.NO_CHATS.ALERT_UPDATE')}
            onClick={() => $state.go('base.default.updatelogin')}
        >
            <RcIcon symbol={Refresh} size='xsmall' />
            <RcTypography>{t('CHAT.NO_CHATS.ALERT_UPDATE')}</RcTypography>
        </BigActionButton>
    );

    const noMessageSelectedTextSplash = () => (
        <Splash
            {...{
                text: t(messageText),
                subText: t(messageSubText),
                splashType: emptyAvailableQueuesSelected
                    ? SPLASH_TYPES.GRAPHIC_PANEL
                    : SPLASH_TYPES.PLAIN_TEXT_PANEL,
                button: emptyAvailableQueuesSelected && updateSessionBtn,
                iconName,
            }}
        />
    );

    return <Fragment>{noMessageSelectedTextSplash()}</Fragment>;
};

export default CreateAngularModule(
    'chatDefaultPanel',
    ChatDefaultPanel,
    [],
    ['$state']
);
