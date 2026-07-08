import { useState, useEffect, type FC, Fragment } from 'react';

import { AppVersionComparison } from '@ringcx/shared';
import { useOldTopHat } from '@ringcx/ui';

import type { ITopHat } from './types';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const TopHatVersionMessage: FC<ITopHat> = ({ isVisible = true }) => {
    const [TopHat] = useState(useOldTopHat());
    useEffect(() => {
        if (isVisible) {
            AppVersionComparison.start({
                appName: 'eag',
                onUrgentDifference: () => {
                    TopHat.error(
                        translate('SOFTPHONE.MESSAGES.ROLLBACK_VERSION'),
                        {
                            primary: {
                                actionTitle: translate(
                                    'CHAT.ACTIONS.RELOAD_PAGE'
                                ),
                                action: () => window.location.reload(),
                            },
                        }
                    );
                },
                onSatisfiedDifference: () => {
                    // set data to AppUpgradeInspector
                    TopHat.info(translate('SOFTPHONE.MESSAGES.NEW_VERSION'), {
                        primary: {
                            actionTitle: translate('CHAT.ACTIONS.RELOAD_PAGE'),
                            action: () => window.location.reload(),
                        },
                        closeWithX: {
                            action: () => {
                                TopHat.closeTopHat();
                            },
                        },
                    });
                },
                onError: (reason: any) => {
                    window.console.warn(reason);
                },
            });
        }
    }, [TopHat]);
    return <Fragment></Fragment>;
};

export default CreateAngularModule(
    'topHatVersionMessage',
    TopHatVersionMessage,
    ['isVisible']
);
