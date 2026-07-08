import type { GetInteractionDetailsParams } from './types/PhoneDetails';
import translate from '../../helpers/translate';

export function getInteractionDetailsInfo({
    details,
}: GetInteractionDetailsParams) {
    const { callInfoData = [], destination = [], source, appUrl } = details;

    const phoneLabel = translate('GENERICS.LABELS.PHONE');
    const appUrlLabel = translate('CHAT.INTERACTION.APP_URL');
    const sourceLabel = translate(
        details?.isCampaign ? 'CURRENT_CALL.CAMPAIGN' : 'CURRENT_CALL.QUEUE'
    );
    const availableDestination = destination.filter(
        (des) => !!des.displayNumber
    );
    const callInfoLabels = callInfoData.map(({ label }) => label);
    const phoneInfo = [];
    if (availableDestination.length && !callInfoLabels.includes(phoneLabel)) {
        phoneInfo.push({
            label: phoneLabel,
            value: availableDestination
                .map(({ displayNumber }) => displayNumber)
                .join(' '),
        });
    }

    const sourceInfo = [];
    if (source && !callInfoLabels.includes(sourceLabel)) {
        sourceInfo.push({
            label: sourceLabel,
            value: source,
        });
    }

    const appUrlInfo = [];
    if (appUrl && !callInfoLabels.includes(appUrlLabel)) {
        appUrlInfo.push({
            label: appUrlLabel,
            value: appUrl,
        });
    }

    return [...phoneInfo, ...sourceInfo, ...callInfoData, ...appUrlInfo];
}
