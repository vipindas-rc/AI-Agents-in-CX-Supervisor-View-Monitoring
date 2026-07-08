import type { FC } from 'react';
import { useState, useEffect, Fragment } from 'react';

import { EAG_UNSUPPORTED_BROWSERS, getBrowserInfo } from '@ringcx/shared';
import { useOldTopHat } from '@ringcx/ui';

import translate from './../../helpers/translate';
import type { ITopHat } from './types';
import { RC_SUPPORT_DOMAIN, RC_SUPPORT_LINK } from '../../constants/app';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const TopHatBrowserMessage: FC<ITopHat> = ({ isVisible = true }) => {
    const [TopHat] = useState(useOldTopHat());
    const [topHatClosed, setTopHatClosed] = useState(false);
    const browser = getBrowserInfo(EAG_UNSUPPORTED_BROWSERS);

    const handleRemoveTopHat = () => {
        setTopHatClosed(true);
    };

    useEffect(() => {
        if (isVisible && browser) {
            let browserInfoMsg: string | null = null;
            if (
                browser.unsupportedBrowser ||
                browser.unsupportedBrowserVersion
            ) {
                browserInfoMsg = translate(
                    'GENERICS.MESSAGES.BROWSER_SUPPORT.UNSUPPORTED_BROWSER'
                );
            }

            if (browserInfoMsg && !topHatClosed) {
                TopHat.info(browserInfoMsg, {
                    primary: {
                        actionTitle: translate(
                            'GENERICS.MESSAGES.BROWSER_SUPPORT.SUPPORTED_BROWSER_ANCHOR_TEXT'
                        ),
                        external:
                            browser.unsupportedBrowser ||
                            browser.unsupportedBrowserVersion,
                        action: () => {
                            window.open(
                                `${RC_SUPPORT_DOMAIN}${RC_SUPPORT_LINK.SYSTEM_REQUIREMENT}`,
                                '_blank'
                            );
                        },
                    },
                    closeWithX: {
                        action: () => {
                            TopHat.closeTopHat();
                            handleRemoveTopHat();
                        },
                    },
                });
            }
        } else {
            TopHat.closeTopHat();
        }
    }, [isVisible]);

    return <Fragment></Fragment>;
};

export default CreateAngularModule(
    'topHatBrowserMessage',
    TopHatBrowserMessage,
    ['isVisible']
);
