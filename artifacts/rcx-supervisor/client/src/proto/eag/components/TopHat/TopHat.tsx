import type { FC } from 'react';
import { useState, useEffect, Fragment } from 'react';

import { useOldTopHat } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';
import injector from '../../helpers/injector';

interface ITopHat {
    chatRna: boolean;
    goAvailable: () => void;
}

export const TopHat: FC<ITopHat> = ({ chatRna, goAvailable }) => {
    const [TopHat] = useState(useOldTopHat());
    useEffect(() => {
        if (chatRna) {
            const translate = injector('$translate');
            const AnalyticsSvc = injector('AnalyticsSvc');

            AnalyticsSvc.track('RCX_errorBanner_missedAlert');
            TopHat.error(translate.instant('CHAT.MODALS.RNA.ALERT_MSG'), {
                primary: {
                    actionTitle: translate.instant(
                        'CHAT.MODALS.RNA.ACCEPT_CHATS_NOW'
                    ),
                    action: () => goAvailable(),
                },
            });
        } else {
            TopHat.closeTopHat();
        }
    }, [chatRna, TopHat, goAvailable]);
    return <Fragment></Fragment>;
};

export default CreateAngularModule('topHat', TopHat, [
    'chatRna',
    'goAvailable',
]);
