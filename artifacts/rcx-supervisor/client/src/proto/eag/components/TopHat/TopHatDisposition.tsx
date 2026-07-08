import type { FC } from 'react';
import { useState, useEffect, Fragment } from 'react';

import { useOldTopHat } from '@ringcx/ui';
import jQuery from 'jquery';

import translate from './../../helpers/translate';
import type { ITopHatDisposition } from './types';
import { NotificationTypes, TopHeadType } from '../../constants/Notifications';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import injector from '../../helpers/injector';

export const TopHatDisposition: FC<ITopHatDisposition> = ({
    isModelOpen,
    topHeadType,
    dispositionModel,
    $state,
    isInCRM = false,
    isVisible = true,
}) => {
    const [TopHat] = useState(useOldTopHat());
    const myCallRoute = 'base.default.phone.dialpad.detail';
    const AnalyticsSvc = injector('AnalyticsSvc');

    useEffect(() => {
        if (isVisible && isModelOpen && topHeadType) {
            let tophat: any;
            let message: string;
            if (topHeadType === TopHeadType.WARNING) {
                AnalyticsSvc.track('RCX_errorBanner_disposition', {
                    status: 'orange',
                });
                tophat = NotificationTypes.WARNING;
                message = isInCRM
                    ? translate('DISPOSITIONS.MODALS.WARNING_MSG.CRM_MSG')
                    : translate('DISPOSITIONS.MODALS.WARNING_MSG.MSG');
            } else {
                AnalyticsSvc.track('RCX_errorBanner_disposition', {
                    status: 'grey',
                });
                tophat = NotificationTypes.INFO;
                message = translate('DISPOSITIONS.MODALS.INFO_MSG.MSG');
            }
            jQuery('body').trigger('click');
            TopHat.showTopHat(tophat, message, {
                secondary: {
                    actionTitle: translate(
                        isInCRM
                            ? 'DISPOSITIONS.MODALS.WARNING_MSG.SUBMIT'
                            : 'DISPOSITIONS.MODALS.WARNING_MSG.TITLE_MSG'
                    ),
                    action: () => {
                        // when in CRM and current route is not My Call, it need jump to My Call route.
                        if (isInCRM && $state?.current.name !== myCallRoute) {
                            $state?.go(myCallRoute);
                        } else {
                            dispositionModel();
                        }
                    },
                },
            });
        } else {
            TopHat.closeTopHat();
        }
    }, [
        isModelOpen,
        topHeadType,
        dispositionModel,
        TopHat,
        $state,
        isInCRM,
        isVisible,
    ]);
    return <Fragment></Fragment>;
};

export default CreateAngularModule(
    'tophatDisposition',
    TopHatDisposition,
    ['isModelOpen', 'topHeadType', 'dispositionModel', 'isInCRM', 'isVisible'],
    ['$state']
);
