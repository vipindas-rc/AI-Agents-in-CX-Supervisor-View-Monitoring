import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

import { getBrowserInfo } from '@ringcx/shared';

import { NotificationTypes } from '../components/constants/Notifications';
import { TopHatPriorities } from '../components/TopHat/constants';
import type { topHatHelpers } from '../components/TopHat/helpers';
import type {
    ITopHatMessage,
    ITopHatOptions,
} from '../components/TopHat/types';
import useTopHat from '../components/TopHat/UseTopHat';

type UseVersionNotificationOptions = {
    unsupportedBrowser?: ITopHatMessage | string;
    unsupportedVersion?: ITopHatMessage | string;
    disabled?: boolean;
};

type Helpers = ReturnType<typeof topHatHelpers>;
type BrowserInfo = ReturnType<typeof getBrowserInfo>;

const NAME_PATTERN = /%n/g;
const VERSION_PATTERN = /%v/g;

const messageFormatter = (browserInfo: BrowserInfo) => (text: string) => {
    if (!browserInfo) {
        return text;
    }

    const { name, version } = browserInfo;
    const capName = name.charAt(0).toUpperCase() + name.slice(1);

    return text
        .replace(NAME_PATTERN, capName)
        .replace(VERSION_PATTERN, version);
};

const pushMessage = (
    message: string | ITopHatMessage | undefined,
    fallbackOptions: ITopHatOptions,
    topHatRef: MutableRefObject<Helpers>,
    browserInfo: BrowserInfo
) => {
    if (!message) return;

    const format = messageFormatter(browserInfo);

    if (typeof message === 'string') {
        return topHatRef.current.push(format(message), fallbackOptions);
    }

    topHatRef.current.push(format(message.text), {
        ...fallbackOptions,
        ...message.options,
    });
};

export const useBrowserVersionNotification = ({
    unsupportedBrowser,
    unsupportedVersion,
    disabled,
}: UseVersionNotificationOptions) => {
    const topHatRef = useRef(useTopHat());

    useEffect(() => {
        const browserInfo = getBrowserInfo();

        if (!browserInfo || disabled) {
            return;
        }

        const partialOptions = {
            type: NotificationTypes.INFO,
            closeWithX: { action: topHatRef.current.pop },
        };

        if (browserInfo.unsupportedBrowserVersion) {
            pushMessage(
                unsupportedVersion,
                {
                    ...partialOptions,
                    priority: TopHatPriorities.info - 1,
                },
                topHatRef,
                browserInfo
            );
        }

        if (browserInfo.unsupportedBrowser) {
            pushMessage(
                unsupportedBrowser,
                {
                    ...partialOptions,
                    priority: TopHatPriorities.info + 1,
                },
                topHatRef,
                browserInfo
            );
        }
    }, [unsupportedBrowser, unsupportedVersion, disabled]);
};
